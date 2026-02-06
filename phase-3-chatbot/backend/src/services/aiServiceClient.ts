import { Response } from "express";
import { setSSEHeaders, writeSSEEvent, writeSSEError, endSSEStream } from "../lib/sseStreaming";

/**
 * AI Service HTTP Client
 * Proxies chat requests to FastAPI AI service and forwards SSE streams to frontend.
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001";

export interface ChatRequestPayload {
  user_id: string;
  message: string;
  conversation_id?: string;
  context: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

/**
 * Proxy chat request to AI service with SSE streaming
 * Forwards AI response tokens to Express response stream
 */
export async function proxyChatToAIService(
  payload: ChatRequestPayload,
  res: Response
): Promise<void> {
  try {
    // Set SSE headers for streaming
    setSSEHeaders(res);

    // Make request to AI service
    const response = await fetch(`${AI_SERVICE_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI Service] HTTP ${response.status}: ${errorText}`);
      writeSSEError(
        res,
        "AI service returned an error",
        "AI_SERVICE_ERROR"
      );
      endSSEStream(res);
      return;
    }

    // Check if response is streaming (Server-Sent Events)
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("text/event-stream")) {
      // Non-streaming response (shouldn't happen, but handle gracefully)
      const data = await response.json();
      writeSSEEvent(res, { type: "token", content: data.message || "" });
      writeSSEEvent(res, {
        type: "done",
        message_id: data.message_id,
        conversation_id: data.conversation_id,
      });
      endSSEStream(res);
      return;
    }

    // Stream SSE events from AI service to frontend
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      writeSSEError(res, "AI service response is not readable", "AI_SERVICE_ERROR");
      endSSEStream(res);
      return;
    }

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Split by SSE event delimiter (\n\n)
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      // Forward each complete SSE event to frontend
      for (const line of lines) {
        if (line.trim()) {
          // Forward raw SSE line (preserves "data: " prefix)
          res.write(`${line}\n\n`);
        }
      }
    }

    // Send any remaining buffer content
    if (buffer.trim()) {
      res.write(`${buffer}\n\n`);
    }

    endSSEStream(res);

  } catch (error: any) {
    console.error("[AI Service Client] Error:", {
      timestamp: new Date().toISOString(),
      errorCode: error.code,
      errorMessage: error.message,
      errorStack: error.stack,
    });

    // Check if headers were already sent
    if (!res.headersSent) {
      setSSEHeaders(res);
    }

    // Determine error type and provide user-friendly message
    let errorCode = "INTERNAL_ERROR";
    let errorMessage = "Failed to communicate with AI service";

    if (error.code === "ECONNREFUSED") {
      errorCode = "AI_SERVICE_DOWN";
      errorMessage = "The AI service is temporarily unavailable. Please try again in a moment.";
    } else if (error.name === "AbortError" || error.name === "TimeoutError") {
      errorCode = "TIMEOUT";
      errorMessage = "The AI service took too long to respond. Please try again.";
    } else if (error.code === "ENOTFOUND") {
      errorCode = "AI_SERVICE_UNREACHABLE";
      errorMessage = "Cannot reach the AI service. Please check your connection.";
    }

    writeSSEError(res, errorMessage, errorCode);
    endSSEStream(res);
  }
}

/**
 * Health check for AI service
 */
export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.error("[AI Service] Health check failed:", error);
    return false;
  }
}

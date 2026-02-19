/**
 * Chat API Client
 * Handles communication with backend chat endpoints
 */

// Remove /api from URL since endpoints already include it
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace("/api", "");

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
}

/**
 * Fetch user's conversation history
 */
export async function fetchConversationHistory(
  userId: string
): Promise<Conversation[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations/${userId}`, {
      credentials: "include", // Send cookies for Better Auth
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.conversations || [];
  } catch (error) {
    console.error("[chatApi] Failed to fetch conversations:", error);
    throw error;
  }
}

/**
 * Fetch messages for a specific conversation
 */
export async function fetchConversationMessages(
  userId: string,
  conversationId: string
): Promise<ChatMessage[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/conversations/${userId}/${conversationId}/messages`,
      {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error("[chatApi] Failed to fetch messages:", error);
    throw error;
  }
}

/**
 * Send a chat message and receive AI response via SSE streaming
 * Implementation will be completed in Phase 4 (US1)
 *
 * @param userId - Authenticated user ID
 * @param message - User's message content
 * @param conversationId - Optional conversation ID (creates new if omitted)
 * @param onToken - Callback for each streamed token
 * @param onDone - Callback when streaming completes
 * @param onError - Callback for errors
 */
export async function sendMessage(
  userId: string,
  message: string,
  conversationId: string | null,
  onToken: (content: string) => void,
  onDone: (messageId: string, conversationId: string) => void,
  onError: (error: string, code: string) => void
): Promise<void> {
  try {
    const url = `${API_BASE_URL}/api/chat/${userId}`;
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check if response is SSE stream
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("text/event-stream")) {
      throw new Error("Expected SSE stream response");
    }

    // Parse SSE stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response body is not readable");
    }

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Split by SSE delimiter (\n\n)
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      // Parse each complete SSE event
      for (const line of lines) {
        if (!line.trim() || !line.startsWith("data: ")) {
          continue;
        }

        try {
          const jsonStr = line.slice(6); // Remove "data: " prefix
          const event = JSON.parse(jsonStr);

          if (event.type === "token") {
            onToken(event.content);
          } else if (event.type === "done") {
            onDone(event.message_id, event.conversation_id);
          } else if (event.type === "error") {
            onError(event.message, event.code);
          }
        } catch (parseError) {
          console.error("[chatApi] Failed to parse SSE event:", parseError);
        }
      }
    }
  } catch (error: any) {
    console.error("[chatApi] Failed to send message:", error);
    onError(error.message || "Failed to send message", "NETWORK_ERROR");
  }
}

/**
 * Health check for chat API
 */
export async function checkChatHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

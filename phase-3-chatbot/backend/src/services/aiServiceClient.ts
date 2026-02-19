import fetch from "node-fetch";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8001";

interface ChatRequest {
  user_id: string;
  message: string;
  conversation_id?: string;
  context: any[];
}

export async function proxyChatToAIService(
  payload: ChatRequest,
  res: any
) {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: payload.user_id,
        message: payload.message,
        conversation_id: payload.conversation_id,
        context: payload.context,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`AI Service error: ${response.status}`);
    }

    // Forward SSE stream directly to frontend
    response.body.on("data", (chunk: Buffer) => {
      res.write(chunk.toString());
    });

    response.body.on("end", () => {
      res.end();
    });

    response.body.on("error", (err: Error) => {
      console.error("[AI Proxy] Stream error:", err);
      res.end();
    });

  } catch (error) {
    console.error("❌ AI Service Proxy Error:", error);
    res.write(`data: ${JSON.stringify({ type: "error", message: "AI service unavailable", code: "AI_SERVICE_ERROR" })}\n\n`);
    res.end();
  }
}

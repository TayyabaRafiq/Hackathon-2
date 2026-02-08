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
      throw new Error("AI Service error");
    }

    // Forward SSE stream directly to frontend
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    response.body.on("data", (chunk: Buffer) => {
      res.write(chunk.toString());
    });

    response.body.on("end", () => {
      res.end();
    });
  } catch (error) {
    console.error("❌ AI Service Proxy Error:", error);
    res.write(`event: error\ndata: AI service unavailable\n\n`);
    res.end();
  }
}

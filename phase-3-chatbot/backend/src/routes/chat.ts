import { Router, Request, Response } from "express";
import { setSSEHeaders, writeSSEError, endSSEStream } from "../lib/sseStreaming";
import {
  getUserConversations,
  verifyConversationOwnership,
  loadConversationContext,
} from "../services/conversationService";
import { auth } from "../auth";
import { chatRateLimiter } from "../middleware/rateLimit";

const router = Router();

/**
 * POST /api/chat/:userId
 * Send a chat message and receive AI response via SSE streaming
 *
 * Rate limited to 30 requests per minute per user
 */
router.post("/api/chat/:userId", chatRateLimiter, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { message, conversation_id } = req.body;

    // Validate session (Better Auth)
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user || session.user.id !== userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate input
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    if (message.length > 5000) {
      return res.status(400).json({ error: "Message too long (max 5000 characters)" });
    }

    // Load conversation context from database
    let conversationIdToUse = conversation_id;
    let conversationContext: any = { messages: [] };

    if (conversationIdToUse) {
      // Verify conversation ownership
      const isOwner = await verifyConversationOwnership(conversationIdToUse, userId);
      if (!isOwner) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Load context
      conversationContext = await loadConversationContext(conversationIdToUse, 50);
    } else {
      // Create new conversation
      const { createConversation, saveMessage } = await import("../services/conversationService");
      conversationIdToUse = await createConversation(userId, message);
    }

    // Save user message to database
    const { saveMessage } = await import("../services/conversationService");
    await saveMessage(conversationIdToUse, userId, "user", message);

    // Proxy to AI service with SSE forwarding
    const { proxyChatToAIService } = await import("../services/aiServiceClient");

    // Set up SSE streaming
    setSSEHeaders(res);

    // Build context for AI service
    const context = conversationContext.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Stream response from AI service
    try {
      // Track assistant response for persistence
      let assistantResponse = "";

      // Create custom response handler to capture response
      const originalWrite = res.write.bind(res);
      res.write = (chunk: any, ...args: any[]): boolean => {
        // Parse SSE events to capture assistant response
        const chunkStr = chunk.toString();
        if (chunkStr.startsWith("data: ")) {
          try {
            const eventData = JSON.parse(chunkStr.slice(6));
            if (eventData.type === "token") {
              assistantResponse += eventData.content;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
        return originalWrite(chunk, ...args);
      };

      // Proxy to AI service
      await proxyChatToAIService(
        {
          user_id: userId,
          message,
          conversation_id: conversationIdToUse,
          context,
        },
        res
      );

      // Save assistant response to database
      if (assistantResponse) {
        await saveMessage(conversationIdToUse, userId, "assistant", assistantResponse);
      }
    } catch (error: any) {
      console.error("[POST /api/chat/:userId] Proxy error:", error);
      writeSSEError(res, error.message || "Failed to communicate with AI service", "AI_SERVICE_ERROR");
      endSSEStream(res);
    }

  } catch (error: any) {
    // Comprehensive error logging with context
    console.error("[POST /api/chat/:userId] Error:", {
      timestamp: new Date().toISOString(),
      userId: req.params.userId,
      messageLength: req.body?.message?.length || 0,
      conversationId: req.body?.conversation_id || "new",
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
    });

    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    } else {
      setSSEHeaders(res);
      writeSSEError(res, "Internal server error", "INTERNAL_ERROR");
      endSSEStream(res);
    }
  }
});

/**
 * GET /api/conversations/:userId
 * Get user's conversation history with message counts
 */
router.get("/api/conversations/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Validate session (Better Auth)
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user || session.user.id !== userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user's conversations from database
    const conversations = await getUserConversations(userId);

    res.json({
      conversations,
      total: conversations.length,
    });

  } catch (error: any) {
    console.error("[GET /api/conversations/:userId] Error:", {
      timestamp: new Date().toISOString(),
      userId: req.params.userId,
      errorMessage: error.message,
      errorStack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/conversations/:userId/:conversationId/messages
 * Get messages for a specific conversation
 */
router.get("/api/conversations/:userId/:conversationId/messages", async (req: Request, res: Response) => {
  try {
    const { userId, conversationId } = req.params;

    // Validate session (Better Auth)
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user || session.user.id !== userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify conversation ownership
    const isOwner = await verifyConversationOwnership(conversationId, userId);
    if (!isOwner) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Load conversation context
    const context = await loadConversationContext(conversationId, 50);

    res.json({
      conversationId: context.conversationId,
      messages: context.messages,
      total: context.messages.length,
    });

  } catch (error: any) {
    console.error("[GET /api/conversations/:userId/:conversationId/messages] Error:", {
      timestamp: new Date().toISOString(),
      userId: req.params.userId,
      conversationId: req.params.conversationId,
      errorMessage: error.message,
      errorStack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

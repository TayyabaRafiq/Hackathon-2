import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Conversation Service
 * Handles conversation and message persistence for chat functionality.
 */

export interface ConversationContext {
  conversationId: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
  }>;
}

/**
 * Load conversation context from database
 * Returns last N messages ordered by creation time (oldest first)
 */
export async function loadConversationContext(
  conversationId: string,
  limit: number = 50
): Promise<ConversationContext> {
  // Fetch last N messages (most recent first, then reverse for chronological order)
  // This ensures we get the most recent conversation context for long conversations
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      role: true,
      content: true,
      createdAt: true,
    },
  });

  // Reverse to get chronological order (oldest to newest)
  const chronologicalMessages = messages.reverse();

  return {
    conversationId,
    messages: chronologicalMessages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
      createdAt: msg.createdAt,
    })),
  };
}

/**
 * Create a new conversation
 * Auto-generates title from first message (truncated to 50 chars)
 */
export async function createConversation(
  userId: string,
  firstMessage: string
): Promise<string> {
  // Generate title from first message (truncate to 50 chars)
  const title = firstMessage.length > 50
    ? firstMessage.substring(0, 47) + "..."
    : firstMessage;

  const conversation = await prisma.conversation.create({
    data: {
      userId,
      title,
      lastMessageAt: new Date(),
    },
  });

  return conversation.id;
}

/**
 * Save a message to conversation
 */
export async function saveMessage(
  conversationId: string,
  userId: string,
  role: "user" | "assistant",
  content: string
): Promise<string> {
  const message = await prisma.message.create({
    data: {
      conversationId,
      userId,
      role,
      content,
    },
  });

  // Update conversation's lastMessageAt timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  return message.id;
}

/**
 * Get user's conversations with message counts
 * Ordered by last message time (most recent first)
 */
export async function getUserConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { lastMessageAt: "desc" },
    include: {
      _count: {
        select: { messages: true },
      },
    },
  });

  return conversations.map((conv) => ({
    id: conv.id,
    title: conv.title,
    lastMessageAt: conv.lastMessageAt,
    messageCount: conv._count.messages,
    createdAt: conv.createdAt,
  }));
}

/**
 * Check if conversation exists and belongs to user
 */
export async function verifyConversationOwnership(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  return !!conversation;
}

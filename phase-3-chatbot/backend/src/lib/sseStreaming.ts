import { Response } from "express";

/**
 * SSE Streaming Helper
 * Utilities for Server-Sent Events streaming for real-time AI responses.
 */

/**
 * Set headers for SSE streaming
 */
export function setSSEHeaders(res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
}

/**
 * Write SSE event to response stream
 * Format: "data: {JSON}\n\n"
 */
export function writeSSEEvent(res: Response, data: object): void {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * End SSE stream
 */
export function endSSEStream(res: Response): void {
  res.end();
}

/**
 * Write SSE error event
 */
export function writeSSEError(
  res: Response,
  error: string,
  code: string = "INTERNAL_ERROR"
): void {
  writeSSEEvent(res, {
    type: "error",
    message: error,
    code,
  });
}

/**
 * Write SSE token event (for streaming AI response)
 */
export function writeSSEToken(res: Response, content: string): void {
  writeSSEEvent(res, {
    type: "token",
    content,
  });
}

/**
 * Write SSE done event (completion signal)
 */
export function writeSSEDone(
  res: Response,
  messageId: string,
  conversationId: string
): void {
  writeSSEEvent(res, {
    type: "done",
    message_id: messageId,
    conversation_id: conversationId,
  });
}

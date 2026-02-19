"use client";

import { useState, useEffect, useRef, Component, ReactNode } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Avatar,
  ConversationHeader,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { FiX, FiPlus } from "react-icons/fi";
import {
  fetchConversationHistory,
  fetchConversationMessages,
  sendMessage,
} from "../../lib/chatApi";
import { useSession } from "@/lib/auth";

interface ChatWindowProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

/**
 * Chat Window Component
 * Displays conversation history and handles message input
 */
function ChatWindow({ onClose }: ChatWindowProps) {
  const { data: session, isPending } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [showConversations, setShowConversations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load conversation history when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversationHistory(conversationId);
    }
  }, [conversationId]);

  const loadConversations = async () => {
    try {
      if (!session?.user?.id) {
        console.error("User not authenticated");
        setError("Please sign in to access chat");
        return;
      }

      const convs = await fetchConversationHistory(session.user.id);
      setConversations(convs);
    } catch (error: any) {
      console.error("Failed to load conversations:", error);
      setError("Failed to load conversation history");
    }
  };

  const loadConversationHistory = async (convId: string) => {
    try {
      setIsLoading(true);

      if (!session?.user?.id) {
        setError("Please sign in to access chat");
        return;
      }

      const msgs = await fetchConversationMessages(session.user.id, convId);
      setMessages(
        msgs.map((msg: any) => ({
          id: Math.random().toString(),
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
        }))
      );
    } catch (error: any) {
      console.error("Failed to load conversation history:", error);
      setError("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (message: string) => {
    if (!message.trim() || message.length > 5000) {
      setError("Message must be between 1 and 5000 characters");
      return;
    }

    setInputMessage("");
    setIsLoading(true);
    setError(null);

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Create placeholder for streaming assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      if (!session?.user?.id) {
        setError("Please sign in to send messages");
        setIsLoading(false);
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
        return;
      }

      // Stream AI response
      await sendMessage(
        session.user.id,
        message,
        conversationId,
        // onToken callback - append to streaming message
        (token: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + token }
                : msg
            )
          );
        },
        // onDone callback - finalize message
        (messageId: string, newConversationId: string) => {
          setConversationId(newConversationId);
          setIsLoading(false);
          // Reload conversations list
          loadConversations();
        },
        // onError callback - show error
        (errorMessage: string, code: string) => {
          setError(errorMessage);
          setIsLoading(false);
          // Remove failed assistant message
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
        }
      );
    } catch (error: any) {
      console.error("Failed to send message:", error);
      setError("Failed to send message. Please try again.");
      setIsLoading(false);
      // Remove failed assistant message
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
    }
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setError(null);
  };

  const selectConversation = (convId: string) => {
    setConversationId(convId);
    setShowConversations(false);
  };

  // Show loading state while session is being fetched
  if (isPending) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-2">⏳</div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not authenticated
  if (!session?.user) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Authentication Required</h3>
          <p className="text-sm text-gray-600 mb-4">
            Please sign in to use the chat feature
          </p>
          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg">🤖</div>
          <div>
            <h3 className="font-semibold">Todo Assistant</h3>
            <p className="text-xs opacity-80">AI-powered task management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConversations(!showConversations)}
            className="p-2 hover:bg-blue-600 rounded"
            title="View conversations"
          >
            <span className="text-sm">💬</span>
          </button>
          <button
            onClick={handleNewConversation}
            className="p-2 hover:bg-blue-600 rounded"
            title="New conversation"
          >
            <FiPlus size={18} />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-blue-600 rounded">
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Conversations List (Sidebar) */}
      {showConversations && (
        <div className="bg-gray-50 border-b p-2 max-h-40 overflow-y-auto">
          <h4 className="text-xs font-semibold text-gray-600 mb-2">Recent Conversations</h4>
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-500">No conversations yet</p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className="w-full text-left p-2 text-xs bg-white hover:bg-blue-50 rounded border"
                >
                  <div className="font-medium truncate">{conv.title || "Untitled"}</div>
                  <div className="text-gray-500 text-[10px]">
                    {conv.messageCount} messages • {new Date(conv.lastMessageAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 text-sm border-b">
          {error}
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <MainContainer>
          <ChatContainer>
            <MessageList
              typingIndicator={isLoading ? <TypingIndicator content="Assistant is typing..." /> : null}
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500 p-4">
                    <p className="text-sm mb-2">👋 Welcome to Todo Assistant!</p>
                    <p className="text-xs">Start a conversation to manage your tasks with AI.</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <Message
                    key={msg.id}
                    model={{
                      message: msg.content,
                      sentTime: msg.createdAt,
                      sender: msg.role === "user" ? "You" : "Assistant",
                      direction: msg.role === "user" ? "outgoing" : "incoming",
                      position: "single",
                    }}
                  >
                    {msg.role === "assistant" && (
                      <Avatar src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%233B82F6'/%3E%3Ctext x='20' y='28' text-anchor='middle' font-size='18' fill='white'%3E🤖%3C/text%3E%3C/svg%3E" name="Assistant" size="sm" />
                    )}
                  </Message>
                ))
              )}
            </MessageList>
            <MessageInput
              placeholder="Type a message (e.g., 'Add task: Buy groceries')"
              value={inputMessage}
              onChange={(val) => setInputMessage(val)}
              onSend={handleSend}
              disabled={isLoading}
              attachButton={false}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

/**
 * Error Boundary for Chat Window
 * Catches React errors and displays fallback UI
 */
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ChatErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ChatWindow Error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-gray-50">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              The chat encountered an error. You can try reloading the page or resetting the chat.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Reset Chat
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Reload Page
              </button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-gray-500 cursor-pointer">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-40">
                  {this.state.error.message}
                  {"\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap ChatWindow with Error Boundary
export default function ChatWindowWithErrorBoundary(props: ChatWindowProps) {
  return (
    <ChatErrorBoundary>
      <ChatWindow {...props} />
    </ChatErrorBoundary>
  );
}

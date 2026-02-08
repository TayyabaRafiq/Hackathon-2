# ChatKit AI Integration

**Skill ID:** `chatkit-ai-integration`
**Category:** Frontend Engineering
**Last Updated:** 2026-02-05

## Description

Integrate a chat UI component library with an AI chatbot backend API to build responsive, production-ready conversational interfaces. This skill covers:
- Sending user messages to backend
- Managing conversation state (conversation_id)
- Displaying AI responses in real-time
- Loading states and streaming support
- Comprehensive error handling
- API configuration and authentication

## When to Use This Skill

- Building chat interfaces for AI assistants or chatbots
- Integrating React/Next.js frontends with FastAPI chat backends
- Implementing real-time streaming message displays
- Creating multi-conversation chat applications
- Adding chat features to existing web applications

## Prerequisites

**Required:**
- React 18+ or Next.js 13+
- TypeScript (recommended)
- Familiarity with React hooks (useState, useEffect, useRef)
- Basic understanding of REST APIs and fetch
- Chat UI library (e.g., @chatscope/chat-ui-kit-react, react-chat-widget, or custom)

**Backend API Requirements:**
- POST `/api/{user_id}/chat` endpoint that accepts messages
- Optional: Streaming response support (SSE or chunked)
- CORS configured for your frontend origin

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           Frontend (React/Next.js)          │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │         Chat UI Component             │ │
│  │  - Message input                      │ │
│  │  - Message list                       │ │
│  │  - Loading indicators                 │ │
│  │  - Error displays                     │ │
│  └───────────┬───────────────────────────┘ │
│              │                               │
│  ┌───────────▼───────────────────────────┐ │
│  │      State Management Layer           │ │
│  │  - messages[]                         │ │
│  │  - conversation_id                    │ │
│  │  - isLoading, error                   │ │
│  └───────────┬───────────────────────────┘ │
│              │                               │
│  ┌───────────▼───────────────────────────┐ │
│  │       API Integration Layer           │ │
│  │  - sendMessage()                      │ │
│  │  - loadConversation()                 │ │
│  │  - handleStreaming()                  │ │
│  └───────────┬───────────────────────────┘ │
└──────────────┼───────────────────────────────┘
               │ HTTP/HTTPS
               ▼
┌──────────────────────────────────────────────┐
│        Backend API (FastAPI)                 │
│  POST /api/{user_id}/chat                    │
│  GET  /api/{user_id}/conversations           │
└──────────────────────────────────────────────┘
```

---

## Implementation Process

### Phase 1: Project Setup and Dependencies

#### Step 1.1: Install Required Packages

```bash
# Using npm
npm install @chatscope/chat-ui-kit-react \
            @chatscope/chat-ui-kit-styles \
            axios

# Or using yarn
yarn add @chatscope/chat-ui-kit-react \
         @chatscope/chat-ui-kit-styles \
         axios

# TypeScript types (if using TypeScript)
npm install --save-dev @types/react @types/node
```

**Alternative Chat Libraries:**
- `react-chat-elements` - Lightweight, customizable
- `stream-chat-react` - Full-featured, includes backend
- Custom implementation - Maximum control

#### Step 1.2: Environment Configuration

```bash
# .env.local (Next.js) or .env (React)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_USER_ID=demo-user-123

# For production
# NEXT_PUBLIC_API_BASE_URL=https://api.yourapp.com
```

**Quality Checks:**
- ✅ All API URLs use environment variables (never hardcoded)
- ✅ Variables prefixed with `NEXT_PUBLIC_` (Next.js) or `REACT_APP_` (CRA)
- ✅ `.env.local` added to `.gitignore`
- ✅ Separate configs for dev/staging/production

---

### Phase 2: Type Definitions and Interfaces

#### Step 2.1: Define Message Types

```typescript
// types/chat.ts

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  conversation_id?: string;
}

export interface Conversation {
  id: string;
  title: string;
  last_message_at: Date;
  created_at: Date;
}

export interface ChatAPIResponse {
  message_id: string;
  content: string;
  conversation_id: string;
}

export interface ChatAPIError {
  detail: string;
  status_code: number;
}
```

**Quality Checks:**
- ✅ Strong typing for all message properties
- ✅ Separate types for API requests/responses
- ✅ Error type definitions for type-safe error handling
- ✅ ISO timestamp strings converted to Date objects

---

### Phase 3: API Integration Layer

#### Step 3.1: Create API Client

```typescript
// lib/api/chatApi.ts
import axios, { AxiosError } from 'axios';
import type { Message, ChatAPIResponse, ChatAPIError } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export class ChatAPIClient {
  private userId: string;
  private baseURL: string;

  constructor(userId: string) {
    this.userId = userId;
    this.baseURL = API_BASE_URL;
  }

  /**
   * Send a message to the chat backend
   *
   * @param message - User message content
   * @param conversationId - Optional conversation ID (for multi-conversation apps)
   * @returns Promise with assistant response
   */
  async sendMessage(
    message: string,
    conversationId?: string
  ): Promise<ChatAPIResponse> {
    try {
      const response = await axios.post<ChatAPIResponse>(
        `${this.baseURL}/api/${this.userId}/chat`,
        {
          message,
          conversation_id: conversationId, // Optional, backend may ignore
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 second timeout
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ChatAPIError>;

        if (axiosError.response) {
          // Server responded with error
          throw new Error(
            axiosError.response.data.detail ||
            `Server error: ${axiosError.response.status}`
          );
        } else if (axiosError.request) {
          // No response received
          throw new Error('No response from server. Please check your connection.');
        }
      }

      throw new Error('Failed to send message. Please try again.');
    }
  }

  /**
   * Send message with streaming support (SSE)
   *
   * @param message - User message content
   * @param onToken - Callback for each streamed token
   * @param onComplete - Callback when stream completes
   * @param onError - Callback for errors
   */
  async sendMessageStreaming(
    message: string,
    onToken: (token: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/${this.userId}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        onToken(chunk);
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Streaming failed'));
    }
  }

  /**
   * Load conversation history (if backend supports GET endpoint)
   *
   * @param conversationId - Conversation ID to load
   * @returns Promise with message history
   */
  async loadConversation(conversationId: string): Promise<Message[]> {
    try {
      const response = await axios.get<{ messages: Message[] }>(
        `${this.baseURL}/api/${this.userId}/conversations/${conversationId}`,
        { timeout: 10000 }
      );

      return response.data.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error('Failed to load conversation:', error);
      return [];
    }
  }
}

// Export singleton instance
export const chatApi = new ChatAPIClient(
  process.env.NEXT_PUBLIC_USER_ID || 'default-user'
);
```

**Quality Checks:**
- ✅ Axios error handling with typed errors
- ✅ Timeout configured (prevents hanging requests)
- ✅ Streaming support via fetch API
- ✅ Clear error messages for users
- ✅ Singleton pattern for API client

---

### Phase 4: Chat Component Implementation

#### Step 4.1: Main Chat Component

```typescript
// components/ChatInterface.tsx
'use client'; // Next.js 13+ App Router

import React, { useState, useRef, useEffect } from 'react';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message as ChatMessage,
  MessageInput,
  TypingIndicator,
  Avatar,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { chatApi } from '@/lib/api/chatApi';
import type { Message } from '@/types/chat';
import { ErrorBanner } from './ErrorBanner';

export default function ChatInterface() {
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Refs
  const messageListRef = useRef<HTMLDivElement>(null);
  const streamingMessageRef = useRef<string>('');

  /**
   * Handle user sending a message
   */
  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    // Clear previous errors
    setError(null);

    // Add user message to UI immediately (optimistic update)
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Clear streaming buffer
    streamingMessageRef.current = '';

    try {
      // Option 1: Non-streaming (simpler)
      await handleNonStreamingResponse(messageText);

      // Option 2: Streaming (better UX)
      // await handleStreamingResponse(messageText);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);

      // Remove user message on error (optional)
      // setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle non-streaming response
   */
  const handleNonStreamingResponse = async (messageText: string) => {
    const response = await chatApi.sendMessage(messageText, conversationId || undefined);

    // Store conversation ID for future messages
    if (response.conversation_id) {
      setConversationId(response.conversation_id);
    }

    // Add assistant message
    const assistantMessage: Message = {
      id: response.message_id || `assistant-${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
  };

  /**
   * Handle streaming response
   */
  const handleStreamingResponse = async (messageText: string) => {
    // Add placeholder for assistant message
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    await chatApi.sendMessageStreaming(
      messageText,
      // onToken: Update message content with new token
      (token) => {
        streamingMessageRef.current += token;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: streamingMessageRef.current }
              : msg
          )
        );
      },
      // onComplete
      () => {
        console.log('Streaming completed');
        streamingMessageRef.current = '';
      },
      // onError
      (error) => {
        setError(error.message);
        // Remove incomplete assistant message
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
      }
    );
  };

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div style={{ position: 'relative', height: '600px' }}>
      <MainContainer>
        <ChatContainer>
          <MessageList
            typingIndicator={isLoading ? <TypingIndicator content="AI is thinking..." /> : null}
            ref={messageListRef}
          >
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                model={{
                  message: msg.content,
                  sentTime: msg.timestamp.toISOString(),
                  sender: msg.role === 'user' ? 'You' : 'AI Assistant',
                  direction: msg.role === 'user' ? 'outgoing' : 'incoming',
                  position: 'single',
                }}
              >
                {msg.role === 'assistant' && (
                  <Avatar
                    src="/ai-avatar.png"
                    name="AI"
                    style={{ width: '32px', height: '32px' }}
                  />
                )}
              </ChatMessage>
            ))}
          </MessageList>

          <MessageInput
            placeholder="Type your message here..."
            onSend={handleSendMessage}
            disabled={isLoading}
            attachButton={false}
          />
        </ChatContainer>
      </MainContainer>

      {/* Error Banner */}
      {error && (
        <ErrorBanner
          message={error}
          onDismiss={() => setError(null)}
        />
      )}
    </div>
  );
}
```

**Quality Checks:**
- ✅ Optimistic UI updates (user message shows immediately)
- ✅ Loading state with typing indicator
- ✅ Error handling with user-friendly messages
- ✅ Auto-scroll to bottom on new messages
- ✅ Disabled input during loading
- ✅ Conversation ID persisted across messages

---

#### Step 4.2: Error Banner Component

```typescript
// components/ErrorBanner.tsx
import React from 'react';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#ff4444',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
        maxWidth: '90%',
      }}
    >
      <span>{message}</span>
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '0 4px',
        }}
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  );
}
```

---

### Phase 5: Advanced Features

#### Step 5.1: Message Persistence (LocalStorage)

```typescript
// hooks/useChatPersistence.ts
import { useEffect } from 'react';
import type { Message } from '@/types/chat';

const STORAGE_KEY = 'chat-messages';

export function useChatPersistence(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  // Load messages from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to parse stored messages:', error);
      }
    }
  }, [setMessages]);

  // Save messages to localStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Clear messages function
  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { clearMessages };
}
```

**Usage:**

```typescript
// In ChatInterface.tsx
import { useChatPersistence } from '@/hooks/useChatPersistence';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { clearMessages } = useChatPersistence(messages, setMessages);

  // ... rest of component
}
```

---

#### Step 5.2: Retry Logic with Exponential Backoff

```typescript
// lib/api/retryUtils.ts

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on client errors (4xx)
      if (lastError.message.includes('400') || lastError.message.includes('401')) {
        throw lastError;
      }

      if (attempt < maxRetries - 1) {
        // Calculate delay with exponential backoff
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

**Usage:**

```typescript
// In chatApi.ts
import { retryWithBackoff } from './retryUtils';

async sendMessage(message: string): Promise<ChatAPIResponse> {
  return retryWithBackoff(
    async () => {
      const response = await axios.post(/* ... */);
      return response.data;
    },
    { maxRetries: 3, baseDelay: 1000 }
  );
}
```

---

#### Step 5.3: Multi-Conversation Support

```typescript
// components/ConversationSidebar.tsx
import React, { useState, useEffect } from 'react';
import type { Conversation } from '@/types/chat';
import { chatApi } from '@/lib/api/chatApi';

interface ConversationSidebarProps {
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

export function ConversationSidebar({
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      // Implement backend endpoint: GET /api/{user_id}/conversations
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${process.env.NEXT_PUBLIC_USER_ID}/conversations`
      );
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '250px',
        borderRight: '1px solid #ddd',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <button
        onClick={onNewConversation}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        + New Conversation
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              style={{
                padding: '12px',
                marginBottom: '8px',
                backgroundColor:
                  selectedConversationId === conv.id ? '#e3f2fd' : '#f5f5f5',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {conv.title || 'Untitled'}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {new Date(conv.last_message_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Phase 6: Error Handling Strategies

#### Error Types and Handling

| Error Type | Status Code | User Message | Action |
|------------|-------------|--------------|--------|
| Network Error | N/A | "Connection lost. Check your internet." | Show reconnect button |
| Server Error | 500 | "Server temporarily unavailable." | Auto-retry with backoff |
| Timeout | 408 | "Request timed out. Please try again." | Allow manual retry |
| Bad Request | 400 | "Invalid message format." | Show input validation |
| Unauthorized | 401 | "Session expired. Please log in." | Redirect to login |
| Rate Limited | 429 | "Too many requests. Please wait." | Disable input temporarily |

#### Error Handler Component

```typescript
// lib/errorHandler.ts

export class ChatError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

export function handleChatError(error: unknown): ChatError {
  if (error instanceof ChatError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    switch (status) {
      case 400:
        return new ChatError(
          detail || 'Invalid request. Please check your message.',
          400,
          false
        );
      case 401:
        return new ChatError('Please log in to continue.', 401, false);
      case 429:
        return new ChatError(
          'Too many requests. Please wait a moment.',
          429,
          true
        );
      case 500:
        return new ChatError(
          'Server error. We\'re working on it.',
          500,
          true
        );
      case 503:
        return new ChatError(
          'Service temporarily unavailable.',
          503,
          true
        );
      default:
        return new ChatError(
          detail || 'An unexpected error occurred.',
          status,
          true
        );
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      return new ChatError('Request timed out. Please try again.', 408, true);
    }
    if (error.message.includes('network')) {
      return new ChatError('Network error. Check your connection.', undefined, true);
    }
  }

  return new ChatError('An unexpected error occurred.', undefined, true);
}
```

**Usage:**

```typescript
// In ChatInterface.tsx
import { handleChatError } from '@/lib/errorHandler';

const handleSendMessage = async (messageText: string) => {
  try {
    await handleNonStreamingResponse(messageText);
  } catch (err) {
    const chatError = handleChatError(err);
    setError(chatError.message);

    // Show retry button only for retryable errors
    if (chatError.retryable) {
      setShowRetryButton(true);
    }
  }
};
```

---

### Phase 7: Loading States and UX Patterns

#### Loading State Variants

```typescript
// components/LoadingStates.tsx

export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '4px', padding: '12px' }}>
      <div className="typing-dot" style={dotStyle} />
      <div className="typing-dot" style={{ ...dotStyle, animationDelay: '0.2s' }} />
      <div className="typing-dot" style={{ ...dotStyle, animationDelay: '0.4s' }} />
    </div>
  );
}

const dotStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  backgroundColor: '#999',
  borderRadius: '50%',
  animation: 'typing-bounce 1.4s infinite ease-in-out',
};

// Add to global CSS
/*
@keyframes typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}
*/

export function SkeletonMessage() {
  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '8px',
      }}
    >
      <div
        style={{
          height: '12px',
          backgroundColor: '#ddd',
          borderRadius: '4px',
          marginBottom: '8px',
          width: '80%',
          animation: 'pulse 1.5s infinite',
        }}
      />
      <div
        style={{
          height: '12px',
          backgroundColor: '#ddd',
          borderRadius: '4px',
          width: '60%',
          animation: 'pulse 1.5s infinite',
        }}
      />
    </div>
  );
}

// Add to global CSS
/*
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
*/
```

---

## Complete UI Flow Example

### User Journey: Sending a Message

```
1. User types message in MessageInput
   └─> Input validation (min length, max length)

2. User presses Enter or clicks Send
   └─> handleSendMessage() called

3. Optimistic UI update
   ├─> User message added to messages[]
   ├─> MessageList scrolls to bottom
   └─> Input cleared and disabled

4. Loading state displayed
   └─> TypingIndicator shown ("AI is thinking...")

5. API request sent
   └─> POST /api/{user_id}/chat
       Body: { "message": "user input" }

6. Backend processes request
   ├─> Loads conversation history
   ├─> Calls AI agent
   └─> Streams or returns response

7a. SUCCESS: Response received
    ├─> Assistant message added to messages[]
    ├─> conversation_id stored for next message
    ├─> Loading state removed
    ├─> Input re-enabled
    └─> Auto-scroll to new message

7b. ERROR: Request failed
    ├─> Error message displayed in ErrorBanner
    ├─> Retry button shown (if retryable)
    ├─> User message remains in UI
    ├─> Loading state removed
    └─> Input re-enabled
```

---

## API Configuration Patterns

### Pattern 1: Domain-Based API URL

```typescript
// lib/config.ts

function getApiBaseUrl(): string {
  // Development
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  }

  // Production - use current domain
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Server-side fallback
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yourapp.com';
}

export const API_CONFIG = {
  baseURL: getApiBaseUrl(),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

### Pattern 2: API Key Configuration (for authenticated APIs)

```typescript
// lib/api/authApi.ts

export class AuthenticatedChatAPI extends ChatAPIClient {
  private apiKey: string;

  constructor(userId: string, apiKey: string) {
    super(userId);
    this.apiKey = apiKey;
  }

  async sendMessage(message: string): Promise<ChatAPIResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/${this.userId}/chat`,
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            // Or use API key header
            // 'X-API-Key': this.apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      // Handle auth errors
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your credentials.');
      }
      throw error;
    }
  }
}
```

### Pattern 3: Environment-Specific Configuration

```typescript
// lib/config/apiConfig.ts

interface APIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  enableStreaming: boolean;
}

const configs: Record<string, APIConfig> = {
  development: {
    baseURL: 'http://localhost:8000',
    timeout: 120000, // Longer timeout for debugging
    retryAttempts: 1,
    enableStreaming: true,
  },
  staging: {
    baseURL: 'https://staging-api.yourapp.com',
    timeout: 60000,
    retryAttempts: 2,
    enableStreaming: true,
  },
  production: {
    baseURL: 'https://api.yourapp.com',
    timeout: 30000,
    retryAttempts: 3,
    enableStreaming: true,
  },
};

export function getAPIConfig(): APIConfig {
  const env = process.env.NEXT_PUBLIC_ENV || 'development';
  return configs[env] || configs.development;
}
```

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

```typescript
// __tests__/ChatInterface.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from '@/components/ChatInterface';
import { chatApi } from '@/lib/api/chatApi';

// Mock API client
jest.mock('@/lib/api/chatApi');

describe('ChatInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sends message when user submits', async () => {
    const mockResponse = {
      message_id: '123',
      content: 'Hello! How can I help?',
      conversation_id: 'conv-1',
    };

    (chatApi.sendMessage as jest.Mock).mockResolvedValue(mockResponse);

    render(<ChatInterface />);

    const input = screen.getByPlaceholderText(/type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(chatApi.sendMessage).toHaveBeenCalledWith('Hello', undefined);
    });

    expect(screen.getByText('Hello! How can I help?')).toBeInTheDocument();
  });

  test('displays error message on API failure', async () => {
    (chatApi.sendMessage as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(<ChatInterface />);

    const input = screen.getByPlaceholderText(/type your message/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(input);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  test('shows loading indicator while waiting for response', async () => {
    (chatApi.sendMessage as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<ChatInterface />);

    const input = screen.getByPlaceholderText(/type your message/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(input);

    expect(screen.getByText(/ai is thinking/i)).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/chat-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from '@/components/ChatInterface';
import { server } from '@/mocks/server'; // MSW mock server
import { rest } from 'msw';

describe('Chat Flow Integration', () => {
  test('complete chat conversation flow', async () => {
    render(<ChatInterface />);

    // Send first message
    const input = screen.getByPlaceholderText(/type your message/i);
    fireEvent.change(input, { target: { value: 'What is the weather?' } });
    fireEvent.submit(input);

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText(/sunny and 72/i)).toBeInTheDocument();
    });

    // Send follow-up message
    fireEvent.change(input, { target: { value: 'Should I bring an umbrella?' } });
    fireEvent.submit(input);

    // Wait for second response
    await waitFor(() => {
      expect(screen.getByText(/no need/i)).toBeInTheDocument();
    });

    // Verify conversation persisted
    expect(screen.getAllByRole('listitem')).toHaveLength(4); // 2 user + 2 assistant
  });
});
```

---

## Production Checklist

### Performance
- [ ] Messages paginated (load last 50, infinite scroll for history)
- [ ] API requests debounced (prevent double-sends)
- [ ] Images/avatars lazy loaded
- [ ] Virtual scrolling for long conversations (react-window)
- [ ] LocalStorage size monitored (clear old conversations)

### Security
- [ ] API keys stored in environment variables (never in code)
- [ ] User input sanitized (prevent XSS)
- [ ] HTTPS enforced in production
- [ ] CORS configured correctly on backend
- [ ] Content Security Policy headers set

### UX/Accessibility
- [ ] Keyboard navigation supported (Enter to send, Esc to clear)
- [ ] Screen reader friendly (ARIA labels)
- [ ] Loading states visible and clear
- [ ] Error messages actionable
- [ ] Mobile responsive design
- [ ] Focus management (input focused after send)

### Observability
- [ ] Error logging (Sentry, LogRocket)
- [ ] Analytics tracking (message sent, error occurred)
- [ ] Performance monitoring (API response times)
- [ ] User feedback mechanism

### Reliability
- [ ] Offline detection and messaging
- [ ] Auto-reconnect on connection loss
- [ ] Retry failed messages
- [ ] Message queue for offline sends
- [ ] Graceful degradation (disable streaming if unsupported)

---

## Common Pitfalls

### ❌ Pitfall 1: Not Handling Streaming Errors

```typescript
// WRONG: No error handling in stream
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read(); // ❌ Can throw
  if (done) break;
  onToken(decoder.decode(value));
}
```

**Fix:**

```typescript
// CORRECT: Try-catch around stream reading
try {
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onToken(decoder.decode(value, { stream: true }));
  }
} catch (error) {
  onError(error);
}
```

### ❌ Pitfall 2: Forgetting to Clear Input After Send

```typescript
// WRONG: Input not cleared
const handleSendMessage = (text: string) => {
  sendToAPI(text);
  // Input still shows old text ❌
};
```

**Fix:**

```typescript
// CORRECT: Clear input in MessageInput component
<MessageInput
  value={inputValue}
  onChange={setInputValue}
  onSend={(text) => {
    handleSendMessage(text);
    setInputValue(''); // ✅ Clear input
  }}
/>
```

### ❌ Pitfall 3: Not Persisting conversation_id

```typescript
// WRONG: conversation_id not saved
const handleSendMessage = async (message: string) => {
  const response = await chatApi.sendMessage(message);
  // conversation_id lost ❌
};
```

**Fix:**

```typescript
// CORRECT: Save conversation_id for next message
const [conversationId, setConversationId] = useState<string | null>(null);

const handleSendMessage = async (message: string) => {
  const response = await chatApi.sendMessage(message, conversationId);
  if (response.conversation_id) {
    setConversationId(response.conversation_id); // ✅
  }
};
```

### ❌ Pitfall 4: Infinite Re-renders with useEffect

```typescript
// WRONG: Missing dependency array
useEffect(() => {
  scrollToBottom();
}); // ❌ Runs on every render
```

**Fix:**

```typescript
// CORRECT: Depend on messages
useEffect(() => {
  scrollToBottom();
}, [messages]); // ✅ Only when messages change
```

---

## Success Criteria

### Functional Requirements
- ✅ Users can send messages and receive AI responses
- ✅ Conversation history persists across page refreshes
- ✅ Loading states clearly indicate processing
- ✅ Errors displayed with actionable messages
- ✅ Messages appear in chronological order
- ✅ Conversation ID maintained across messages

### Performance Requirements
- ✅ First token appears within 2 seconds
- ✅ UI remains responsive during streaming
- ✅ No layout shifts or jank during message rendering
- ✅ Handles conversations with 100+ messages smoothly

### UX Requirements
- ✅ Input disabled during message processing
- ✅ Auto-scroll to newest message
- ✅ Clear visual distinction between user/AI messages
- ✅ Retry option for failed messages
- ✅ Mobile-friendly touch interactions

---

## References

- [ChatScope UI Kit Documentation](https://chatscope.io/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Fetch API Streaming](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams)
- [Axios Error Handling](https://axios-http.com/docs/handling_errors)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

**Last Updated:** 2026-02-05
**Maintained By:** Frontend Engineering Team

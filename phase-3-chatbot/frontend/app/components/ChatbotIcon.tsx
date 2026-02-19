"use client";

import { useState } from "react";
import { FiMessageCircle, FiX } from "react-icons/fi";
import ChatWindow from "./ChatWindow";

/**
 * Floating Chatbot Icon Component
 * Displays a fixed-position button in bottom-right corner to open chat window
 */
export default function ChatbotIcon() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Window (conditionally rendered) */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-[400px] h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-4 right-4 z-[9999] p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-500 hover:bg-blue-600"
        } text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isOpen ? "focus:ring-red-500" : "focus:ring-blue-500"
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </button>
    </>
  );
}

"use client";

import React, { useState } from "react";
import { useOpenAIRealtimeWebRTC } from "../context/OpenAIRealtimeWebRTC";

const TextMessageInput: React.FC<{sessionId:string}> = ({sessionId}) => {
  const { sendTextMessage } = useOpenAIRealtimeWebRTC(); // Use the renamed function from context
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      sendTextMessage(sessionId,message); // Send the message using the context function
      setMessage(""); // Clear the input field
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(); // Trigger send on Enter key press
    }
  };

  return (
    <div className="w-full bg-white border rounded-lg p-4 mt-4 shadow-sm">
      <textarea
        className="w-full h-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      ></textarea>
      <button
        onClick={handleSendMessage}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Send
      </button>
    </div>
  );
};

export default TextMessageInput;

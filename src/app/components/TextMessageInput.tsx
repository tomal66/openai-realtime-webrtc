'use client';

import React, { useState } from 'react';
import { useOpenAIRealtimeWebRTC } from '../context/OpenAIRealtimeWebRTC';

const TextMessageInput: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const { sendTextMessage, createResponse } = useOpenAIRealtimeWebRTC();
  const [message, setMessage] = useState('');

  /**
   * Handle sending the message from the user.
   */
  const handleSendMessage = () => {
    if (message.trim()) {
      sendTextMessage(sessionId, message); // Send the message using the context function
      setMessage(''); // Clear the input field
    }
  };

  /**
   * Handle triggering the response generation explicitly (non-VAD mode).
   */
  const handleGenerateResponse = () => {
    createResponse(sessionId); // Explicitly generate a response
  };

  /**
   * Handle keypress events for the input field.
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(); // Trigger send on Enter key press
    }
  };

  return (
    <div className="w-full bg-white border rounded-lg p-4 mt-4 shadow-sm space-y-4">
      <textarea
        className="w-full h-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      ></textarea>

      <div className="flex space-x-4">
        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>

        {/* Generate Response Button */}
        <button
          onClick={handleGenerateResponse}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Generate Response
        </button>
      </div>

      <p className="text-sm text-gray-600 italic">
        <strong>Send:</strong> Sends your message to the assistant. <br />
        <strong>Generate Response:</strong> Explicitly triggers the assistant to
        generate a response in non-VAD mode.
      </p>
    </div>
  );
};

export default TextMessageInput;

"use client";

import React from "react";
import WebRTCPlayer from "./WebRTCPlayer";
import TextMessageInput from "./TextMessageInput";
import { useOpenAIRealtimeWebRTC } from "../context/OpenAIRealtimeWebRTC";

const Chat: React.FC = () => {
  const { remoteStream, isConnected, startSession, endSession } =
    useOpenAIRealtimeWebRTC();

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">AI Chat</h1>
        <div>
          {isConnected ? (
            <button
              onClick={endSession}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              End Session
            </button>
          ) : (
            <button
              onClick={startSession}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Start Session
            </button>
          )}
        </div>
      </div>

      {/* WebRTC Player */}
      <div className="border-t pt-4">
        <WebRTCPlayer remoteStream={remoteStream} />
      </div>

      {/* Text Message Input */}
      <div className="border-t pt-4">
        <TextMessageInput />
      </div>
    </div>
  );
};

export default Chat;

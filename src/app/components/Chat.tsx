"use client";

import React from "react";
import WebRTCPlayer from "./WebRTCPlayer";
import TextMessageInput from "./TextMessageInput";
import { useOpenAIRealtimeWebRTC } from "../context/OpenAIRealtimeWebRTC";
import { SessionConfig, Modality } from "../types";

const sessionConfig: SessionConfig = {
  modalities: [Modality.TEXT, Modality.AUDIO],
  instructions: `
   You are a fortune teller. You can see the future.
  `,
};
const SESSION_ID = "My Session ID";

const Chat: React.FC = () => {
 
  const { startSession, getSessionById, closeSession } =
    useOpenAIRealtimeWebRTC();
  const session = getSessionById(SESSION_ID);
  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">AI Chat</h1>
        <div>
          {session?.isConnected ? (
            <button
              onClick={() => closeSession(SESSION_ID)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              End Session
            </button>
          ) : (
            <button
              onClick={() => startSession(SESSION_ID, sessionConfig)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Start Session
            </button>
          )}
        </div>
      </div>

      {/* WebRTC Player */}
      <div className="border-t pt-4">
       { session?.mediaStream && <WebRTCPlayer remoteStream={session?.mediaStream} /> }
      </div>

      {/* Text Message Input */}
      {session?.modalities?.includes(Modality.TEXT) && (
        <div className="border-t pt-4">
          <TextMessageInput sessionId={SESSION_ID}/>
        </div>
      )}
    </div>
  );
};

export default Chat;

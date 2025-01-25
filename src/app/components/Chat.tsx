"use client";

import React, { useState } from "react";
import WebRTCPlayer from "./WebRTCPlayer";
import TextMessageInput from "./TextMessageInput";
import PushToTalk from "./PushToTalk";
import { useOpenAIRealtimeWebRTC } from "../context/OpenAIRealtimeWebRTC";
import { SessionConfig, Modality, TurnDetectionConfig } from "../types";

const defaultTurnDetection: TurnDetectionConfig = {
  type: "server_vad",
  threshold: 0.5,
  prefix_padding_ms: 300,
  silence_duration_ms: 500,
};

const Chat: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>("");
  const [mode, setMode] = useState<"vad" | "push-to-talk">("vad"); // State for mode
  const [config, setConfig] = useState<SessionConfig>({
    modalities: [Modality.TEXT, Modality.AUDIO],
    input_audio_transcription: {
      model: "whisper-1",
    },
    instructions: `
      You are a fortune teller. You can see the future.
    `,
    turn_detection: defaultTurnDetection, // Default to VAD
  });

  const { startSession, closeSession, getSessionById, sendClientEvent } =
    useOpenAIRealtimeWebRTC();

  async function createNewSession(updatedConfig: SessionConfig) {
    const session = await (
      await fetch("/api/session", {
        method: "POST",
        body: JSON.stringify(updatedConfig),
      })
    ).json();
    return session;
  }

  async function onSessionStart() {
    const newSession = await createNewSession(config);
    startSession({ ...newSession });
    setSessionId(newSession.id);
  }

  const session = getSessionById(sessionId);

  const handleModeChange = (newMode: "vad" | "push-to-talk") => {
    setMode(newMode);

    // Update the config for the selected mode
    const updatedConfig: SessionConfig = {
      ...config,
      turn_detection: newMode === "vad" ? defaultTurnDetection : null, // Enable VAD for "vad", disable for "push-to-talk"
    };
    setConfig(updatedConfig);

    // Dynamically update session if already active
    if (sessionId && session?.isConnected) {
      sendClientEvent(sessionId, {
        type: "session.update",
        session: {
          turn_detection: updatedConfig.turn_detection,
        },
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">AI Chat</h1>
        <div className="flex items-center space-x-4">
          {/* Mode Switcher */}
          <select
            value={mode}
            onChange={(e) => handleModeChange(e.target.value as "vad" | "push-to-talk")}
            className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-700"
          >
            <option value="vad">VAD</option>
            <option value="push-to-talk">Push-to-Talk</option>
          </select>

          {/* Start/End Session Button */}
          {session?.isConnected ? (
            <button
              onClick={() => closeSession(sessionId)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              End Session
            </button>
          ) : (
            <button
              onClick={() => onSessionStart()}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Start Session
            </button>
          )}
        </div>
      </div>

      {/* WebRTC Player */}
      <div className="border-t pt-4">
        {session?.mediaStream && (
          <WebRTCPlayer remoteStream={session?.mediaStream} />
        )}
      </div>
      
      {/* Error Section */}
      {session?.errors && session.errors.length > 0 && (
        <div className="border-t pt-4">
          <h2 className="text-lg font-bold text-red-600">Errors</h2>
          <div className="overflow-y-auto max-h-32 border rounded p-4 bg-red-50">
            {session.errors.map((error, index) => (
              <div key={index} className="mb-2">
                <p className="text-sm text-red-800">
                  <strong>Error Type:</strong> {error.type}
                </p>
                {error.message && (
                  <p className="text-sm text-red-700">
                    <strong>Message:</strong> {error.message}
                  </p>
                )}
                {error.code && (
                  <p className="text-sm text-red-700">
                    <strong>Code:</strong> {error.code}
                  </p>
                )}
                {error.param && (
                  <p className="text-sm text-red-700">
                    <strong>Param:</strong> {error.param}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  <strong>Event ID:</strong> {error.event_id} |{" "}
                  <strong>Timestamp:</strong>{" "}
                  {new Date(error.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Transcripts Box */}
      {session?.transcripts && session?.transcripts?.length > 0 && (
        <div className="overflow-y-auto h-64 border rounded p-4 bg-gray-50">
          {session?.transcripts
            .slice() // Make a copy of the transcripts array
            .reverse() // Reverse the array to show the latest on top
            .map((transcript, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded ${
                  transcript.role === "user"
                    ? "bg-blue-100 text-blue-900"
                    : "bg-green-100 text-green-900"
                }`}
              >
                <p className="text-sm">
                  <strong>{transcript.role === "user" ? "You" : "Bot"}</strong>{" "}
                  <span className="text-gray-500 text-xs">
                    {new Date(transcript.timestamp).toLocaleTimeString()}
                  </span>
                </p>
                <p className="text-base">{transcript.content}</p>
              </div>
            ))}
        </div>
      )}

      {/* Mode-Based Input */}
      {session?.modalities?.includes(Modality.AUDIO) && (
        <div className="border-t pt-4">
          {mode === "push-to-talk" ? (
            <PushToTalk sessionId={sessionId} />
          ) : (
            <p className="text-gray-600 text-sm italic">
              Voice Activity Detection (VAD) mode enabled. Start speaking to interact.
            </p>
          )}
        </div>
      )}

      {/* Text Message Input */}
      {session?.modalities?.includes(Modality.TEXT) && (
        <div className="border-t pt-4">
          <TextMessageInput sessionId={sessionId} />
        </div>
      )}
    </div>
  );
};

export default Chat;

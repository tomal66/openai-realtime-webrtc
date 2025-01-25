"use client";

import React, { useState, useRef } from "react";
import { useOpenAIRealtimeWebRTC } from "../context/OpenAIRealtimeWebRTC";

const PushToTalk: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const { sendAudioChunk, commitAudioBuffer, createResponse } = useOpenAIRealtimeWebRTC();

  const handleStartRecording = async () => {
    setIsRecording(true);

    // Create an AudioContext
    const audioContext = new AudioContext({
      sampleRate: 24000, // Set sample rate to 24kHz
    });
    audioContextRef.current = audioContext;

    // Request access to the user's microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;

    const source = audioContext.createMediaStreamSource(stream);

    // Create a ScriptProcessorNode to handle audio processing
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    source.connect(processor);
    processor.connect(audioContext.destination);

    // Process audio in PCM16 format
    processor.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer;
      const rawData = inputBuffer.getChannelData(0); // Get mono audio data
      const pcm16Data = new Int16Array(rawData.length);

      // Convert Float32Array to Int16Array (PCM16)
      for (let i = 0; i < rawData.length; i++) {
        pcm16Data[i] = Math.max(-1, Math.min(1, rawData[i])) * 0x7fff; // Scale to Int16 range
      }

      // Encode PCM16 as Base64
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(pcm16Data.buffer))
      );

      // Send the audio chunk to the session
      sendAudioChunk(sessionId, base64Audio);
    };
  };

  const handleStopRecording = () => {
    setIsRecording(false);

    // Stop processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    // Stop the microphone stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Close the AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Commit the audio buffer to the session
    commitAudioBuffer(sessionId);
    createResponse(sessionId);
  };

  return (
    <div className="flex items-center justify-center space-y-2">
      <button
        onMouseDown={handleStartRecording}
        onMouseUp={handleStopRecording}
        onTouchStart={handleStartRecording}
        onTouchEnd={handleStopRecording}
        className={`w-16 h-16 flex items-center justify-center rounded-full border-4 transition-all duration-200 shadow-lg focus:outline-none focus:ring-4 ${
          isRecording
            ? "bg-red-500 border-red-700 shadow-red-500/50 focus:ring-red-300"
            : "bg-gray-200 border-gray-400 shadow-gray-300/50 focus:ring-gray-300"
        }`}
      >
        <span
          className={`w-8 h-8 rounded-full ${
            isRecording ? "bg-white" : "bg-red-500"
          }`}
        ></span>
      </button>
      <p className="text-sm text-gray-600">
        {isRecording ? "Recording..." : "Hold to Talk"}
      </p>
    </div>
  );
};

export default PushToTalk;

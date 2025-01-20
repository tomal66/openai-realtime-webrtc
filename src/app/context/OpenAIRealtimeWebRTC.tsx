"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface OpenAIRealtimeWebRTCContextType{
    // WebRTC state
    isConnected: boolean; // Connection status
    remoteStream: MediaStream | null; // Incoming media stream
    dataChannel: RTCDataChannel | null; // Data channel for sending/receiving messages
  
    // API for developers
    sendMessage: (message: string) => void; // Send messages to OpenAI
    startSession: () => Promise<void>; // Start a new WebRTC session
    endSession: () => void; // End the current WebRTC session
}

// Define context type
interface OpenAIRealtimeWebRTCContextType {
  isConnected: boolean;
  remoteStream: MediaStream | null;
  dataChannel: RTCDataChannel | null;
  sendMessage: (message: string) => void;
  startSession: () => Promise<void>;
  endSession: () => void;
}

// Create context
const OpenAIRealtimeWebRTCContext = createContext<OpenAIRealtimeWebRTCContextType | undefined>(undefined);

// Provider Component
export const OpenAIRealtimeWebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const tokenRef = useRef<string | null>(null);

  // Function to fetch ephemeral token
  const fetchToken = async (): Promise<string> => {
    const response = await fetch("/api/session", { method: "POST" });
    const data = await response.json();
    return data.client_secret.value;
  };

  // Function to start a session
  const startSession = async () => {
    // Fetch token
    tokenRef.current = await fetchToken();

    // Create peer connection
    const pc = new RTCPeerConnection();

    // Get audio stream from the microphone
    const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Add the audio track to the peer connection
    localStream.getAudioTracks().forEach((track) => pc.addTrack(track, localStream));

    peerConnection.current = pc;

    // Handle remote streams
    pc.ontrack = (event) => setRemoteStream(event.streams[0]);

    // Set up data channel
    const dc = pc.createDataChannel("oai-events");
    setDataChannel(dc);

    // Create SDP offer and exchange with OpenAI
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const response = await fetch(`https://api.openai.com/v1/realtime?model=${process.env.NEXT_PUBLIC_OPEN_AI_MODEL_ID}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${tokenRef.current}`,
        "Content-Type": "application/sdp",
      },
    });

    const answer = {
      type: "answer" as RTCSdpType,
      sdp: await response.text(),
    };
    await pc.setRemoteDescription(answer);

    setIsConnected(true);
  };

  // Function to end the session
  const endSession = () => {
    peerConnection.current?.close();
    peerConnection.current = null;
    setIsConnected(false);
    setRemoteStream(null);
    setDataChannel(null);
  };

  // Function to send messages
  const sendMessage = (message: string) => {
    dataChannel?.send(message);
  };

  // Token renewal every 25 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isConnected) {
        tokenRef.current = await fetchToken();
      }
    }, 25 * 60 * 1000); // 25 minutes

    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <OpenAIRealtimeWebRTCContext.Provider
      value={{ isConnected, remoteStream, dataChannel, sendMessage, startSession, endSession }}
    >
      {children}
    </OpenAIRealtimeWebRTCContext.Provider>
  );
};

// Custom Hook
export const useOpenAIRealtimeWebRTC = (): OpenAIRealtimeWebRTCContextType => {
  const context = useContext(OpenAIRealtimeWebRTCContext);
  if (!context) {
    throw new Error("useOpenAIRealtimeWebRTC must be used within an OpenAIRealtimeWebRTCProvider");
  }
  return context;
};

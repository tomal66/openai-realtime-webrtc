"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface OpenAIRealtimeWebRTCContextType {
  isConnected: boolean;
  remoteStream: MediaStream | null;
  sendTextMessage: (message: string) => void;
  startSession: () => Promise<void>;
  endSession: () => void;
}

const OpenAIRealtimeWebRTCContext = createContext<OpenAIRealtimeWebRTCContextType | undefined>(undefined);

export const OpenAIRealtimeWebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const tokenRef = useRef<string | null>(null);

  const fetchToken = async (): Promise<string> => {
    const response = await fetch("/api/session", { method: "POST" });
    const data = await response.json();
    return data.client_secret.value;
  };

  const startSession = async () => {
    tokenRef.current = await fetchToken();
    const pc = new RTCPeerConnection();

    const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.getAudioTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.ontrack = (event) => setRemoteStream(event.streams[0]);

    const dc = pc.createDataChannel("oai-events");
    setDataChannel(dc);

    // Add event listeners for the data channel
    dc.addEventListener("open", () => {
      console.log("Data channel is open.");
      setIsConnected(true);
    });

    dc.addEventListener("message", (e) => {
      try {
        const serverEvent = JSON.parse(e.data);
        console.log("Received server event:", serverEvent);
      } catch (error) {
        console.error("Failed to parse server event:", error);
      }
    });

    dc.addEventListener("close", () => {
      console.warn("Data channel closed.");
      setDataChannel(null);
      setIsConnected(false);
    });

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

    const answer = { type: "answer" as RTCSdpType, sdp: await response.text() };
    await pc.setRemoteDescription(answer);

    peerConnection.current = pc;
  };

  const endSession = () => {
    dataChannel?.close();
    peerConnection.current?.close();
    setIsConnected(false);
    setRemoteStream(null);
    setDataChannel(null);
    peerConnection.current = null;
  };

  const sendClientEvent = (event: any) => {
    if (!dataChannel || dataChannel.readyState !== "open") {
      console.error("Data channel is not open. Cannot send event.");
      return;
    }

    event.event_id = event.event_id || crypto.randomUUID();
    dataChannel.send(JSON.stringify(event));
    console.log("Sent event:", event);
  };

  const sendTextMessage = (message: string) => {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };

    sendClientEvent(event);
    sendClientEvent({ type: "response.create" });
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isConnected) {
        tokenRef.current = await fetchToken();
        console.log("Token refreshed.");
      }
    }, 25 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <OpenAIRealtimeWebRTCContext.Provider
      value={{ isConnected, remoteStream, sendTextMessage, startSession, endSession }}
    >
      {children}
    </OpenAIRealtimeWebRTCContext.Provider>
  );
};

export const useOpenAIRealtimeWebRTC = (): OpenAIRealtimeWebRTCContextType => {
  const context = useContext(OpenAIRealtimeWebRTCContext);
  if (!context) {
    throw new Error("useOpenAIRealtimeWebRTC must be used within an OpenAIRealtimeWebRTCProvider");
  }
  return context;
};

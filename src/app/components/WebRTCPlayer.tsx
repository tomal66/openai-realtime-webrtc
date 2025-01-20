"use client";

import React, { useEffect, useRef } from "react";

interface WebRTCPlayerProps {
  remoteStream: MediaStream | null;
}

const WebRTCPlayer: React.FC<WebRTCPlayerProps> = ({ remoteStream }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream; // Set the media stream as the source
    }
  }, [remoteStream]);

  return (
    <div className="w-full bg-gray-100 p-4 rounded-lg shadow-md flex items-center space-x-4">
      {/* Styled audio player */}
      <audio
        ref={audioRef}
        autoPlay
        controls={false}
        className="w-full h-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default WebRTCPlayer;
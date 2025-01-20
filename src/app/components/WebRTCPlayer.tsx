import React, { useEffect, useRef } from "react";

interface WebRTCPlayerProps {
  remoteStream: MediaStream | null;
}

const WebRTCPlayer: React.FC<WebRTCPlayerProps> = ({ remoteStream }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream; // Set the srcObject programmatically
    }
  }, [remoteStream]);

  return <audio ref={audioRef} autoPlay controls />;
};

export default WebRTCPlayer;

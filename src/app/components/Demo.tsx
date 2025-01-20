
"use client";

import React from 'react';
import { useOpenAIRealtimeWebRTC } from '../context/OpenAIRealtimeWebRTC';
import WebRTCPlayer from './WebRTCPlayer';

const Demo: React.FC = () => {
    const { isConnected, remoteStream, sendMessage, startSession, endSession } = useOpenAIRealtimeWebRTC();

    return (
        <div>
            <button onClick={startSession}>Start Session</button>
            <button onClick={endSession}>End Session</button>
            {isConnected && <div>Connected to OpenAI!</div>}
            {remoteStream && <WebRTCPlayer remoteStream={remoteStream} />}
            <button onClick={() => sendMessage("Hello OpenAI!")}>Send Message</button>
        </div>
    );
};

export default Demo;
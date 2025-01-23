"use client";

import React, { createContext, useContext, useReducer, useRef } from "react";
import { 
  CreateSessionRequestBody, 
  Modality, 
  RealtimeSession, 
} from "../types"


/**
 * Context type definition for managing OpenAI Realtime WebRTC sessions.
 */
interface OpenAIRealtimeWebRTCContextType {
  /**
   * Gets the list of all active sessions.
   */
  sessions: RealtimeSession[];

  /**
   * Retrieves the state of a specific session by its ID.
   *
   * @param sessionId - The unique identifier for the session.
   * @returns The session object if found, otherwise `null`.
   */
  getSessionById: (sessionId: string) => RealtimeSession | null;

  /**
   * Starts a new WebRTC session with the OpenAI API.
   *
   * @param sessionId - The unique identifier for the new session.
   * @param config - Optional session configuration to override defaults.
   * @returns A promise that resolves once the session is successfully started.
   */
  startSession: (sessionId: string, config?: Partial<CreateSessionRequestBody>) => Promise<void>;

  /**
   * Ends an active WebRTC session and cleans up its resources.
   *
   * @param sessionId - The unique identifier for the session to close.
   * @returns A promise that resolves once the session is successfully closed.
   */
  closeSession: (sessionId: string) => void;

  /**
   * Sends a text message to a specific session.
   *
   * @param sessionId - The unique identifier for the session to send the message to.
   * @param message - The text message content.
   */
  sendTextMessage: (sessionId: string, message: string) => void;

  /**
   * Sends a custom client event to a specific session.
   *
   * @param sessionId - The unique identifier for the session to send the event to.
   * @param event - The custom event payload.
   */
  sendClientEvent: (sessionId: string, event: any) => void;

}


// Create the OpenAI Realtime WebRTC context
const OpenAIRealtimeWebRTCContext = createContext<OpenAIRealtimeWebRTCContextType | undefined>(undefined);

/**
 * Default session configuration object for starting a WebRTC session.
 * Developers can override these defaults by passing a custom configuration to `startSession`.
 */
const defaultSessionConfig: Partial<CreateSessionRequestBody> = {
  modalities: [Modality.AUDIO, Modality.TEXT], // Supports both text and audio by default
  temperature: 0.8, // Default temperature for balanced randomness
  maxResponseOutputTokens: "inf", // No token limit by default
};

// Export the context for use in other components
export const useOpenAIRealtimeWebRTC = (): OpenAIRealtimeWebRTCContextType => {
  const context = useContext(OpenAIRealtimeWebRTCContext);
  if (!context) {
    throw new Error("useOpenAIRealtimeWebRTC must be used within an OpenAIRealtimeWebRTCProvider");
  }
  return context;
};

// Enum for action types to avoid hardcoding strings
export enum SessionActionType {
  ADD_SESSION = "ADD_SESSION",
  REMOVE_SESSION = "REMOVE_SESSION",
  UPDATE_SESSION = "UPDATE_SESSION",
}

// Action interfaces for type safety
interface AddSessionAction {
  type: SessionActionType.ADD_SESSION;
  payload: RealtimeSession;
}

interface RemoveSessionAction {
  type: SessionActionType.REMOVE_SESSION;
  payload: { id: string }; // Only the channel ID is needed to remove
}

interface UpdateSessionAction {
  type: SessionActionType.UPDATE_SESSION;
  payload: Partial<RealtimeSession> & { id: string }; // Allow partial updates, must include `id`
}

// Union type for all actions
type SessionAction = AddSessionAction | RemoveSessionAction | UpdateSessionAction;

// Reducer state type
type ChannelState = RealtimeSession[];

// Reducer function
export const sessionReducer = (state: ChannelState, action: SessionAction): ChannelState => {
  switch (action.type) {
    case SessionActionType.ADD_SESSION:
      return [...state, action.payload]; // Add a new session to the state
      
    case SessionActionType.REMOVE_SESSION:
      return state.filter((session) => session.id !== action.payload.id); // Remove session by ID

    case SessionActionType.UPDATE_SESSION:
      return state.map((session) =>
        session.id === action.payload.id
          ? { ...session, ...action.payload } // Merge updates with existing session
          : session
      );

    default:
      // Ensure exhaustive checks in TypeScript
      throw new Error(`Unhandled action type: ${action}`);
  }
};


export const OpenAIRealtimeWebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, dispatch] = useReducer(sessionReducer, []);

  // get session by id
  const getSessionById = (sessionId: string): RealtimeSession | null => {
    return sessions.find((session) => session.id === sessionId) || null;
  };

  const startSession = async (
    sessionId: string = "default",
    config: Partial<CreateSessionRequestBody> = defaultSessionConfig
  ): Promise<void> => {
   // create new session on backend 
   const session =  await (await fetch("/api/session", { method: "POST" })).json() as unknown as RealtimeSession;
    // Create a new peer connection
    const pc = new RTCPeerConnection();
  
    // Attach local audio stream if AUDIO modality is enabled
    if (config.modalities?.includes(Modality.AUDIO)) {
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.getAudioTracks().forEach((track) => pc.addTrack(track, localStream));
    }
  
    // Manage the remote stream
    pc.ontrack = (event) => {
      console.log(`Remote stream received for session '${sessionId}'.`);
      // update the state for this session with event.streams[0] as mediaStream
      dispatch({
        type: SessionActionType.UPDATE_SESSION,
        payload: {
          id: sessionId,
          mediaStream: event.streams[0],
        },
      });
    };
  
    // Create and manage a data channel
    const dc = pc.createDataChannel(sessionId);
  
    // Add a temporary session to state
    dispatch({
      type: SessionActionType.ADD_SESSION,
      payload: {
        id: sessionId,
        object: "realtime.session",
        model: config.model || "default-model",
        modalities: config.modalities || defaultSessionConfig.modalities!,
        peerConnection: pc,
        dataChannel: dc,
        tokenRef: session?.client_secret?.value,
        isConnecting: true,
        isConnected: false,
      } as RealtimeSession,
    });
  
    // Add event listeners to handle data channel lifecycle
    dc.addEventListener("open", () => {
      console.log(`Data channel for session '${sessionId}' is open.`);
    });
  
    dc.addEventListener("message", (e) => {
      console.log(`Message received on session '${sessionId}':`, e.data);
    });
  
    dc.addEventListener("close", () => {
      console.log(`Session '${sessionId}' closed.`);
      dispatch({ type: SessionActionType.REMOVE_SESSION, payload: { id: sessionId } });
    });
  
    // Create an SDP offer and send it to the OpenAI Realtime API
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
  
    const response = await fetch(
      `https://api.openai.com/v1/realtime?model=${process.env.NEXT_PUBLIC_OPEN_AI_MODEL_ID}`,
      {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${session.client_secret?.value}`,
          "Content-Type": "application/sdp",
        },
      }
    );
  

    // Update the session with the full session object and set the connection flags
    dispatch({
      type: SessionActionType.UPDATE_SESSION,
      payload: {
        ...session,
        id: sessionId,
        isConnecting: false,
        isConnected: true,
      },
    });
  
    // Apply the SDP answer from the response
    const answer = { type: "answer" as RTCSdpType, sdp: await response.text() };
    console.log({answer})
    await pc.setRemoteDescription(answer);
  };

  /**
   * Closes an existing WebRTC session.
   * Cleans up the peer connection, data channel, and removes the session from the state.
   *
   * @param sessionId - The unique identifier of the session to close.
   */
  const closeSession = (sessionId: string): void => {
    // Find the session by ID
    const session = sessions.find((s) => s.id === sessionId);

    if (!session) {
      console.warn(`Session with ID '${sessionId}' does not exist.`);
      return;
    }

    // Close the data channel if it exists
    if (session.dataChannel) {
      session.dataChannel.close();
      console.log(`Data channel for session '${sessionId}' closed.`);
    }

    // Close the peer connection if it exists
    if (session.peerConnection) {
      session.peerConnection.close();
      console.log(`Peer connection for session '${sessionId}' closed.`);
    }

    // Remove the session from the state
    dispatch({ type: SessionActionType.REMOVE_SESSION, payload: { id: sessionId } });
    console.log(`Session '${sessionId}' removed.`);
  };

  /**
   * Sends a client event to a specific WebRTC session.
   *
   * @param sessionId - The unique identifier of the session to send the event to.
   * @param event - The event object to be sent.
   */
  const sendClientEvent = (sessionId: string, event: any): void => {
    // Find the session by ID
    const session = sessions.find((s) => s.id === sessionId);

    if (!session) {
      console.error(`Session with ID '${sessionId}' does not exist.`);
      return;
    }

    const { dataChannel } = session;

    // Ensure the data channel is open before sending the event
    if (!dataChannel || dataChannel.readyState !== "open") {
      console.error(`Data channel for session '${sessionId}' is not open. Cannot send event.`);
      return;
    }

    // Attach a unique event ID if not already provided
    event.event_id = event.event_id || crypto.randomUUID();

    // Send the event over the session's data channel
    try {
      dataChannel.send(JSON.stringify(event));
      console.log(`Event sent to session '${sessionId}':`, event);
    } catch (error) {
      console.error(`Failed to send event to session '${sessionId}':`, error);
    }
  };


  /**
   * Sends a text message to a specific WebRTC session.
   *
   * @param sessionId - The unique identifier of the session to send the message to.
   * @param message - The text message to be sent.
   */
  const sendTextMessage = (sessionId: string, message: string): void => {
    // Create the event object for the user message
    const userEvent = {
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

    // Send the user message event
    sendClientEvent(sessionId, userEvent);

    // Optionally, send a follow-up event to trigger a response creation
    const responseEvent = {
      type: "response.create",
    };
    sendClientEvent(sessionId, responseEvent);
  };


  return (
    <OpenAIRealtimeWebRTCContext.Provider
      value={{ sessions, getSessionById, startSession, closeSession, sendTextMessage, sendClientEvent }}
    >
      {children}
    </OpenAIRealtimeWebRTCContext.Provider>
  );
};

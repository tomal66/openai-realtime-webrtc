/**
 * Enum representing the type of transcript.
 */
export enum TranscriptType {
  INPUT = "input",
  OUTPUT = "output",
}

/**
 * Enum representing the role of a transcript.
 */
export enum TranscriptRole {
  USER = "user",
  MODEL = "model",
}

/**
 * Enum representing all possible event types for the OpenAI Realtime API.
 */
export enum RealtimeEventType {
  // Session events
  SESSION_CREATED = "session.created",
  SESSION_UPDATED = "session.updated",

  // Input audio buffer events
  INPUT_AUDIO_SPEECH_STARTED = "input_audio_buffer.speech_started",
  INPUT_AUDIO_SPEECH_STOPPED = "input_audio_buffer.speech_stopped",
  INPUT_AUDIO_COMMITTED = "input_audio_buffer.committed",
  INPUT_AUDIO_CLEARED = "input_audio_buffer.cleared",

  // Conversation events
  CONVERSATION_ITEM_CREATED = "conversation.item.created",
  CONVERSATION_ITEM_INPUT_AUDIO_TRANSCRIPTION_COMPLETED = "conversation.item.input_audio_transcription.completed",
  CONVERSATION_ITEM_DELETED = "conversation.item.deleted",

  // Response events
  RESPONSE_CREATED = "response.created",
  RESPONSE_OUTPUT_ITEM_ADDED = "response.output_item.added",
  RESPONSE_AUDIO_TRANSCRIPT_DELTA = "response.audio_transcript.delta",
  RESPONSE_AUDIO_TRANSCRIPT_DONE = "response.audio_transcript.done",
  RESPONSE_CONTENT_PART_DONE = "response.content_part.done",
  RESPONSE_DONE = "response.done",
  RESPONSE_CANCELLED = "response.cancelled",

  // Output audio buffer events
  OUTPUT_AUDIO_STARTED = "output_audio_buffer.audio_started",
  OUTPUT_AUDIO_STOPPED = "output_audio_buffer.audio_stopped",

  // Rate limit updates
  RATE_LIMITS_UPDATED = "rate_limits.updated",
}

/**
 * Base interface for all OpenAI WebRTC events.
 */
interface BaseRealtimeEvent {
  /**
   * Type of the event (e.g., input transcription, response).
   */
  type: RealtimeEventType;

  /**
   * Unique identifier for the event.
   */
  event_id: string;

  /**
   * Timestamp of the event (optional for debugging/logging purposes).
   */
  timestamp?: number;
}


/**
 * Event for input transcription completed.
 */
interface InputAudioTranscriptionCompletedEvent extends BaseRealtimeEvent {
  type: RealtimeEventType.CONVERSATION_ITEM_INPUT_AUDIO_TRANSCRIPTION_COMPLETED;
  item_id: string;
  content_index: number;
  transcript: string;
}

/**
 * Event for response audio transcript done.
 */
interface ResponseAudioTranscriptDoneEvent extends BaseRealtimeEvent {
  type: RealtimeEventType.RESPONSE_AUDIO_TRANSCRIPT_DONE;
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  transcript: string;
}

/**
 * Event for response creation.
 */
interface ResponseCreatedEvent extends BaseRealtimeEvent {
  type: RealtimeEventType.RESPONSE_CREATED;
  response: unknown; // Replace with a detailed type if you have it
}

/**
 * Event for response done.
 */
interface ResponseDoneEvent extends BaseRealtimeEvent {
  type: RealtimeEventType.RESPONSE_DONE;
  response: unknown; // Replace with a detailed type if you have it
}

/**
 * Union type for all OpenAI WebRTC events.
 */
export type RealtimeEvent =
  | InputAudioTranscriptionCompletedEvent
  | ResponseAudioTranscriptDoneEvent
  | ResponseCreatedEvent
  | ResponseDoneEvent;

/**
 * Interface representing a transcript in a session.
 */
export interface Transcript {
  /**
   * The textual content of the transcript.
   */
  content: string;

  /**
   * The timestamp when the transcript was created, in milliseconds since Unix epoch.
   */
  timestamp: number;

  /**
   * Indicates whether the transcript is an input from the user or an output from the model.
   */
  type: TranscriptType;

  /**
   * The role associated with the transcript, either "user" (input) or "model" (output).
   */
  role: TranscriptRole;
}


/**
 * Enums for fixed string values used in the session configuration.
 */

// Supported AI voice options.
export enum Voice {
    ALLOY = "alloy",
    ASH = "ash",
    BALLAD = "ballad",
    CORAL = "coral",
    ECHO = "echo",
    SAGE = "sage",
    SHIMMER = "shimmer",
    VERSE = "verse",
  }
  
  /**
   * Supported input/output audio formats.
   */
  export enum AudioFormat {
    PCM16 = "pcm16",
    G711_ULAW = "g711_ulaw",
    G711_ALAW = "g711_alaw",
  }
  
  /**
   * Supported turn detection types.
   */
  export enum TurnDetectionType {
    SERVER_VAD = "server_vad",
  }
  
  /**
   * Supported tool choice options for the model.
   */
  export enum ToolChoice {
    AUTO = "auto",
    NONE = "none",
    REQUIRED = "required",
  }
  
  /**
   * Enum for modalities the model supports.
   */
  export enum Modality {
    AUDIO = "audio",
    TEXT = "text",
  }
  
  /**
   * Configuration for input audio transcription.
   */
  export interface AudioTranscriptionConfig {
    /**
     * The transcription model to use.
     * Currently, only `whisper-1` is supported.
     */
    model: "whisper-1";
  }
  
  /**
   * Configuration for turn detection.
   */
  export interface TurnDetectionConfig {
    /**
     * Type of turn detection (e.g., server VAD).
     */
    type: TurnDetectionType;
  
    /**
     * Activation threshold for VAD (0.0 to 1.0).
     * A higher value requires louder audio to activate the model.
     * Defaults to 0.5.
     */
    threshold?: number;
  
    /**
     * Amount of audio (in milliseconds) to include before the VAD detected speech.
     * Defaults to 300ms.
     */
    prefix_padding_ms?: number;
  
    /**
     * Duration of silence (in milliseconds) to detect speech stop.
     * Defaults to 500ms.
     */
    silence_duration_ms?: number;
  }
  
  /**
   * Definition of a tool (function) available to the model.
   */
  export interface Tool {
    /**
     * Type of the tool. Always set to "function".
     */
    type: "function";
  
    /**
     * Name of the tool, used to reference it during execution.
     */
    name: string;
  
    /**
     * Description of the tool, including usage guidance.
     */
    description: string;
  
    /**
     * Parameters for the tool in JSON Schema format.
     */
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required: string[];
    };
  }
  
  /**
   * Main interface for the session object configuration.
   */
  export interface RealtimeSession {
    /**
     * Unique identifier for the session.
     */
    id: string;
  
    /**
     * Object type identifier, always set to "realtime.session".
     */
    object: "realtime.session";
  
    /**
     * Model to use for the session (e.g., GPT-4 Realtime Preview).
     */
    model: string;
  
    /**
     * Supported modalities for the session (e.g., audio, text).
     */
    modalities: Modality[];
  
    /**
     * Default system instructions for the model.
     * Used to guide response content and behavior.
     */
    instructions?: string;
  
    /**
     * AI voice used for audio responses.
     * Can only be set before the first audio response.
     */
    voice?: Voice;
  
    /**
     * Format of the input audio (e.g., PCM16, G711_ULAW).
     */
    input_audio_format?: AudioFormat;
  
    /**
     * Format of the output audio (e.g., PCM16, G711_ALAW).
     */
    output_audio_format?: AudioFormat;
  
    /**
     * Configuration for input audio transcription.
     * Defaults to off and can be set to null to turn off.
     */
    input_audio_transcription?: AudioTranscriptionConfig | null;
  
    /**
     * Configuration for turn detection.
     * Can be set to null to disable turn detection.
     */
    turn_detection?: TurnDetectionConfig | null;
  
    /**
     * List of tools (functions) available to the model.
     */
    tools?: Tool[];
  
    /**
     * How the model selects tools (e.g., auto, none, required).
     */
    tool_choice?: ToolChoice;
  
    /**
     * Sampling temperature for response generation.
     * Controls the randomness of the output (0.6 to 1.2). Defaults to 0.8.
     */
    temperature?: number;
  
    /**
     * Maximum number of output tokens for a single assistant response.
     * Can be a number (1 to 4096) or "inf" for the maximum.
     */
    max_response_output_tokens?: number | "inf";
  
    /**
     * Ephemeral client secret for authenticating connections.
     */
    client_secret?: {
      /**
       * The actual ephemeral key value.
       */
      value: string;
    
      /**
       * Expiration timestamp for the ephemeral key.
       */
      expires_at: number;
    };
    /**
   * The WebRTC peer connection associated with this session.
   * Used for managing the connection lifecycle.
   */
    peer_connection?: RTCPeerConnection | null;

    /**
     * The WebRTC data channel associated with this session.
     * Used for sending and receiving data.
     */
    dataChannel?: RTCDataChannel | null;

    /**
     * Indicates whether the session is in the process of being established.
     */
    isConnecting?: boolean;

    /**
     * Indicates whether the session is successfully connected and ready for use.
     */
    isConnected?: boolean;

    /**
     * The local media stream used for audio output.
     */
    mediaStream?: MediaStream | null;

    /**
     * List of all transcripts associated with this session.
     * Each transcript includes details such as content, timestamp, type, and role.
    */
    transcripts: Transcript[];
  }
  
  /**
   * Type definition for the request body to create a new session in the OpenAI Realtime API.
   */
  export interface SessionConfig
    extends Partial<Omit<RealtimeSession, "id" | "object" | "clientSecret">> {
    /**
     * The Realtime model to use for this session (e.g., GPT-4 Realtime Preview).
     * This is optional during session creation.
     */
    model?: string;
  
    /**
     * The modalities the model should respond with (e.g., `["text", "audio"]`).
     */
    modalities?: Modality[];
  
    /**
     * Default system instructions (system message) to guide model behavior.
     */
    instructions?: string;
  
    /**
     * Optional list of tools (functions) available to the model.
     */
    tools?: Tool[];
  
    /**
     * Optional turn detection configuration for managing user interaction.
     */
    turn_detection?: TurnDetectionConfig | null;
  }
  
  /**
   * Type definition for the request body of a session update event in the OpenAI Realtime API.
   */
  export interface UpdateSessionRequest {
    /**
     * Optional client-generated ID to identify this event.
     */
    event_id?: string;
  
    /**
     * The type of the event, always set to "session.update".
     */
    type: "session.update";
  
    /**
     * The updated session configuration object.
     * Only provided fields will be updated. To clear fields like `instructions`, pass an empty string.
     */
    session: Partial<Omit<RealtimeSession, "id" | "object" | "clientSecret">>;
  }
  
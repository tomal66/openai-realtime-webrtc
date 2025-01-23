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
  
  // Supported input/output audio formats.
  export enum AudioFormat {
    PCM16 = "pcm16",
    G711_ULAW = "g711_ulaw",
    G711_ALAW = "g711_alaw",
  }
  
  // Supported turn detection types.
  export enum TurnDetectionType {
    SERVER_VAD = "server_vad",
  }
  
  // Supported tool choice options for the model.
  export enum ToolChoice {
    AUTO = "auto",
    NONE = "none",
    REQUIRED = "required",
  }
  
  // Enum for modalities the model supports.
  export enum Modality {
    AUDIO = "audio",
    TEXT = "text",
  }
  
  /**
   * Interfaces for nested objects used in the session configuration.
   */
  
  // Configuration for input audio transcription.
  export interface AudioTranscriptionConfig {
    /**
     * The transcription model to use.
     * Currently, only `whisper-1` is supported.
     */
    model: "whisper-1";
  }
  
  // Configuration for turn detection.
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
    prefixPaddingMs?: number;
  
    /**
     * Duration of silence (in milliseconds) to detect speech stop.
     * Defaults to 500ms.
     */
    silenceDurationMs?: number;
  }
  
  // Definition of a tool (function) available to the model.
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
      properties: Record<string, any>;
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
    inputAudioFormat?: AudioFormat;
  
    /**
     * Format of the output audio (e.g., PCM16, G711_ALAW).
     */
    outputAudioFormat?: AudioFormat;
  
    /**
     * Configuration for input audio transcription.
     * Defaults to off and can be set to null to turn off.
     */
    inputAudioTranscription?: AudioTranscriptionConfig | null;
  
    /**
     * Configuration for turn detection.
     * Can be set to null to disable turn detection.
     */
    turnDetection?: TurnDetectionConfig | null;
  
    /**
     * List of tools (functions) available to the model.
     */
    tools?: Tool[];
  
    /**
     * How the model selects tools (e.g., auto, none, required).
     */
    toolChoice?: ToolChoice;
  
    /**
     * Sampling temperature for response generation.
     * Controls the randomness of the output (0.6 to 1.2). Defaults to 0.8.
     */
    temperature?: number;
  
    /**
     * Maximum number of output tokens for a single assistant response.
     * Can be a number (1 to 4096) or "inf" for the maximum.
     */
    maxResponseOutputTokens?: number | "inf";
  
    /**
     * Ephemeral client secret for authenticating connections.
     */
    clientSecret: {
      /**
       * The actual ephemeral key value.
       */
      value: string;
  
      /**
       * Expiration timestamp for the ephemeral key.
       */
      expiresAt: number;
    };
  }

/**
 * Type definition for the request body to create a new session in the OpenAI Realtime API.
 * Extends the `RealtimeSession` type to reuse shared properties.
 */
export interface CreateSessionRequestBody
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
  turnDetection?: TurnDetectionConfig | null;
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
  
  
  
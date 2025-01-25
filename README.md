## How OpenAI Realtime API Works with WebRTC

The OpenAI Realtime API enables real-time, multi-modal interactions using WebRTC. This project demonstrates how to leverage the API to build interactive applications with support for audio streaming, text input, and session management. The focus is on providing low-latency interactions using a client-friendly architecture.

### Key Components of the Integration

#### Ephemeral Token Authentication

The integration begins with obtaining an ephemeral token, a temporary credential that authorizes connections to the OpenAI Realtime API. These tokens are fetched securely from a backend endpoint and have a 30-minute validity period to ensure security.

#### WebRTC Peer Connection

A WebRTC peer connection is established between the client application and the OpenAI Realtime API, enabling real-time communication with the following features:

- **Audio Streaming**: Microphone input is streamed to the API in real time, and audio responses are seamlessly played back on the client side.
- **Data Channel Communication**: A dedicated data channel is used to send and receive structured events, such as text inputs, session configuration updates, and transcription results.

#### Session Management and Multi-Session Support

- **Reducer-Based State Management**: This project uses a centralized reducer to manage session states and transcripts, ensuring scalability and clarity when handling multiple sessions.
- **Real-Time Transcripts**: The integration focuses on capturing audio transcripts (finalized) and updating them in real time. Developers can retrieve transcripts for user inputs and AI responses, enhancing application interactivity.

### Event Handling and Dynamic Configuration

Events are managed using a clear structure defined in a `RealtimeEventType` enum, ensuring consistency and maintainability. This includes:

- Capturing audio input and output events.
- Dynamically updating session configurations (e.g., changing transcription models or modalities).
- Managing finalized transcripts for both audio and text inputs via a structured `Transcript` type.

### Why WebRTC?

WebRTC is particularly suited for real-time, interactive applications due to its ability to handle:

- **Low-Latency Media Streaming**: Essential for audio-based AI interactions.
- **Dynamic Network Adjustments**: Optimizes performance based on varying bandwidth conditions.
- **Rich Session Management**: Allows seamless communication with the OpenAI Realtime API via data channels.

### Current Project Highlights

- **Multi-Session Support**: Developers can create, manage, and close multiple sessions in parallel.
- **Real-Time Transcript Updates**: Captures and organizes finalized audio transcripts for user and AI interactions.

## Getting Started

1.  **Clone the Repository**

    Start by cloning the repository to your local machine:

    ```bash
    git clone https://github.com/your-username/openai-realtime-webrtc.git
    cd openai-realtime-webrtc
    ```

2.  **Install Dependencies**

    Ensure that you have all the necessary dependencies installed:

    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**

    Create a `.env.local` file in the root of the project and add the following variables:

    ```bash
    NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
    NEXT_PUBLIC_OPEN_AI_MODEL_ID=your_model_id
    ```

    Replace `your_openai_api_key` with your OpenAI API key.  
    Replace `your_model_id` with the appropriate model ID (e.g., `gpt-4o-realtime-preview`).

4.  **Run the Development Server**

    Start the Next.js development server:

        ```bash
        npm run dev
        ```

        You can now access the application by visiting [http://localhost:3000](http://localhost:3000) in your browser.

    ## OpenAI Realtime WebRTC Context Provider

    The OpenAI Realtime WebRTC Context Provider is the core utility for managing WebRTC sessions, transcripts, and interactions with the OpenAI Realtime API. It exposes a set of functions and state to developers, enabling seamless integration for building multi-modal AI-driven applications.

    ### Context API Overview

    The context exports the following key functions and state through the `useOpenAIRealtimeWebRTC` hook:

    #### sessions

    - **Description**: A list of all active WebRTC sessions, each represented by a `RealtimeSession` object.
    - **Type**: `RealtimeSession[]`
    - **Example**:
      ```typescript
      const { sessions } = useOpenAIRealtimeWebRTC();
      console.log(sessions); // Logs all active sessions
      ```

    #### getSessionById(sessionId: string): RealtimeSession | null

    - **Description**: Retrieves the state of a specific session by its ID.
    - **Example**:
      ```typescript
      const session = getSessionById('sess_123');
      if (session) {
        console.log(session.transcripts); // Access transcripts for this session
      }
      ```

    #### startSession(realtimeSession: RealtimeSession): Promise<void>

    - **Description**: Starts a new WebRTC session with the OpenAI Realtime API, establishing the WebRTC peer connection and data channel.
    - **Parameters**:
      - `realtimeSession`: A `RealtimeSession` object containing configuration details.
    - **Example**:
      ```typescript
      const sessionConfig: RealtimeSession = {
        id: 'sess_123',
        modalities: [Modality.TEXT, Modality.AUDIO],
        model: 'gpt-4-realtime',
        transcripts: [],
      };
      await startSession(sessionConfig);
      ```

    #### closeSession(sessionId: string): void

    - **Description**: Closes an active WebRTC session, cleans up the peer connection and data channel, and removes the session from state.
    - **Example**:
      ```typescript
      closeSession('sess_123');
      ```

    #### sendTextMessage(sessionId: string, message: string): void

    - **Description**: Sends a text message to a specific session over the WebRTC data channel.
    - **Parameters**:
      - `sessionId`: The unique identifier of the session to send the message to.
      - `message`: The text message to be sent.
    - **Example**:
      ```typescript
      sendTextMessage('sess_123', 'Hello, how can you help me?');
      ```

    #### sendClientEvent(sessionId: string, event: RealtimeEvent): void

    - **Description**: Sends a custom client event to a specific session.
    - **Parameters**:
      - `sessionId`: The unique identifier of the session to send the event to.
      - `event`: A `RealtimeEvent` object.
    - **Example**:
      ```typescript
      const customEvent: RealtimeEvent = {
        type: RealtimeEventType.RESPONSE_CREATED,
        event_id: 'event_123',
        timestamp: Date.now(),
      };
      sendClientEvent('sess_123', customEvent);
      ```

    For more details, refer to the [Context Provider Code](/src/app/context/OpenAIRealtimeWebRTC.tsx).

    You can also check out an example usage in the [Chat Component](/src/app/components/Chat.tsx).

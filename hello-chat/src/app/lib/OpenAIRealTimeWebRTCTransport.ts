/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    LLMContextMessage,
    LLMFunctionCallData,
    RTVIActionRequestData,
    RTVIClientOptions,
    RTVIError,
    RTVIMessage,
    RTVIMessageType,
    Tracks,
    Transport,
    TransportStartError,
    TransportState,
    logger,
  } from "@pipecat-ai/client-js";
  
  // here we use Daily just for input device management
  import Daily, {
    DailyCall,
    DailyEventObjectAvailableDevicesUpdated,
    DailyEventObjectSelectedDevicesUpdated,
    DailyEventObjectTrack,
  } from "@daily-co/daily-js";
  
  import { dequal } from "dequal";
  
  const BASE_URL = "https://api.openai.com/v1/realtime";
  const MODEL = "gpt-4o-realtime-preview-2024-12-17";
  
  /**********************************
   * OpenAI-specific types
   **********************************/
  type JSONSchema = { [key: string]: any };
  export type OpenAIFunctionTool = {
    type: "function";
    name: string;
    description: string;
    parameters: JSONSchema;
  };
  
  export type OpenAIServerVad = {
    type: "server_vad";
    create_response?: boolean; // defaults to true
    interrupt_response?: boolean; // defaults to true
    prefix_padding_ms?: number; // defaults to 300ms
    silence_duration_ms?: number; // defaults to 500ms
    threshold?: number; // range (0.0, 1.0); defaults to 0.5
  };
  
  export type OpenAISemanticVAD = {
    type: "semantic_vad";
    eagerness?: "low" | "medium" | "high" | "auto"; // defaults to "auto", equivalent to "medium"
    create_response?: boolean; // defaults to true
    interrupt_response?: boolean; // defaults to true
  };
  
  export type OpenAISessionConfig = Partial<{
    modalities?: string;
    instructions?: string;
    voice?:
      | "alloy"
      | "ash"
      | "ballad"
      | "coral"
      | "echo"
      | "sage"
      | "shimmer"
      | "verse";
    input_audio_noise_reduction?: {
      type: "near_field" | "far_field";
    } | null; // defaults to null/off
    input_audio_transcription?: {
      model: "whisper-1" | "gpt-4o-transcribe" | "gpt-4o-mini-transcribe";
      language?: string;
      prompt?: string[] | string; // gpt-4o models take a string
    } | null; // we default this to gpt-4o-transcribe
    turn_detection?: OpenAIServerVad | OpenAISemanticVAD | null; // defaults to server_vad
    temperature?: number;
    max_tokens?: number | "inf";
    tools?: Array<OpenAIFunctionTool>;
  }>;
  
  export interface OpenAIServiceOptions {
    api_key: string;
    model?: string;
    initial_messages?: LLMContextMessage[];
    settings?: OpenAISessionConfig;
  }
  
  export class OpenAIRealTimeWebRTCTransport extends Transport {
    private _service_options: OpenAIServiceOptions;
  
    private _openai_channel: RTCDataChannel | null = null;
    private _openai_cxn: RTCPeerConnection | null = null;
    private _senders: { [key: string]: RTCRtpSender } = {};
    private _botTracks: { [key: string]: MediaStreamTrack } = {};
  
    public botAudioStream: MediaStream | null = null;
  
    private _daily: DailyCall;
  
    private _selectedCam: MediaDeviceInfo | Record<string, never> = {};
    private _selectedMic: MediaDeviceInfo | Record<string, never> = {};
    private _selectedSpeaker: MediaDeviceInfo | Record<string, never> = {};
  
    constructor(service_options: OpenAIServiceOptions) {
      super();
      this._service_options = service_options;
      this._daily = Daily.createCallObject();
    }
  
    initialize(
      options: RTVIClientOptions,
      messageHandler: (ev: RTVIMessage) => void,
    ): void {
      this._options = options;
      this._callbacks = options.callbacks ?? {};
      this._onMessage = messageHandler;
  
      this._openai_cxn = new RTCPeerConnection();
  
      const existingInstance = Daily.getCallInstance();
      if (existingInstance) {
        this._daily = existingInstance;
      } else {
        this._daily = Daily.createCallObject({
          startVideoOff: options.enableCam != true,
          startAudioOff: options.enableMic == false,
        });
        this._attachDeviceListeners();
      }
  
      this._attachLLMListeners();
  
      this.state = "disconnected";
    }
  
    async initDevices() {
      if (!this._daily) {
        throw new RTVIError("Transport instance not initialized");
      }
  
      this.state = "initializing";
  
      const infos = await this._daily.startCamera({
        startVideoOff: true,
        startAudioOff: !(this._options.enableMic ?? true),
      });
      const { devices } = await this._daily.enumerateDevices();
      const cams = devices.filter((d) => d.kind === "videoinput");
      const mics = devices.filter((d) => d.kind === "audioinput");
      const speakers = devices.filter((d) => d.kind === "audiooutput");
      this._callbacks.onAvailableCamsUpdated?.(cams);
      this._callbacks.onAvailableMicsUpdated?.(mics);
      this._callbacks.onAvailableSpeakersUpdated?.(speakers);
      this._selectedCam = infos.camera;
      this._callbacks.onCamUpdated?.(infos.camera as MediaDeviceInfo);
      this._selectedMic = infos.mic;
      this._callbacks.onMicUpdated?.(infos.mic as MediaDeviceInfo);
      this._selectedSpeaker = infos.speaker;
      this._callbacks.onSpeakerUpdated?.(infos.speaker as MediaDeviceInfo);
  
      if (!this._daily.isLocalAudioLevelObserverRunning())
        await this._daily.startLocalAudioLevelObserver(100);
  
      this.state = "initialized";
    }
  
    async connect(
      authBundle: unknown,
      abortController: AbortController,
    ): Promise<void> {
      if (!this._openai_cxn) {
        logger.error("connect called before initialization.");
        return;
      }
  
      if (abortController.signal.aborted) return;
  
      this.state = "connecting";
  
      await this._connectLLM();
    }
  
    async disconnect(): Promise<void> {
      this.state = "disconnecting";
      await this._disconnectLLM();
      this.state = "disconnected";
      this._callbacks.onDisconnected?.();
  
      this.initialize(this._options, this._onMessage);
    }
  
    // Implement abstract methods
    async getAllCams() { return this._daily.enumerateDevices().then(d => d.devices.filter(dev => dev.kind === "videoinput")); }
    async getAllMics() { return this._daily.enumerateDevices().then(d => d.devices.filter(dev => dev.kind === "audioinput")); }
    async getAllSpeakers() { return this._daily.enumerateDevices().then(d => d.devices.filter(dev => dev.kind === "audiooutput")); }
    updateCam(deviceId: string) { this._daily.setInputDevicesAsync({ videoDeviceId: deviceId }); }
    updateMic(deviceId: string) { this._daily.setInputDevicesAsync({ audioDeviceId: deviceId }); }
    updateSpeaker(deviceId: string) { this._daily.setOutputDeviceAsync({ outputDeviceId: deviceId }); }
    get selectedMic() { return this._selectedMic; }
    get selectedCam() { return this._selectedCam; }
    get selectedSpeaker() { return this._selectedSpeaker; }
    get isCamEnabled() { return this._daily.localVideo(); }
    get isMicEnabled() { return this._daily.localAudio(); }
    get isSharingScreen() { return !!this._daily.participants()?.local?.screenVideoTrack; }
    enableCam(enable: boolean) { this._daily.setLocalVideo(enable); }
    enableMic(enable: boolean) { this._daily.setLocalAudio(enable); }
    enableScreenShare(enable: boolean) { this._daily.startScreenShare(); }
  
    get state(): TransportState {
      return this._state;
    }
  
    private set state(state: TransportState) {
      if (this._state === state) return;
  
      this._state = state;
      this._callbacks.onTransportStateChanged?.(state);
    }
  
    public updateSettings(settings: OpenAISessionConfig) {
      if (settings.voice && this._channelReady()) {
        logger.warn("changing voice settings after session start is not supported");
        delete settings.voice;
      }
      const newSettings = {
        ...this._service_options.settings,
        ...settings,
      };
      if (dequal(newSettings, this._service_options.settings)) return;
      this._service_options.settings = {
        ...this._service_options.settings,
        ...settings,
      };
      this._updateSession();
    }
  
    async sendReadyMessage(): Promise<void> {
      // This is now handled by the session flow
    }
  
    sendMessage(message: RTVIMessage): void {
      if (message.type !== "action") return;
      
      const data = message.data as RTVIActionRequestData;
      if (!data.arguments) return;
  
      switch (data.action) {
        case "llm_send_text_input":
          this._sendTextInput(
            (data.arguments.find(a => a.name === 'messages')?.value as LLMContextMessage[]) ?? [],
            (data.arguments.find(a => a.name === 'run_immediately')?.value as boolean) ?? false,
          );
          break;
        case "llm_run":
          this._run();
          break;
        case "llm_send_function_call_result":
          this._sendFunctionCallResult(message.data as any);
          break;
      }
    }
  
    private async _connectLLM(): Promise<void> {
      if (!this._openai_cxn) {
        throw new RTVIError("Peer connection not initialized");
      }
  
      this._openai_channel = this._openai_cxn.createDataChannel("openai");
      this._openai_channel.onopen = () => logger.debug("Data channel opened");
      this._openai_channel.onclose = () => logger.debug("Data channel closed");
      this._openai_channel.onmessage = (ev: MessageEvent<any>) => this._handleOpenAIMessage(JSON.parse(ev.data));
  
      let micTrack = this._daily.participants()?.local?.tracks?.audio?.persistentTrack;
      if (!micTrack) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micTrack = stream.getAudioTracks()[0];
        } catch (e) {
          throw new RTVIError("Failed to get mic track. OpenAI requires audio on initial connection.");
        }
      }
      this._senders["audio"] = this._openai_cxn.addTrack(micTrack);
  
      await this._negotiateConnection();
    }
  
    private async _disconnectLLM(): Promise<void> {
      this._cleanup();
    }
  
    private _attachDeviceListeners(): void {
      this._daily.on("track-started", (ev) => this._handleTrackStarted(ev));
      this._daily.on("track-stopped", (ev) => this._handleTrackStopped(ev));
      this._daily.on("available-devices-updated", (ev) => this._handleAvailableDevicesUpdated(ev));
      this._daily.on("selected-devices-updated", (ev) => this._handleSelectedDevicesUpdated(ev));
      this._daily.on("local-audio-level", (ev) => this._callbacks.onLocalAudioLevel?.(ev.audioLevel));
    }
  
    private _attachLLMListeners(): void {
      if (!this._openai_cxn) {
        throw new RTVIError("Peer connection not initialized");
      }
  
      this._openai_cxn.ontrack = (event) => {
        logger.debug("Got remote track from OpenAI:", event.track.kind);
        const stream = new MediaStream();
        stream.addTrack(event.track);
        this._botTracks[event.track.kind] = event.track;
        if (event.track.kind === "audio") {
          this.botAudioStream = stream;
          this._callbacks.onBotReady?.({ config: [], version: "1.0" });
        }
      };
  
      this._openai_cxn.oniceconnectionstatechange = () => {
        if (!this._openai_cxn) return;
        const state = this._openai_cxn.iceConnectionState;
        logger.debug(`OpenAI ICE connection state changed: ${state}`);
        if (state === "failed") {
          this._onMessage({ id: crypto.randomUUID(), type: RTVIMessageType.ERROR, label: "error", data: new RTVIError("ICE connection failed") });
        }
      };
    }
  
    private async _negotiateConnection(): Promise<void> {
      if (!this._openai_cxn) {
        throw new RTVIError("Peer connection not initialized");
      }
  
      const apiKey = this._service_options.api_key;
      if (!apiKey) {
        throw new TransportStartError("No API key provided.");
      }
  
      try {
        const offer = await this._openai_cxn.createOffer();
        await this._openai_cxn.setLocalDescription(offer);
  
        const model = this._service_options.model || MODEL;
  
        const res = await fetch(`${BASE_URL}?model=${model}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/sdp",
            Authorization: `Bearer ${apiKey}`,
          },
          body: offer.sdp,
        });
  
        if (!res.ok) {
          const errorText = await res.text();
          throw new RTVIError(`Server error: ${res.status} ${res.statusText} - ${errorText}`);
        }
  
        const answer = {
          type: "answer" as RTCSdpType,
          sdp: await res.text(),
        };
        await this._openai_cxn.setRemoteDescription(answer);
  
      } catch (e: any) {
        logger.error("Error negotiating connection:", e);
        throw new TransportStartError(`Error negotiating connection: ${e.message}`);
      }
    }
  
    private _cleanup() {
      if (this._openai_channel) {
        this._openai_channel.close();
        this._openai_channel = null;
      }
      if (this._openai_cxn) {
        this._openai_cxn.close();
        this._openai_cxn = null;
      }
      this._senders = {};
      this._botTracks = {};
    }
  
    private _updateSession() {
      if (!this._channelReady()) return;
      const settings = { ...this._service_options.settings };
      if (settings.input_audio_transcription === undefined) {
        settings.input_audio_transcription = { model: "gpt-4o-transcribe" };
      }
      this._openai_channel?.send(
        JSON.stringify({
          type: "session.update",
          session: settings,
        }),
      );
      this._openai_channel?.send(
        JSON.stringify({ type: "response.create" })
      );
    }
  
    private async _handleOpenAIMessage(msg: Record<string, any>) {
      const messageDefaults = { id: crypto.randomUUID(), label: "server" };
  
      switch (msg.type) {
        case "session.created":
          this.state = "connected";
          this._callbacks.onConnected?.();
          this._updateSession();
          break;
        case "session.error":
          logger.error(`Session error: ${msg.message}`);
          this._onMessage({ ...messageDefaults, type: RTVIMessageType.ERROR, data: new RTVIError(msg.message, msg.code) });
          break;
        
        case "response.audio_transcript.delta":
        case "response.audio_transcript.done":
          this._onMessage({ 
            ...messageDefaults,
            type: RTVIMessageType.BOT_TRANSCRIPTION, 
            data: { text: msg.transcript || msg.delta, final: msg.type === "response.audio_transcript.done" } 
          });
          break;
  
        case "conversation.item.input_audio_transcription.completed":
          this._onMessage({ 
            ...messageDefaults,
            type: RTVIMessageType.USER_TRANSCRIPTION, 
            data: { text: msg.transcript.text, final: true } 
          });
          break;
          
        case "response.stream_begin":
          this._callbacks.onBotStartedSpeaking?.();
          break;
          
        case "response.stream_end":
          this._callbacks.onBotStoppedSpeaking?.();
          break;
  
        case "input_audio_buffer.speech_started":
          this._callbacks.onUserStartedSpeaking?.();
          break;
        case "input_audio_buffer.speech_stopped":
          this._callbacks.onUserStoppedSpeaking?.();
          break;
        default:
          logger.debug("Ignoring OpenAI message:", msg);
          break;
      }
    }
  
    private async _handleTrackStarted(ev: DailyEventObjectTrack) {
      if (ev.participant?.local) {
        if (this._openai_cxn && this._senders[ev.track.kind]) {
          this._senders[ev.track.kind].replaceTrack(ev.track);
        }
      }
    }
  
    private async _handleTrackStopped(ev: DailyEventObjectTrack) {}
    private _handleAvailableDevicesUpdated(ev: DailyEventObjectAvailableDevicesUpdated) {}
    private _handleSelectedDevicesUpdated(ev: DailyEventObjectSelectedDevicesUpdated) {}
  
    tracks(): Tracks {
      return {
        local: {
          audio: this._daily.participants()?.local?.tracks?.audio?.persistentTrack,
          video: this._daily.participants()?.local?.tracks?.video?.persistentTrack,
        },
        bot: this._botTracks,
      };
    }
  
    private _channelReady() {
      return this._openai_channel && this._openai_channel.readyState === "open";
    }
  
    private _sendTextInput(
      messages: LLMContextMessage[],
      runImmediately: boolean = false,
    ) {
      if (!this._channelReady()) {
        logger.warn("tried to send text input before channel was ready");
        return;
      }
      this._openai_channel?.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "user",
            text: messages.map((m) => m.content).join("\n"),
          },
          run_immediately: runImmediately,
        }),
      );
    }
  
    private _sendFunctionCallResult(data: LLMFunctionCallData) {
      if (!this._channelReady()) {
        logger.warn("tried to send function call result before channel was ready");
        return;
      }
      this._openai_channel?.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "function_result",
            name: data.function_name,
            result: data.args,
          },
        }),
      );
    }
  
    private _run() {
      if (!this._channelReady()) {
        logger.warn("tried to run before channel was ready");
        return;
      }
      this._openai_channel?.send(JSON.stringify({ type: "response.create" }));
    }
  }
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useRTVIClient } from "@pipecat-ai/client-react";
import { useState, useEffect, useRef } from "react";

export default function VoiceChat() {
  const client = useRTVIClient();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (!client) return;

    const handleConnected = () => {
      setIsConnected(true);
      setIsConnecting(false);
      console.log('Connected to OpenAI Realtime API');
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setIsConnecting(false);
      console.log('Disconnected from OpenAI Realtime API');
    };
    
    const handleBotStartedSpeaking = () => setIsBotSpeaking(true);
    const handleBotStoppedSpeaking = () => setIsBotSpeaking(false);

    const handleUserTranscript = (data: any) => {
        const { text } = data;
        if (text) setTranscript(prev => `${prev}You: ${text}\n`);
    };

    const handleBotTranscript = (data: any) => {
        const { text } = data;
        if (text) setTranscript(prev => `${prev}AI: ${text}\n`);
    };

    const handleError = (error: any) => {
      console.error('RTVI Error:', error);
      setIsConnecting(false);
      setIsConnected(false);
    };

    const handleBotReady = () => {
        const stream = (client.transport as any).botAudioStream;
        if (stream && audioRef.current) {
            console.log("Attaching bot audio stream");
            audioRef.current.srcObject = stream;
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
    };

    client.on('connected', handleConnected);
    client.on('disconnected', handleDisconnected);
    client.on('error', handleError);
    client.on('botStartedSpeaking', handleBotStartedSpeaking);
    client.on('botStoppedSpeaking', handleBotStoppedSpeaking);
    client.on('userTranscript', handleUserTranscript);
    client.on('botTranscript', handleBotTranscript);
    client.on('botReady', handleBotReady);

    return () => {
      client.off('connected', handleConnected);
      client.off('disconnected', handleDisconnected);
      client.off('error', handleError);
      client.off('botStartedSpeaking', handleBotStartedSpeaking);
      client.off('botStoppedSpeaking', handleBotStoppedSpeaking);
      client.off('userTranscript', handleUserTranscript);
      client.off('botTranscript', handleBotTranscript);
      client.off('botReady', handleBotReady);
    };
  }, [client]);

  const handleConnect = async () => {
    if (!client || isConnecting || isConnected) return;
    setIsConnecting(true);
    try {
      await client.connect();
    } catch (error) {
      console.error('Failed to connect:', error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    client?.disconnect();
  };

  return (
    <div className="flex flex-col items-center space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
          <div className={`w-8 h-8 rounded-full ${
            isConnected ? (isBotSpeaking ? 'bg-purple-500 animate-pulse' : 'bg-green-500') : 
            'bg-gray-300'
          }`} />
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-bold text-black mb-2">Cool Convo</h2>
          <p className="text-gray-600 text-sm">
            {isConnecting ? 'Connecting...' :
             !isConnected ? 'Click to start conversation' :
             isBotSpeaking ? 'AI is speaking...' : 
             'Connected. Speak now!'}
          </p>
        </div>
      </div>

      <button
        onClick={isConnected ? handleDisconnect : handleConnect}
        disabled={isConnecting || !client}
        className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
      >
        {isConnecting ? 'Connecting...' : isConnected ? 'End Chat' : 'Start Chat'}
      </button>

      {transcript && (
        <div className="w-full max-w-lg bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Conversation:</h3>
          <pre className="text-sm whitespace-pre-wrap text-gray-700 max-h-40 overflow-y-auto">
            {transcript}
          </pre>
        </div>
      )}

      {isConnected && (
        <div className="text-center">
          <p className="text-xs text-gray-400">
            ✅ Secure Token-Based Connection
          </p>
        </div>
      )}
      <audio ref={audioRef} playsInline />
    </div>
  );
} 
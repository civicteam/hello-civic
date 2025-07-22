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
  const [ripples, setRipples] = useState<Array<{ id: number; delay: number }>>([]);

  // Create ripple effect when speaking
  useEffect(() => {
    if (isBotSpeaking || isConnecting) {
      const interval = setInterval(() => {
        setRipples(prev => {
          const newRipple = { id: Date.now(), delay: Math.random() * 0.5 };
          return [...prev.slice(-2), newRipple]; // Keep only last 3 ripples
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setRipples([]);
    }
  }, [isBotSpeaking, isConnecting]);

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

  const getStatusMessage = () => {
    if (isConnecting) return 'Initializing...';
    if (!isConnected) return 'Ready to chat';
    if (isBotSpeaking) return 'AI is speaking';
    return 'Listening...';
  };

  const getStatusColor = () => {
    if (isConnecting) return 'bg-gradient-to-br from-yellow-400 to-orange-400';
    if (!isConnected) return 'bg-gray-400';
    if (isBotSpeaking) return 'bg-gradient-to-br from-purple-500 to-blue-500';
    return 'bg-gradient-to-br from-green-400 to-emerald-500';
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Enhanced Status Indicator with Ripples */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {/* Ripple Effects */}
          {ripples.map((ripple) => (
            <div
              key={ripple.id}
              className="absolute inset-0 rounded-full border-2 border-gray-300 animate-ping opacity-30"
              style={{
                animationDelay: `${ripple.delay}s`,
                animationDuration: '2s'
              }}
            />
          ))}
          
          {/* Main Status Circle */}
          <div className="w-24 h-24 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-50 relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-300">
            {/* Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Status Indicator */}
            <div className={`w-12 h-12 rounded-full transition-all duration-500 ${getStatusColor()} relative z-10 shadow-lg`}>
              {/* Inner glow effect */}
              {(isBotSpeaking || isConnecting) && (
                <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-pulse" />
              )}
              
              {/* Voice bars when speaking */}
              {isBotSpeaking && (
                <div className="absolute inset-0 flex items-center justify-center space-x-0.5">
                  <div className="voice-bar bg-white h-2"></div>
                  <div className="voice-bar bg-white h-3"></div>
                  <div className="voice-bar bg-white h-2"></div>
                </div>
              )}
              
              {/* Connecting dots */}
              {isConnecting && (
                <div className="absolute inset-0 flex items-center justify-center space-x-1">
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-bold text-black mb-1 tracking-tight">Voice Assistant</h2>
          <p className={`text-sm transition-colors duration-300 ${
            isConnected ? 'text-green-600' : 'text-gray-600'
          }`}>
            {getStatusMessage()}
          </p>
        </div>
      </div>

      {/* Creative Connection Button */}
      <div className="relative group">
        <button
          onClick={isConnected ? handleDisconnect : handleConnect}
          disabled={isConnecting || !client}
          className={`relative px-10 py-4 rounded-xl font-semibold transition-all duration-300 border-2 transform hover:scale-105 active:scale-95 ${
            isConnected 
              ? 'bg-white text-black border-black hover:bg-gray-50 hover:shadow-lg' 
              : 'bg-black text-white border-black hover:bg-gray-800 hover:shadow-xl shadow-black/20'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
        >
          {/* Button glow effect */}
          {!isConnected && !isConnecting && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
          )}
          
          <span className="relative z-10">
            {isConnecting ? (
              <span className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <div className="voice-bar bg-white"></div>
                  <div className="voice-bar bg-white"></div>
                  <div className="voice-bar bg-white"></div>
                  <div className="voice-bar bg-white"></div>
                  <div className="voice-bar bg-white"></div>
                </div>
                <span>Connecting...</span>
              </span>
            ) : isConnected ? (
              <span className="flex items-center space-x-2">
                <span>End Chat</span>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>Start Chat</span>
                <div className="w-2 h-2 bg-white rounded-full opacity-75"></div>
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Enhanced Connection Status */}
      {isConnected && (
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-medium">Secure connection active</span>
          </div>
        </div>
      )}

      {/* Creative Conversation Display */}
      {transcript && (
        <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black text-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Live Conversation</span>
            </h3>
            <button 
              onClick={() => setTranscript('')}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors"
            >
              ✕ Clear
            </button>
          </div>
          <div className="text-sm text-gray-700 max-h-40 overflow-y-auto conversation-scroll">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {transcript.split('\n').map((line, index) => {
                if (line.startsWith('You: ')) {
                  return (
                    <div key={index} className="mb-2 p-2 bg-blue-50 rounded-lg border-l-3 border-blue-400">
                      <span className="font-medium text-blue-700">You:</span>
                      <span className="text-gray-700 ml-1">{line.slice(5)}</span>
                    </div>
                  );
                } else if (line.startsWith('AI: ')) {
                  return (
                    <div key={index} className="mb-2 p-2 bg-purple-50 rounded-lg border-l-3 border-purple-400">
                      <span className="font-medium text-purple-700">AI:</span>
                      <span className="text-gray-700 ml-1">{line.slice(4)}</span>
                    </div>
                  );
                }
                return line && <div key={index} className="mb-1">{line}</div>;
              })}
            </pre>
          </div>
        </div>
      )}

      <audio ref={audioRef} playsInline />
    </div>
  );
} 
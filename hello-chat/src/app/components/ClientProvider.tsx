'use client';

import { RTVIClientProvider } from "@pipecat-ai/client-react";
import { RTVIClient, RTVIClientOptions } from "@pipecat-ai/client-js";
import { OpenAIRealTimeWebRTCTransport } from '../lib/OpenAIRealTimeWebRTCTransport';
import { useState, useEffect, useCallback } from "react";

const MODEL = "gpt-4o-realtime-preview-2024-12-17";
const VOICE = "alloy";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client, setClient] = useState<RTVIClient | null>(null);

  const createClient = useCallback(async () => {
    try {
      const res = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, voice: VOICE }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to get session token');
      }

      const session = await res.json();

      const transport = new OpenAIRealTimeWebRTCTransport({
        api_key: session.client_secret.value,
        model: MODEL,
      });

      const clientOptions: RTVIClientOptions = {
        transport,
        enableMic: true,
        params: {
          baseUrl: "/api",
          endpoints: {},
        }
      };
      
      const rtviClient = new RTVIClient(clientOptions);

      setClient(rtviClient);
    } catch (error) {
      console.error("Failed to create RTVI client:", error);
    }
  }, []);

  useEffect(() => {
    if (!client) {
      createClient();
    }
  }, [client, createClient]);

  if (!client) {
    return <div>{children}</div>;
  }

  return (
    <RTVIClientProvider client={client}>
      {children}
    </RTVIClientProvider>
  );
} 
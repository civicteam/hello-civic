/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import OpenAI from 'openai';
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// This Next.js API route is the new, secure "server".
// It proxies the request to get an ephemeral session token from OpenAI.
export async function POST(req: NextRequest) {
  try {
    const { model, voice } = await req.json();

    // Create a new session using the server's API key
    const session = await openai.beta.realtime.sessions.create({
      model: model || "gpt-4o-realtime-preview-2025-06-03",
      voice: voice || "alloy",
    });

    // Return the entire session object to the client
    return NextResponse.json(session);
  } catch (error: any) {
    console.error("Error creating OpenAI session:", error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
} 
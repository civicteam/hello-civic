import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // For OpenAI transport, we just return success since the transport handles the connection directly
  return NextResponse.json({ success: true });
} 
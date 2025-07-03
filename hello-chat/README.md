<h1 align="center">
  <img src="../assets/hello.png"
       alt="A dignified great dane in a suit and glasses, calmly smoking a pipe in front of a circuit-board backdrop—our security watchdog."
       width="100%" />
</h1>

<p align="center">
  <b>Hello Chat - Voice Chat Demo</b><br/>
  <em>Secure Authentication Patterns for AI Voice Applications</em>
</p>

---

A demo voice chat application showcasing secure authentication patterns for AI applications. Built with Next.js and OpenAI's Realtime API, this project demonstrates how to integrate civic-auth for secure voice interactions.

> 🚨 **Security Notice**: This is a demo project for educational purposes. The current implementation lacks authentication and contains security vulnerabilities that must be addressed before production use.

## Purpose

This application serves as a **cookbook recipe** for implementing secure voice chat with AI agents. It demonstrates:

- **Authentication Patterns**: How to integrate civic-auth for secure user verification
- **AI Voice Integration**: Real-time voice communication with OpenAI's Realtime API
- **Security Best Practices**: Proper API key management and user authentication
- **Clean Architecture**: Modern React/Next.js patterns for voice applications

## Architecture Overview

### Frontend Components
- **VoiceChat.tsx**: Main voice chat interface with WebRTC audio handling
- **ClientProvider.tsx**: RTVI client management and session token handling
- **Layout.tsx**: Root application layout with security context

### Backend API
- **POST /api/token**: Creates ephemeral OpenAI session tokens (requires authentication)
- **POST /api/connect**: Connection endpoint for civic-auth integration

### Data Flow
1. User authenticates via civic-auth (to be implemented)
2. Client requests session token from `/api/token`
3. Server validates user authentication and creates OpenAI session
4. Client receives ephemeral token for WebRTC connection
5. Direct WebRTC connection established with OpenAI servers
6. Bidirectional audio streams between authenticated user and AI

### Security Model
- **Authentication**: Civic-auth integration for user verification
- **Authorization**: Session-based access control for API endpoints
- **Token Management**: Ephemeral tokens with limited scope and duration
- **API Security**: Server-side API key protection and rate limiting

## Features

- Clean, minimal black and white design
- Voice chat powered by OpenAI Realtime API
- Real-time bidirectional audio communication
- Secure authentication with civic-auth integration
- Session-based access control
- Direct WebRTC connection to OpenAI

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your-openai-api-key
   CIVIC_AUTH_SECRET=your-civic-auth-secret
   ```

3. **Get OpenAI API Key**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Make sure you have access to the Realtime API (GPT-4o Realtime)

4. **Configure Civic Auth**
   - Visit [Civic Auth Dashboard](https://civic.com)
   - Create a new application
   - Configure authentication settings

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

1. **Authenticate**: Sign in with civic-auth
2. **Start Chat**: Click "Start Chat" to begin voice conversation
3. **Permissions**: Allow microphone permissions when prompted
4. **Interact**: Speak naturally - the AI responds with voice
5. **End Session**: Click "End Chat" to disconnect securely

## Configuration

The voice chat is configured with:
- **Voice**: Alloy (OpenAI's default voice)
- **Model**: GPT-4o Realtime
- **Turn Detection**: Server-side Voice Activity Detection
- **Transcription**: Whisper-1 for input audio

Available voices: `alloy`, `ash`, `ballad`, `coral`, `echo`, `sage`, `shimmer`, `verse`

## Tech Stack

- **Next.js 15** - React framework with App Router
- **Pipecat AI** - Voice AI chat library
- **OpenAI Realtime API** - Real-time voice AI
- **WebRTC** - Direct peer-to-peer audio
- **Civic Auth** - Secure authentication and identity verification
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type safety and developer experience

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── token/route.ts      # OpenAI session token generation
│   │   └── connect/route.ts    # Civic auth connection endpoint
│   ├── components/
│   │   ├── VoiceChat.tsx       # Main voice chat component
│   │   └── ClientProvider.tsx  # RTVI client provider
│   ├── lib/
│   │   └── OpenAIRealTimeWebRTCTransport.ts  # WebRTC transport layer
│   ├── layout.tsx              # Root layout with security context
│   └── page.tsx                # Main page
└── ...
```

## Security Considerations

### Current Status
- ⚠️ **Authentication**: Not yet implemented (civic-auth integration pending)
- ⚠️ **API Keys**: Server-side protection required
- ⚠️ **Rate Limiting**: No current implementation
- ⚠️ **Input Validation**: Minimal validation in place

### Before Production
1. **Implement civic-auth**: Add proper user authentication
2. **Secure API endpoints**: Add authorization checks
3. **Add rate limiting**: Prevent abuse and control costs
4. **Input validation**: Validate all user inputs
5. **Error handling**: Implement secure error responses
6. **Logging**: Add security event logging

## Troubleshooting

### Common Issues

1. **Authentication required**: Civic-auth integration needed for secure access
2. **API key issues**: Ensure OpenAI API key is properly configured server-side
3. **Microphone permissions**: Allow microphone access in browser settings
4. **Connection fails**: Check API key and Realtime API access
5. **No audio response**: Verify network connection and browser console

### Browser Compatibility

This app works best with:
- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

## Contributing

This is a demo project for the civic-auth cookbook. Feel free to:
1. Open issues for security concerns or improvements
2. Submit pull requests with civic-auth integration examples
3. Add new authentication patterns and security features

## License

MIT © 2025 Civic Team

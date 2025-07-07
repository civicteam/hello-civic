import VoiceChat from "./components/VoiceChat";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">Hello Chat</h1>
          <p className="text-gray-600 text-lg">
            Simple voice chat secured by Civic
          </p>
        </div>
        
        <div className="bg-white border-2 border-black rounded-lg p-8 shadow-lg">
          <VoiceChat />
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Click &rdquo;Start Chat&rdquo; to begin your voice conversation
          </p>
        </div>
      </div>
    </div>
  );
}

import { UserButton } from "@civic/auth/react";
import VoiceChat from "./components/VoiceChat";
import { getUser } from "@civic/auth/nextjs";

export default async function Home() {
  const user = await getUser();
  console.log(user);

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-20 left-10 w-72 h-72 bg-black rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-black rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <div className="border-b border-gray-200 py-8 relative z-10">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex items-center space-x-4">
            {/* Creative Logo */}
            <div className="relative">
              <div className="w-8 h-8 bg-black rounded-lg transform rotate-12 animate-pulse"></div>
              <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-md"></div>
            </div>
            
            <div>
              <h1 className="text-4xl font-bold text-black tracking-tight">
                Hello Chat
                <span className="inline-block w-2 h-8 bg-black ml-1 animate-pulse"></span>
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                Simple voice chat secured by{" "}
                <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Civic
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-lg">
          <div className="bg-white border border-gray-300 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] relative overflow-hidden group">
            {/* Card Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              {user ? (
                <VoiceChat />
              ) : (
                <div className="text-center">
                  <div className="mb-8">
                    {/* Animated Authentication Icon */}
                    <div className="relative mx-auto mb-6">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-full flex items-center justify-center relative overflow-hidden group/auth cursor-pointer">
                        {/* Scanning Animation */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -translate-x-full group-hover/auth:translate-x-full transition-transform duration-1000"></div>
                        
                        <div className="w-10 h-10 bg-gray-400 rounded-full relative z-10 group-hover/auth:bg-blue-500 transition-colors duration-300">
                          <div className="absolute inset-2 border-2 border-white rounded-full opacity-0 group-hover/auth:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </div>
                      
                      {/* Floating Elements */}
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-black mb-3 tracking-tight">
                      Authentication Required
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
                      Please sign in with your{" "}
                      <span className="font-semibold text-blue-600">Civic Pass</span>{" "}
                      to start your secure voice conversation
                    </p>
                  </div>
                  
                  <div className="transform hover:scale-105 transition-transform duration-200">
                    <UserButton />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Creative Footer */}
      <div className="border-t border-gray-200 py-6 relative z-10">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Secured by Civic</span>
            </div>
            
            <div className="w-px h-4 bg-gray-300"></div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span>Token-based authentication</span>
            </div>
            
            <div className="w-px h-4 bg-gray-300"></div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span>Real-time voice AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useUser, UserButton } from "@civic/auth-web3/react";
import Link from "next/link";
import { useMemo } from "react";

export default function Home() {
  const { user } = useUser();
  
  const isLoggedIn = useMemo(() => !!user, [user]);
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-12 p-8 relative overflow-hidden">
      {/* Brand Logo Mark */}
      <div className="absolute top-8 left-8 w-12 h-12 bg-black rounded-full flex items-center justify-center">
        <span className="text-white text-xl font-bold transform rotate-45">↗</span>
      </div>
      
      {/* User Button */}
      <div className="absolute top-8 right-8">
        <UserButton />
      </div>
      
      {/* Main Brand Title */}
      <div className="text-center space-y-4">
        <h1 className="font-display-black text-8xl text-black tracking-tighter">
          hello-honey
        </h1>
        <div className="w-24 h-2 bg-yellow-400 mx-auto"></div>
        <p className="font-display text-xl text-black max-w-md">
          AI Character Generator with Solana NFT Minting
        </p>
      </div>
      
      {/* Character Image with Frame */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-br from-pink-500 via-blue-500 to-green-500 rounded-2xl blur-sm opacity-75"></div>
        <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
          <Image
            src="/hello-honey-character.png"
            alt="Hello Honey Character"
            width={400}
            height={400}
            priority
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      </div>
      
      {/* Action Button - Only show when user is logged in */}
      {isLoggedIn && (
        <Link href="/dashboard">
          <button className="bg-black text-white px-12 py-4 font-display-bold text-lg hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg">
            Go to Dashboard
          </button>
        </Link>
      )}
      
      {/* Decorative Elements */}
      <div className="absolute bottom-8 right-8 flex gap-4">
        <div className="w-8 h-8 bg-yellow-400 rounded-full"></div>
        <div className="w-8 h-8 bg-pink-500 rounded-full"></div>
        <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
        <div className="w-8 h-8 bg-green-500 rounded-full"></div>
      </div>
    </div>
  );
}

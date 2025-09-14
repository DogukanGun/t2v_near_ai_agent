"use client";
import { signIn, signOut, useSession } from "next-auth/react";

interface TwitterConnectButtonProps {
  callbackUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function TwitterConnectButton({ 
  callbackUrl = "/app", 
  className = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200",
  children 
}: TwitterConnectButtonProps) {
  const { data: session, status } = useSession();
  
  console.log('🔍 TwitterConnectButton - Session status:', status);
  console.log('📍 TwitterConnectButton - Session data:', session);
  console.log('🎯 TwitterConnectButton - Twitter ID:', session?.user?.twitterId);

  if (status === "loading") {
    return (
      <button disabled className={`${className} opacity-50 cursor-not-allowed`}>
        Loading...
      </button>
    );
  }

  if (session?.user?.twitterId) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          Connected as @{session.user.twitterId}
        </span>
        <button 
          onClick={() => signOut()}
          className="text-red-600 hover:text-red-700 text-sm underline"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("twitter", { callbackUrl })}
      className={className}
    >
      {children || "Connect X"}
    </button>
  );
}
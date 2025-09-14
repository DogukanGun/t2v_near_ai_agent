"use client";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Connect your X account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your X (Twitter) account to continue
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={() => signIn("twitter", { callbackUrl: "/app" })}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Connect X
          </button>
        </div>
      </div>
    </div>
  );
}

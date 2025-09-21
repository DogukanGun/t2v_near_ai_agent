'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">MythosReply</h1>
            </div>
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/auth/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Twitter
            <span className="text-indigo-600"> Automation</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Automate your Twitter engagement with intelligent replies, multi-profile monitoring, 
            and advanced analytics. Join thousands of creators and businesses already on the waitlist.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          {!submitted ? (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                Join the Waitlist
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to the Waitlist!</h2>
              <p className="text-gray-600 mb-6">
                Thanks for your interest in MythosReply. We'll notify you as soon as we launch!
              </p>
              <Link 
                href="/"
                className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
              >
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
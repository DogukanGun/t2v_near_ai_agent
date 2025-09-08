'use client';

import React, { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userIdentifier: string) => Promise<void>;
  onVerifyOTP: (username: string, otpCode: string) => Promise<void>;
}

type LoginStep = 'email' | 'otp';

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onVerifyOTP,
}) => {
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOTPCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setStep('email');
    setEmail('');
    setOTPCode('');
    setError('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await onLogin(email);
      setStep('otp');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      
      // If it's a server configuration error, show helpful message
      if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        setError('Server configuration error. Please check that the backend email service is properly configured.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await onVerifyOTP(email, otpCode);
      resetForm();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOTPCode('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-base-200 rounded-2xl shadow-xl max-w-md w-full animate-bounce-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-base-300">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black dark:text-black">
              {step === 'email' ? 'Welcome to Myth.OS' : 'Enter Verification Code'}
            </h2>
            <button
              onClick={handleClose}
              className="btn btn-ghost btn-sm btn-circle"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-black dark:text-black mt-2">
            {step === 'email' 
              ? 'Enter your email to login or create an account' 
              : `We've sent a verification code to ${email}`
            }
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="alert alert-error mb-4 animate-fade-in">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email Address</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="input input-bordered w-full"
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
              {error && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setError('')}
                    className="btn btn-outline btn-sm"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Verification Code</span>
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOTPCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="input input-bordered w-full text-center text-lg tracking-widest"
                  required
                  disabled={isLoading}
                  autoFocus
                  maxLength={6}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="btn btn-outline flex-1"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={isLoading || !otpCode.trim()}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Login'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            {step === 'email' ? (
              <p>New to Myth.OS? An account will be created automatically with your NEAR wallet.</p>
            ) : (
              <div className="space-y-2">
                <p>Did not receive the code? Check your spam folder.</p>
                <button
                  onClick={handleBackToEmail}
                  className="btn btn-ghost btn-xs"
                  disabled={isLoading}
                >
                  Resend Code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 
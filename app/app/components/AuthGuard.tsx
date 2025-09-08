'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/contexts/AuthContext';
import { LoginModal } from './auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, login, verifyOTP } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setIsLoginModalOpen(true);
    }
  }, [isLoading, isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
  };

  const handleModalClose = () => {
    // Don't allow closing the modal if user is not authenticated
    if (isAuthenticated) {
      setIsLoginModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-base-100">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading Myth.OS...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleModalClose}
        onLogin={login}
        onVerifyOTP={async (username: string, otpCode: string) => {
          await verifyOTP(username, otpCode);
          handleLoginSuccess();
        }}
      />
    </>
  );
}; 
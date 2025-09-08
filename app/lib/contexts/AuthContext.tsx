'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';

interface User {
  username: string;
  accountId: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userIdentifier: string) => Promise<void>;
  verifyOTP: (username: string, otpCode: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const initializeAuth = () => {
      const token = authService.getToken();
      const accountId = authService.getAccountId();
      
      if (token && accountId) {
        // We don't store username, so we'll extract it from account_id or use account_id
        const username = accountId.includes('.') ? accountId.split('.')[0] : accountId;
        setUser({ username, accountId });
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (userIdentifier: string): Promise<void> => {
    try {
      await authService.initiateLogin(userIdentifier);
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (username: string, otpCode: string): Promise<void> => {
    try {
      const authData = await authService.verifyOTP(username, otpCode);
      setUser({ username, accountId: authData.account_id });
    } catch (error) {
      throw error;
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = (): void => {
    const token = authService.getToken();
    const accountId = authService.getAccountId();
    
    if (token && accountId) {
      const username = accountId.includes('.') ? accountId.split('.')[0] : accountId;
      setUser({ username, accountId });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    verifyOTP,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
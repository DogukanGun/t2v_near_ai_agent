'use client';

import { useState, useEffect, useCallback } from 'react';
import { profileService, UserProfile } from '../services/profile';
import { useAuth } from '../contexts/AuthContext';

interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (updates: { username?: string; twitter_username?: string }) => Promise<UserProfile>;
}

export const useProfile = (): UseProfileReturn => {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const profileData = await profileService.getProfile();
      setProfile(profileData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('Profile fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updateProfile = useCallback(async (updates: { username?: string; twitter_username?: string }): Promise<UserProfile> => {
    if (!profile) {
      throw new Error('No profile loaded');
    }

    try {
      const updatedProfile = await profileService.updateProfile(updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw err;
    }
  }, [profile]);

  const refetch = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  // Load profile when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setProfile(null);
      setError(null);
    }
  }, [isAuthenticated, fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile,
  };
}; 
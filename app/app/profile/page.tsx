'use client';

import React, { useState, useEffect } from 'react';
import { useProfile } from '../../lib/hooks/useProfile';
import { profileService } from '../../lib/services/profile';
import { WalletConnection } from '../components/wallet/WalletConnection';

export default function ProfilePage() {
  const { profile, isLoading, error: profileError, refetch, updateProfile: updateProfileHook } = useProfile();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [username, setUsername] = useState('');
  const [twitterUsername, setTwitterUsername] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setTwitterUsername(profile.twitter_username || '');
    }
  }, [profile]);

  useEffect(() => {
    if (profileError) {
      setError(profileError);
    }
  }, [profileError]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: any = {};
      
      if (username !== profile.username) {
        updates.username = username;
      }
      
      if (twitterUsername !== (profile.twitter_username || '')) {
        updates.twitter_username = twitterUsername || null;
      }

      if (Object.keys(updates).length === 0) {
        setSuccess('No changes to save');
        return;
      }

      await updateProfileHook(updates);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyPrivateKey = async () => {
    if (!profile?.private_key) return;
    
    try {
      await profileService.copyPrivateKeyToClipboard(profile.private_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setError('Failed to copy private key');
    }
  };

  const handleTransferSuccess = (txHash: string) => {
    setSuccess(`Transfer completed successfully! Transaction: ${txHash.substring(0, 10)}...`);
    setTimeout(() => setSuccess(''), 5000);
  };

  const resetForm = () => {
    if (profile) {
      setUsername(profile.username);
      setTwitterUsername(profile.twitter_username || '');
    }
    setError('');
    setSuccess('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-base-100">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-base-100">
        <div className="text-center">
          <p className="text-error">Failed to load profile</p>
          <button onClick={refetch} className="btn btn-outline btn-sm mt-2">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-base-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-black mb-2">
            Profile Settings
          </h1>
          <p className="text-black dark:text-black">
            Manage your account settings and wallet connections
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile Information
              </h2>
              
              {error && (
                <div className="alert alert-error mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="alert alert-success mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Username</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input input-bordered w-full"
                    required
                    disabled={isUpdating}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Twitter Username</span>
                    <span className="label-text-alt">Optional</span>
                  </label>
                  <div className="input-group">
                    <span>@</span>
                    <input
                      type="text"
                      value={twitterUsername}
                      onChange={(e) => setTwitterUsername(e.target.value)}
                      placeholder="twitter_handle"
                      className="input input-bordered w-full"
                      disabled={isUpdating}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">NEAR Account ID</span>
                  </label>
                  <input
                    type="text"
                    value={profile.account_id}
                    className="input input-bordered w-full"
                    disabled
                    readOnly
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-outline"
                    disabled={isUpdating}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Security Settings */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Internal Wallet Keys
              </h2>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Public Key</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      value={profile.public_key}
                      className="input input-bordered w-full text-sm"
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Private Key</span>
                    <span className="label-text-alt text-warning">Keep this secure!</span>
                  </label>
                  <div className="input-group">
                    <input
                      type={showPrivateKey ? "text" : "password"}
                      value={profile.private_key}
                      className="input input-bordered w-full text-sm font-mono"
                      disabled
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="btn btn-square btn-outline"
                    >
                      {showPrivateKey ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m3.121-3.121l7.071-7.071M12 12l2.121 2.121" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCopyPrivateKey}
                  className="btn btn-warning btn-outline w-full"
                  disabled={!profile.private_key}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Export Private Key
                    </>
                  )}
                </button>

                <div className="alert alert-warning">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="font-bold">Important Security Notice</h3>
                    <div className="text-xs">Never share your private key. Anyone with access to it can control your NEAR account.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* External Wallet Connection */}
          <div className="lg:col-span-1">
            <WalletConnection
              internalAccountId={profile.account_id}
              onTransferSuccess={handleTransferSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import { useWallet } from '../../../lib/contexts/WalletContext';
import { TransferModal } from './TransferModal';

interface WalletConnectionProps {
  internalAccountId?: string;
  onTransferSuccess?: (txHash: string) => void;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({
  internalAccountId = '',
  onTransferSuccess,
}) => {
  const { 
    isConnected, 
    accountId, 
    connectWallet, 
    disconnectWallet, 
    isLoading 
  } = useWallet();
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleTransferSuccess = (txHash: string) => {
    if (onTransferSuccess) {
      onTransferSuccess(txHash);
    }
    setIsTransferModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-center p-8">
            <div className="loading loading-spinner loading-lg"></div>
            <span className="ml-3">Initializing wallet...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            External Wallet
          </h2>

          {!isConnected ? (
            <div className="text-center py-6">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <p className="text-gray-600 mb-4">No external wallet connected</p>
              <button
                onClick={connectWallet}
                className="btn btn-primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-base-300 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Connected Account:</p>
                    <p className="font-mono text-sm truncate">{accountId}</p>
                  </div>
                  <div className="badge badge-success">Connected</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsTransferModalOpen(true)}
                  className="btn btn-primary flex-1"
                  disabled={!internalAccountId}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Transfer to Internal
                </button>
                
                <button
                  onClick={handleDisconnect}
                  className="btn btn-outline btn-error"
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>

              {!internalAccountId && (
                <div className="alert alert-warning">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="font-bold">Internal wallet not available</h3>
                    <div className="text-xs">Please ensure you have an internal wallet account to transfer funds.</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        internalAccountId={internalAccountId}
        onTransferSuccess={handleTransferSuccess}
      />
    </>
  );
}; 
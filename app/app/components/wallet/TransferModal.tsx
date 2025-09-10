'use client';

import React, { useState } from 'react';
import { useWallet } from '../../../lib/contexts/WalletContext';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  internalAccountId: string;
  onTransferSuccess: (txHash: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  internalAccountId,
  onTransferSuccess,
}) => {
  const { transferToInternalWallet, accountId: externalAccountId } = useWallet();
  const [amount, setAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!internalAccountId) {
      setError('Internal wallet account not found');
      return;
    }

    setIsTransferring(true);
    setError('');

    try {
      const txHash = await transferToInternalWallet(amount, internalAccountId);
      onTransferSuccess(txHash);
      setAmount('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleClose = () => {
    if (!isTransferring) {
      setAmount('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Transfer NEAR Tokens</h3>
        
        <div className="mb-4">
          <div className="bg-base-200 p-3 rounded-lg mb-2">
            <p className="text-sm text-gray-600 mb-1">From (External Wallet):</p>
            <p className="font-mono text-sm truncate">{externalAccountId}</p>
          </div>
          
          <div className="bg-base-200 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">To (Internal Wallet):</p>
            <p className="font-mono text-sm truncate">{internalAccountId}</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleTransfer}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Amount (NEAR)</span>
            </label>
            <div className="input-group">
              <input
                type="number"
                step="0.000001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="input input-bordered flex-1"
                disabled={isTransferring}
                required
              />
              <span className="bg-base-200 px-3 py-2 rounded-r-lg border border-l-0 border-base-300">
                NEAR
              </span>
            </div>
            <label className="label">
              <span className="label-text-alt text-gray-500">
                Minimum: 0.000001 NEAR
              </span>
            </label>
          </div>

          <div className="alert alert-info mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold">Transaction Info</h3>
              <div className="text-xs">
                This will transfer NEAR tokens from your external wallet to your internal wallet. 
                You'll need to approve the transaction in your connected wallet.
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={isTransferring}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isTransferring || !amount}
            >
              {isTransferring ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Transferring...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Transfer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
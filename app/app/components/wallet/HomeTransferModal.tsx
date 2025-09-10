'use client';

import React, { useState } from 'react';

interface HomeTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromAccountId: string;
  onTransferSuccess?: (txHash: string) => void;
}

export const HomeTransferModal: React.FC<HomeTransferModalProps> = ({
  isOpen,
  onClose,
  fromAccountId,
  onTransferSuccess,
}) => {
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!recipientId.trim()) {
      setError('Please enter a recipient account ID');
      return;
    }

    if (recipientId === fromAccountId) {
      setError('Cannot transfer to the same account');
      return;
    }

    setIsTransferring(true);
    setError('');

    try {
      // Simulate transfer transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock transaction hash
      const mockTxHash = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (onTransferSuccess) {
        onTransferSuccess(mockTxHash);
      }
      
      setRecipientId('');
      setAmount('');
      setMemo('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleClose = () => {
    if (!isTransferring) {
      setRecipientId('');
      setAmount('');
      setMemo('');
      setError('');
      onClose();
    }
  };

  const quickAmounts = ['1', '5', '10', '25', '50'];

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg mb-4">Transfer NEAR</h3>

        {error && (
          <div className="alert alert-error mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleTransfer}>
          {/* From Account */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">From</span>
              <span className="label-text-alt">Balance: 1,234.56 NEAR</span>
            </label>
            <input
              type="text"
              value={fromAccountId}
              className="input input-bordered"
              disabled
              readOnly
            />
          </div>

          {/* To Account */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">To</span>
            </label>
            <input
              type="text"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              placeholder="recipient.near"
              className="input input-bordered"
              disabled={isTransferring}
              required
            />
            <label className="label">
              <span className="label-text-alt text-gray-500">
                Enter the recipient's NEAR account ID
              </span>
            </label>
          </div>

          {/* Amount */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Amount</span>
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
            
            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mt-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount)}
                  className="btn btn-xs btn-outline"
                  disabled={isTransferring}
                >
                  {quickAmount}
                </button>
              ))}
            </div>
          </div>

          {/* Memo (Optional) */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-medium">Memo</span>
              <span className="label-text-alt">Optional</span>
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Add a note to this transfer..."
              className="textarea textarea-bordered h-20"
              disabled={isTransferring}
              maxLength={200}
            />
            <label className="label">
              <span className="label-text-alt">{memo.length}/200 characters</span>
            </label>
          </div>

          {/* Transaction Summary */}
          {amount && recipientId && (
            <div className="bg-base-200 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2">Transaction Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>{amount} NEAR</span>
                </div>
                <div className="flex justify-between">
                  <span>Gas Fee:</span>
                  <span>~0.00001 NEAR</span>
                </div>
                <div className="divider my-2"></div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{(parseFloat(amount) + 0.00001).toFixed(6)} NEAR</span>
                </div>
              </div>
            </div>
          )}

          <div className="alert alert-info mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold">Transfer Info</h3>
              <div className="text-xs">
                This will transfer NEAR tokens from your internal wallet to the specified recipient.
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
              disabled={isTransferring || !amount || !recipientId}
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
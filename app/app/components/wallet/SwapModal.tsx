'use client';

import React, { useState } from 'react';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwapSuccess?: (txHash: string) => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({
  isOpen,
  onClose,
  onSwapSuccess,
}) => {
  const [fromToken, setFromToken] = useState('NEAR');
  const [toToken, setToToken] = useState('USDT');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState('');

  const tokens = ['NEAR', 'USDT', 'USDC', 'ETH', 'BTC'];

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (fromToken === toToken) {
      setError('Cannot swap to the same token');
      return;
    }

    setIsSwapping(true);
    setError('');

    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock transaction hash
      const mockTxHash = `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (onSwapSuccess) {
        onSwapSuccess(mockTxHash);
      }
      
      setFromAmount('');
      setToAmount('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Swap failed');
    } finally {
      setIsSwapping(false);
    }
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    // Mock exchange rate calculation
    if (value && !isNaN(parseFloat(value))) {
      const rate = fromToken === 'NEAR' ? 5.2 : 0.19; // Mock rates
      setToAmount((parseFloat(value) * rate).toFixed(6));
    } else {
      setToAmount('');
    }
  };

  const swapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleClose = () => {
    if (!isSwapping) {
      setFromAmount('');
      setToAmount('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg mb-4">Swap Tokens</h3>

        {error && (
          <div className="alert alert-error mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSwap}>
          {/* From Token */}
          <div className="bg-base-200 p-4 rounded-lg mb-2">
            <label className="label">
              <span className="label-text font-medium">From</span>
              <span className="label-text-alt">Balance: 1,234.56 {fromToken}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.000001"
                min="0"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                placeholder="0.0"
                className="input input-bordered flex-1"
                disabled={isSwapping}
                required
              />
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                className="select select-bordered min-w-20"
                disabled={isSwapping}
              >
                {tokens.map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center my-2">
            <button
              type="button"
              onClick={swapTokens}
              className="btn btn-circle btn-ghost"
              disabled={isSwapping}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </button>
          </div>

          {/* To Token */}
          <div className="bg-base-200 p-4 rounded-lg mb-4">
            <label className="label">
              <span className="label-text font-medium">To</span>
              <span className="label-text-alt">Balance: 0 {toToken}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.000001"
                min="0"
                value={toAmount}
                placeholder="0.0"
                className="input input-bordered flex-1"
                disabled
                readOnly
              />
              <select
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
                className="select select-bordered min-w-20"
                disabled={isSwapping}
              >
                {tokens.map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Exchange Rate Info */}
          {fromAmount && toAmount && (
            <div className="bg-base-300 p-3 rounded-lg mb-4">
              <div className="text-sm">
                <p className="font-medium">Exchange Rate</p>
                <p>1 {fromToken} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken}</p>
              </div>
            </div>
          )}

          <div className="alert alert-info mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold">Swap Info</h3>
              <div className="text-xs">
                This is a demo swap interface. In production, this would connect to a DEX like Ref Finance.
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleClose}
              disabled={isSwapping}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSwapping || !fromAmount || !toAmount}
            >
              {isSwapping ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Swapping...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  Swap
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
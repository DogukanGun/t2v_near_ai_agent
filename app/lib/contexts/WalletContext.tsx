'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupSender } from '@near-wallet-selector/sender';
import { setupNightly } from '@near-wallet-selector/nightly';
import { setupMathWallet } from '@near-wallet-selector/math-wallet';
import { setupLedger } from '@near-wallet-selector/ledger';
import { setupWalletConnect } from '@near-wallet-selector/wallet-connect';
import type { WalletSelector, AccountState, NetworkId } from '@near-wallet-selector/core';
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import * as nearAPI from 'near-api-js';

const NETWORK_ID: NetworkId = (process.env.NEXT_PUBLIC_NETWORK_ID as NetworkId) || 'testnet';
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || 'guest-book.testnet';

interface WalletContextType {
  selector: WalletSelector | null;
  modal: WalletSelectorModal | null;
  accounts: AccountState[];
  accountId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => void;
  disconnectWallet: () => Promise<void>;
  transferToInternalWallet: (amount: string, receiverId: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<AccountState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const accountId = accounts.find((account) => account.active)?.accountId || null;
  const isConnected = !!accountId;

  useEffect(() => {
    const initWalletSelector = async () => {
      try {
        const _selector = await setupWalletSelector({
          network: NETWORK_ID,
          debug: true,
          modules: [
            setupMyNearWallet(),
            setupHereWallet(),
            setupMeteorWallet(),
            setupSender(),
            setupNightly(),
            setupMathWallet(),
            setupLedger(),
            setupWalletConnect({
              projectId: 'c4f79cc821944d9680842e34466bfcb5',
              metadata: {
                name: 'NEAR Wallet Selector',
                description: 'Example dApp used by NEAR Wallet Selector',
                url: 'https://github.com/near/wallet-selector',
                icons: ['https://avatars.githubusercontent.com/u/37784886'],
              },
            }),
          ],
        });

        const _modal = setupModal(_selector, {
          contractId: CONTRACT_ID,
        });

        const state = _selector.store.getState();
        setAccounts(state.accounts);

        setSelector(_selector);
        setModal(_modal);
      } catch (error) {
        console.error('Failed to initialize wallet selector:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initWalletSelector();
  }, []);

  useEffect(() => {
    if (!selector) return;

    const subscription = selector.store.observable
      .subscribe((state) => {
        setAccounts(state.accounts);
      });

    return () => subscription.unsubscribe();
  }, [selector]);

  const connectWallet = () => {
    if (modal) {
      modal.show();
    }
  };

  const disconnectWallet = async () => {
    if (!selector) return;

    const wallet = await selector.wallet();
    await wallet.signOut();
    setAccounts([]);
  };

  const transferToInternalWallet = async (amount: string, receiverId: string): Promise<string> => {
    if (!selector || !accountId) {
      throw new Error('Wallet not connected');
    }

    try {
      const wallet = await selector.wallet();
      const outcome = await wallet.signAndSendTransaction({
        signerId: accountId,
        receiverId: receiverId,
        actions: [
          {
            type: 'Transfer',
            params: {
              deposit: nearAPI.utils.format.parseNearAmount(amount) || '0',
            },
          },
        ],
      });

      // Return transaction hash
      return Array.isArray(outcome) ? outcome[0]?.transaction?.hash || '' : outcome?.transaction?.hash || '';
    } catch (error) {
      console.error('Transfer failed:', error);
      throw new Error(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const value: WalletContextType = {
    selector,
    modal,
    accounts,
    accountId,
    isConnected,
    isLoading,
    connectWallet,
    disconnectWallet,
    transferToInternalWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
} 
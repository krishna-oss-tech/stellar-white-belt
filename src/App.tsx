import React, { useState } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { BalanceDisplay } from './components/BalanceDisplay';
import { SplitForm } from './components/SplitForm';
import { TxResult } from './components/TxResult';
import {
  connectWallet,
  fetchXLMBalance,
  splitAndSendTips,
  fundAccountWithFriendbot,
  TransactionResult,
} from './services/stellar';
import { Sparkles, History, ExternalLink, ArrowUpRight, CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0.0000000');
  
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFunding, setIsFunding] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<TransactionResult | null>(null);

  const [recentSplits, setRecentSplits] = useState<
    Array<{
      hash?: string;
      totalAmount: number;
      recipientsCount: number;
      timestamp: string;
      success: boolean;
    }>
  >([]);

  /**
   * Wallet Connect function wrapped in try/catch/finally.
   * isConnecting is ALWAYS reset to false in the finally block.
   */
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    setTxResult(null);

    try {
      // 1. Fetch public key from Freighter
      const key = await connectWallet();
      if (!key) {
        throw new Error('Could not retrieve public key from Freighter.');
      }
      
      // Update connected wallet address
      setAddress(key);

      // 2. Load XLM balance for connected address
      try {
        const bal = await fetchXLMBalance(key);
        setBalance(bal);
      } catch (balError: any) {
        console.warn('Balance fetch error:', balError);
        setBalance('0.0000000 (Unfunded)');
        setErrorMessage(balError.message || 'Account not funded. Use Friendbot to fund your testnet account: https://friendbot.stellar.org');
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setAddress('');
      setBalance('0.0000000');
      setErrorMessage(error.message || 'Failed to connect Freighter wallet.');
    } finally {
      // CRITICAL BUG FIX: Always reset loading state regardless of outcome
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect Wallet and clean state
   */
  const handleDisconnectWallet = () => {
    setAddress('');
    setBalance('0.0000000');
    setErrorMessage(null);
    setTxResult(null);
    setIsConnecting(false);
  };

  /**
   * Balance refresh handler
   */
  const loadAccountBalance = async (targetAddress: string = address) => {
    if (!targetAddress) return;
    setIsRefreshing(true);
    try {
      const bal = await fetchXLMBalance(targetAddress);
      setBalance(bal);
      setErrorMessage(null);
    } catch (error: any) {
      console.error('Balance refresh error:', error);
      setErrorMessage(error.message || 'Could not refresh account balance.');
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Friendbot Funding handler
   */
  const handleFundFriendbot = async () => {
    if (!address) return;
    setIsFunding(true);
    setErrorMessage(null);

    try {
      await fundAccountWithFriendbot(address);
      await loadAccountBalance(address);
    } catch (error: any) {
      setErrorMessage(`Friendbot funding error: ${error.message}`);
    } finally {
      setIsFunding(false);
    }
  };

  /**
   * Split Tip Submission
   */
  const handleSplitSubmit = async (params: { totalAmount: number; recipients: string[]; memo: string }) => {
    setIsSubmitting(true);
    setTxResult(null);
    setErrorMessage(null);

    try {
      const res = await splitAndSendTips({
        senderAddress: address,
        totalAmount: params.totalAmount,
        recipients: params.recipients,
        memo: params.memo,
      });

      setTxResult(res);

      setRecentSplits((prev) => [
        {
          hash: res.hash,
          totalAmount: params.totalAmount,
          recipientsCount: params.recipients.length,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          success: res.success,
        },
        ...prev,
      ]);

      if (res.success) {
        setTimeout(() => loadAccountBalance(address), 2000);
      }
    } catch (error: any) {
      setTxResult({
        success: false,
        error: error.message || 'Transaction submission failed.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-5xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Banner Error Toast */}
      {errorMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-slide-down">
          <div className="p-4 rounded-2xl bg-rose-950/95 border border-rose-500/40 text-rose-100 shadow-2xl backdrop-blur-md flex items-start gap-3 relative">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs leading-relaxed">
              <span className="font-bold text-rose-300 block mb-0.5">Notification Notice</span>
              {errorMessage.includes('https://friendbot.stellar.org') ? (
                <>
                  Account not funded on testnet yet. Use Friendbot to fund your account:{' '}
                  <a
                    href="https://friendbot.stellar.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-rose-300 font-mono font-bold hover:text-white"
                  >
                    https://friendbot.stellar.org
                  </a>
                </>
              ) : (
                errorMessage
              )}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded-lg bg-rose-900/50 hover:bg-rose-800 text-rose-300 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <WalletConnect
        address={address}
        isConnecting={isConnecting}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
      />

      {/* Main Dashboard Layout */}
      <main className="space-y-6 flex-1">
        
        {/* Banner Hero */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> STELLAR TIP SPLITTER DAPP
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
              Split Tips & Share XLM <span className="text-indigo-400">Instantly</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1.5 max-w-xl leading-relaxed">
              Connect your Freighter wallet, specify your total XLM tip amount, add recipient addresses, and broadcast equal multi-payment operations in a single atomic Stellar Testnet transaction.
            </p>
          </div>

          {!address && (
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-extrabold text-xs md:text-sm shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60 cursor-pointer flex-shrink-0"
            >
              {isConnecting ? 'Connecting Freighter...' : 'Connect Wallet to Begin'}
            </button>
          )}
        </div>

        {/* Connected Wallet Dashboard Grid */}
        {address ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Card 1: Account Balance */}
            <div className="md:col-span-5">
              <BalanceDisplay
                address={address}
                balance={balance}
                isRefreshing={isRefreshing}
                isFunding={isFunding}
                onRefresh={() => loadAccountBalance(address)}
                onFundFriendbot={handleFundFriendbot}
              />
            </div>

            {/* Card 2: Split Form */}
            <div className="md:col-span-7">
              <SplitForm
                isWalletConnected={!!address}
                balance={balance}
                isSubmitting={isSubmitting}
                onSubmit={handleSplitSubmit}
              />
            </div>
          </div>
        ) : (
          /* Disconnected Welcome Card */
          <div className="p-10 md:p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-md shadow-indigo-500/10">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">Connect Wallet to Begin</h3>
              <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                Connect your Freighter browser extension to view your XLM balance, calculate tip splits, and execute multi-payment transactions on Stellar Testnet.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs md:text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-60"
              >
                {isConnecting ? 'Connecting...' : 'Connect Freighter Wallet'}
              </button>
            </div>
          </div>
        )}

        {/* Session Activity Log */}
        {recentSplits.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-200">Recent Session Activity</h3>
            </div>

            <div className="space-y-2">
              {recentSplits.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${item.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200">
                        -{item.totalAmount} XLM
                      </span>{' '}
                      <span className="text-slate-400">
                        split across {item.recipientsCount} recipient(s) • {item.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.success ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Confirmed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 text-[11px] font-bold border border-rose-500/20 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}

                    {item.hash && (
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${item.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 text-indigo-400 hover:text-white transition-all"
                        title="View Explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Transaction Result Modal / Toast */}
      <TxResult
        result={txResult}
        onDismiss={() => setTxResult(null)}
      />

      {/* Footer */}
      <footer className="pt-6 border-t border-slate-800/60 text-center text-xs text-slate-500">
        <p>
          Stellar Tip Splitter • Built with React 19, TypeScript, Tailwind CSS & Stellar SDK on Testnet
        </p>
      </footer>
    </div>
  );
}

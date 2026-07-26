import React, { useState, useEffect } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { BalanceDisplay } from './components/BalanceDisplay';
import { SplitForm } from './components/SplitForm';
import { TxResult } from './components/TxResult';
import {
  checkFreighterInstalled,
  connectWallet,
  fetchXLMBalance,
  splitAndSendTips,
  fundAccountWithFriendbot,
  TransactionResult,
} from './services/stellar';
import { Sparkles, History, ExternalLink, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';

export default function App() {
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0.0000000');
  
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFunding, setIsFunding] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  // Check Freighter availability on mount
  useEffect(() => {
    async function initCheck() {
      const installed = await checkFreighterInstalled();
      if (installed) {
        try {
          const { isAllowed } = await import('@stellar/freighter-api');
          const allowed = await isAllowed();
          if (allowed) {
            handleConnectWallet();
          }
        } catch (e) {
          console.log('Auto-connect skipped:', e);
        }
      }
    }
    initCheck();
  }, []);

  // Handle Wallet Connection
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const key = await connectWallet();
      setAddress(key);
      await loadAccountBalance(key);
    } catch (error: any) {
      console.error('Wallet connect error:', error);
      alert(error.message || 'Failed to connect Freighter wallet.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle Wallet Disconnection
  const handleDisconnectWallet = () => {
    setAddress('');
    setBalance('0.0000000');
  };

  // Fetch Account Balance
  const loadAccountBalance = async (targetAddress: string = address) => {
    if (!targetAddress) return;
    setIsRefreshing(true);
    try {
      const bal = await fetchXLMBalance(targetAddress);
      setBalance(bal);
    } catch (error: any) {
      console.error('Balance error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fund Account via Friendbot
  const handleFundFriendbot = async () => {
    if (!address) return;
    setIsFunding(true);
    try {
      await fundAccountWithFriendbot(address);
      await loadAccountBalance(address);
    } catch (error: any) {
      alert(`Friendbot error: ${error.message}`);
    } finally {
      setIsFunding(false);
    }
  };

  // Submit Multi-Payment Tip Split
  const handleSplitSubmit = async (params: { totalAmount: number; recipients: string[]; memo: string }) => {
    setIsSubmitting(true);
    setTxResult(null);

    try {
      const res = await splitAndSendTips({
        senderAddress: address,
        totalAmount: params.totalAmount,
        recipients: params.recipients,
        memo: params.memo,
      });

      setTxResult(res);

      // Record in session activity
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
        // Refresh balance
        setTimeout(() => loadAccountBalance(address), 2500);
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
      
      {/* Top Navbar Component */}
      <WalletConnect
        address={address}
        isConnecting={isConnecting}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
      />

      {/* Main Grid Content */}
      <main className="space-y-6 flex-1">
        
        {/* Banner Hero */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> STELLAR TIP SPLITTER DAPP
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Split Tips & Share XLM <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Instantly</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              Connect your Freighter wallet, input your total XLM tip, add recipient addresses, and broadcast equal multi-payment operations in a single atomic Stellar Testnet transaction.
            </p>
          </div>

          {!address && (
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 flex-shrink-0 transition-all"
            >
              Connect Wallet to Begin
            </button>
          )}
        </div>

        {/* Connected Dashboard Grid */}
        {address ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Account Balance */}
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

            {/* Right Column: Split Form */}
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
          <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Freighter Wallet Not Connected</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Connect your Freighter browser extension to view your XLM balance and send multi-recipient tip payments on Stellar Testnet.
            </p>
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
            >
              {isConnecting ? 'Connecting...' : 'Connect Freighter Wallet'}
            </button>
          </div>
        )}

        {/* Session Activity Log */}
        {recentSplits.length > 0 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Recent Session Tip Splits</h3>
            </div>

            <div className="space-y-2">
              {recentSplits.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${item.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200">
                        -{item.totalAmount} XLM
                      </span>{' '}
                      <span className="text-slate-500">
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
                        className="p-1 rounded-md bg-slate-800 text-cyan-400 hover:text-white"
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

      {/* Transaction Result Modal */}
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

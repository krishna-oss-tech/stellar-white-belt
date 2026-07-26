import React, { useState, useEffect } from 'react';
import { NetworkWarning } from './components/NetworkWarning';
import { WalletCard } from './components/WalletCard';
import { SplitForm } from './components/SplitForm';
import { TxHistory, TxHistoryItem } from './components/TxHistory';
import { Toast, ToastMessage } from './components/Toast';
import {
  connectWallet,
  checkNetwork,
  fetchXLMBalance,
  fundWithFriendbot,
  sendTipSplit,
  TransactionResult,
} from './services/stellar';
import { Wallet, Sparkles, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';

export default function App() {
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0.0000000');
  const [isUnfunded, setIsUnfunded] = useState<boolean>(false);
  const [isTestnet, setIsTestnet] = useState<boolean>(true);
  const [networkName, setNetworkName] = useState<string>('TESTNET');

  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFunding, setIsFunding] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [historyItems, setHistoryItems] = useState<TxHistoryItem[]>([]);

  // Check network on mount
  useEffect(() => {
    async function verifyNetwork() {
      const netInfo = await checkNetwork();
      setIsTestnet(netInfo.isTestnet);
      setNetworkName(netInfo.networkName);
    }
    verifyNetwork();
  }, []);

  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      title,
      message,
    });
  };

  /**
   * Connect Wallet handler using getAddress() & requestAccess()
   */
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setToast(null);

    try {
      const res = await connectWallet();
      setAddress(res.address);
      setIsTestnet(res.isTestnet);
      setNetworkName(res.network);

      showToast('success', 'Wallet Connected', `Connected to address ${res.address.substring(0, 6)}...${res.address.substring(res.address.length - 6)}`);

      // Load XLM Balance
      await loadAccountBalance(res.address);
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      showToast('error', 'Connection Error', error.message || 'Failed to connect Freighter wallet.');
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect Wallet handler - Resets ALL state cleanly
   */
  const handleDisconnectWallet = () => {
    setAddress('');
    setBalance('0.0000000');
    setIsUnfunded(false);
    setIsTestnet(true);
    setNetworkName('TESTNET');
    setToast(null);
    setHistoryItems([]);
  };

  /**
   * Balance loader handler
   */
  const loadAccountBalance = async (targetAddress: string = address) => {
    if (!targetAddress) return;
    setIsRefreshing(true);

    try {
      const res = await fetchXLMBalance(targetAddress);
      setBalance(res.balance);
      setIsUnfunded(res.isUnfunded);
    } catch (error: any) {
      console.error('Balance load error:', error);
      showToast('error', 'Balance Fetch Error', error.message || 'Failed to load account balance.');
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

    try {
      await fundWithFriendbot(address);
      showToast('success', 'Friendbot Funding Success', 'Successfully received 10,000 XLM from Testnet Friendbot!');
      await loadAccountBalance(address);
    } catch (error: any) {
      console.error('Friendbot error:', error);
      showToast('error', 'Funding Error', error.message || 'Friendbot funding request failed.');
    } fontally: {
      setIsFunding(false);
    }
  };

  /**
   * Re-check Network
   */
  const handleRecheckNetwork = async () => {
    const netInfo = await checkNetwork();
    setIsTestnet(netInfo.isTestnet);
    setNetworkName(netInfo.networkName);
    if (netInfo.isTestnet) {
      showToast('success', 'Network Verified', 'Connected to Stellar Testnet.');
    } else {
      showToast('error', 'Network Warning', `Active network is ${netInfo.networkName}. Please switch to Testnet.`);
    }
  };

  /**
   * Split Tip Submission
   */
  const handleSplitSubmit = async (params: { totalAmount: number; recipients: string[]; memo: string }) => {
    setIsSubmitting(true);

    try {
      const res: TransactionResult = await sendTipSplit({
        senderAddress: address,
        totalAmount: params.totalAmount,
        recipients: params.recipients,
        memo: params.memo,
      });

      if (res.success) {
        showToast(
          'success',
          'Tip Payment Confirmed!',
          `Transaction hash: ${res.hash?.substring(0, 10)}... (Ledger #${res.ledger || 'Latest'})`
        );

        // Record history item
        const newItem: TxHistoryItem = {
          hash: res.hash,
          totalAmount: params.totalAmount,
          recipientsCount: params.recipients.length,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          success: true,
        };
        setHistoryItems((prev) => [newItem, ...prev]);

        // Auto-refresh balance after successful transfer
        setTimeout(() => loadAccountBalance(address), 2000);
      } else {
        showToast('error', 'Transaction Failed', res.error || 'Transaction submission failed.');
        const failedItem: TxHistoryItem = {
          totalAmount: params.totalAmount,
          recipientsCount: params.recipients.length,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          success: false,
        };
        setHistoryItems((prev) => [failedItem, ...prev]);
      }
    } catch (error: any) {
      console.error('Submit tip error:', error);
      showToast('error', 'Transaction Error', error.message || 'Transaction submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-5xl mx-auto px-4 py-6 space-y-6">
      
      {/* Toast Notification Top Right */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Top Navbar */}
      <header className="p-4 md:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/30">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Stellar <span className="text-purple-400">Tip Splitter</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Testnet
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Atomic Multi-Payment Tip Distribution
            </p>
          </div>
        </div>

        <div>
          {address ? (
            <button
              onClick={handleDisconnectWallet}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Disconnect Wallet
            </button>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold text-xs md:text-sm shadow-lg shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Connect Freighter Wallet</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="space-y-6 flex-1">
        
        {/* Network Warning Banner */}
        <NetworkWarning
          isTestnet={isTestnet}
          networkName={networkName}
          onCheckAgain={handleRecheckNetwork}
        />

        {/* Hero Section */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> STELLAR DEVELOPER DAPP
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Split Tips & Share XLM <span className="text-purple-400">Instantly</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1.5 max-w-xl leading-relaxed">
              Connect your Freighter wallet, specify your total XLM tip amount, add recipient addresses, and broadcast equal multi-payment operations in a single atomic Stellar Testnet transaction.
            </p>
          </div>

          {!address && (
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-extrabold text-xs md:text-sm shadow-lg shadow-purple-600/25 transition-all flex-shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isConnecting ? 'Connecting Freighter...' : 'Connect Wallet to Begin'}
            </button>
          )}
        </div>

        {/* Connected Wallet Cards Grid */}
        {address ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Card 1: Wallet & Balance */}
              <div className="md:col-span-5">
                <WalletCard
                  address={address}
                  balance={balance}
                  isUnfunded={isUnfunded}
                  isRefreshing={isRefreshing}
                  isFunding={isFunding}
                  onRefresh={() => loadAccountBalance(address)}
                  onFundFriendbot={handleFundFriendbot}
                />
              </div>

              {/* Card 2: Split Tip Form */}
              <div className="md:col-span-7">
                <SplitForm
                  isWalletConnected={!!address}
                  balance={balance}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSplitSubmit}
                />
              </div>
            </div>

            {/* Card 3: Session Transaction History */}
            <TxHistory items={historyItems} />
          </>
        ) : (
          /* Disconnected Welcome View */
          <div className="p-10 md:p-12 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-md shadow-purple-500/10">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Connect Wallet to Begin</h3>
              <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                Connect your Freighter browser extension to view your XLM balance, calculate equal tip splits, and execute multi-payment transactions on Stellar Testnet.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold text-xs md:text-sm shadow-lg shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Connect Freighter Wallet'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="pt-6 border-t border-slate-800/60 text-center text-xs text-slate-500">
        <p>
          Stellar Tip Splitter • Built with React 19, TypeScript, Tailwind CSS & Stellar SDK on Testnet
        </p>
      </footer>
    </div>
  );
}

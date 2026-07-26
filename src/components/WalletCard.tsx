import React, { useState } from 'react';
import { Coins, RefreshCw, Copy, Check, Droplet, ExternalLink, AlertTriangle } from 'lucide-react';

interface WalletCardProps {
  address: string;
  balance: string;
  isUnfunded: boolean;
  isRefreshing: boolean;
  isFunding: boolean;
  onRefresh: () => void;
  onFundFriendbot: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  address,
  balance,
  isUnfunded,
  isRefreshing,
  isFunding,
  onRefresh,
  onFundFriendbot,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamic font sizing based on length to prevent right overflow
  const getBalanceFontSize = (balStr: string) => {
    if (balStr.length > 12) {
      return 'text-2xl sm:text-3xl md:text-3xl';
    }
    if (balStr.length > 8) {
      return 'text-3xl sm:text-3xl md:text-4xl';
    }
    return 'text-3xl sm:text-4xl md:text-5xl';
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6 max-w-full overflow-hidden">
      {/* Header & Balance Title */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20 flex-shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-100 truncate">Stellar Wallet Account</h3>
            <p className="text-xs text-slate-400 truncate">Horizon Testnet Node</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all disabled:opacity-50 cursor-pointer flex-shrink-0"
          title="Refresh Balance"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Prominent Balance Display (Responsive & Contained) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 relative overflow-hidden max-w-full">
        <div className="flex justify-between items-center flex-wrap gap-1">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">AVAILABLE XLM BALANCE</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Native Lumens
          </span>
        </div>

        <div className="flex items-baseline flex-wrap gap-2 pt-1 min-w-0 max-w-full">
          <span className={`${getBalanceFontSize(balance)} font-extrabold text-white tracking-tight break-all max-w-full`}>
            {balance}
          </span>
          <span className="text-lg sm:text-xl font-bold text-purple-400 flex-shrink-0">XLM</span>
        </div>

        {/* Unfunded Account Alert Banner */}
        {(isUnfunded || parseFloat(balance) === 0) && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" /> Account Not Funded on Testnet
            </div>
            <p className="text-slate-300 leading-relaxed">
              This account does not exist on Testnet yet or has 0 XLM. Click <strong>Fund with Friendbot</strong> below to instantly claim 10,000 test XLM!
            </p>
          </div>
        )}
      </div>

      {/* Connected Address Bar (Clean Wrapping on Mobile) */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 max-w-full">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">CONNECTED PUBLIC ADDRESS</span>
          <span className="text-[11px] font-mono text-purple-400">Ed25519</span>
        </div>

        <div className="flex items-center justify-between gap-3 min-w-0">
          <span className="font-mono text-xs text-slate-200 break-all select-all min-w-0 flex-1 leading-relaxed">
            {address}
          </span>

          <div className="relative flex-shrink-0">
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer text-xs font-semibold"
              title="Copy Address to Clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {copied && (
              <span className="absolute -top-8 right-0 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-md animate-fade-in">
                Copied!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions: Friendbot Funding + Block Explorer */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onFundFriendbot}
          disabled={isFunding}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold text-xs md:text-sm shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isFunding ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Funding via Friendbot...</span>
            </>
          ) : (
            <>
              <Droplet className="w-4 h-4" />
              <span>Fund with Friendbot (10,000 XLM)</span>
            </>
          )}
        </button>

        <a
          href={`https://stellar.expert/explorer/testnet/account/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer flex-shrink-0"
          title="View on Stellar Expert Explorer"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Coins, RefreshCw, Copy, Check, Droplet, ExternalLink } from 'lucide-react';

interface BalanceDisplayProps {
  address: string;
  balance: string;
  isRefreshing: boolean;
  isFunding: boolean;
  onRefresh: () => void;
  onFundFriendbot: () => void;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  address,
  balance,
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

  const isUnfunded = balance.includes('Unfunded') || parseFloat(balance) === 0;

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header & Refresh */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-300">Connected Stellar Account</h3>
            <p className="text-xs text-slate-500">Stellar Horizon Testnet</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all disabled:opacity-50"
          title="Refresh XLM Balance"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Address Bar */}
      <div className="mb-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider">YOUR PUBLIC KEY</span>
          <span className="text-[11px] font-mono text-cyan-400">Ed25519</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-slate-200 break-all opacity-90">
            {address}
          </span>
          <button
            onClick={handleCopyAddress}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex-shrink-0"
            title="Copy Public Key"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Balance Box */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/20 mb-4">
        <span className="text-xs font-bold text-slate-400 tracking-wider block mb-1">AVAILABLE BALANCE</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-white tracking-tight">
            {balance}
          </span>
          <span className="text-lg font-bold text-cyan-400">XLM</span>
        </div>

        {isUnfunded && (
          <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
            <span>⚠️</span> Account is unfunded on Testnet. Click Friendbot below to receive 10,000 XLM!
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onFundFriendbot}
          disabled={isFunding}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
        >
          {isFunding ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Funding via Friendbot...
            </>
          ) : (
            <>
              <Droplet className="w-4 h-4" />
              Fund 10,000 XLM (Friendbot)
            </>
          )}
        </button>

        <a
          href={`https://stellar.expert/explorer/testnet/account/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          title="View on Stellar Expert Explorer"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

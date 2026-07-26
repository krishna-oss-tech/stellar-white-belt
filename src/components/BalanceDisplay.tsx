import React, { useState } from 'react';
import { Coins, RefreshCw, Copy, Check, Droplet, ExternalLink, AlertTriangle } from 'lucide-react';

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
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
      {/* Header & Refresh */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Stellar Account Balance</h3>
            <p className="text-xs text-slate-400">Stellar Horizon Testnet</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all disabled:opacity-50 cursor-pointer"
          title="Refresh Balance"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Prominent Balance Focus Card */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">AVAILABLE XLM BALANCE</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {balance}
          </span>
          <span className="text-lg font-bold text-indigo-400">XLM</span>
        </div>
        <p className="text-[11px] text-slate-500">Stellar Native Asset (LUMENS)</p>

        {isUnfunded && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Account Not Funded on Testnet
            </div>
            <p className="text-slate-300 leading-relaxed">
              Your account has not been activated on Testnet yet. Click Friendbot below or visit{' '}
              <a
                href="https://friendbot.stellar.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-amber-400 hover:text-amber-300 font-mono"
              >
                https://friendbot.stellar.org
              </a>{' '}
              to receive 10,000 test XLM!
            </p>
          </div>
        )}
      </div>

      {/* Address Bar */}
      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">PUBLIC KEY</span>
          <span className="text-[11px] font-mono text-indigo-400">Ed25519</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-slate-300 break-all opacity-90">
            {address}
          </span>
          <button
            onClick={handleCopyAddress}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex-shrink-0 cursor-pointer"
            title="Copy Public Key"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onFundFriendbot}
          disabled={isFunding}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isFunding ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Funding via Friendbot...</span>
            </>
          ) : (
            <>
              <Droplet className="w-4 h-4" />
              <span>Fund 10,000 XLM (Friendbot)</span>
            </>
          )}
        </button>

        <a
          href={`https://stellar.expert/explorer/testnet/account/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          title="View on Stellar Expert Explorer"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

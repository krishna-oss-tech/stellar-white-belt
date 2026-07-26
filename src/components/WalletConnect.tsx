import React from 'react';
import { Wallet, LogOut, ShieldCheck, RefreshCw } from 'lucide-react';

interface WalletConnectProps {
  address: string;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  address,
  isConnecting,
  onConnect,
  onDisconnect,
}) => {
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 6)}`;
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
      {/* Brand & Network */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20 text-white">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Stellar <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Tip Splitter</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Testnet
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Freighter Wallet Multi-Payment dApp
          </p>
        </div>
      </div>

      {/* Wallet Controls */}
      <div>
        {address ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-cyan-500/30">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></span>
              <span className="font-mono text-sm font-semibold text-cyan-300">
                {formatAddress(address)}
              </span>
            </div>
            <button
              onClick={onDisconnect}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold transition-all"
              title="Disconnect Wallet"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Connecting Freighter...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                Connect Freighter Wallet
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

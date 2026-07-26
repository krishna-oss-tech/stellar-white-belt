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
    <header className="p-4 md:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between flex-wrap gap-4">
      {/* App Logo & Network */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/30 text-white flex items-center justify-center">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              Stellar <span className="text-indigo-400">Tip Splitter</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Testnet
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Atomic Multi-Payment Stellar dApp
          </p>
        </div>
      </div>

      {/* Wallet Action Button / Address Display */}
      <div className="flex items-center gap-3">
        {address ? (
          <>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-indigo-500/30">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-xs md:text-sm font-semibold text-slate-200">
                {formatAddress(address)}
              </span>
            </div>
            <button
              onClick={onDisconnect}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
              title="Disconnect Wallet"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs md:text-sm shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
  );
};

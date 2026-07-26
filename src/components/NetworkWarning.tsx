import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface NetworkWarningProps {
  isTestnet: boolean;
  networkName: string;
  onCheckAgain: () => void;
}

export const NetworkWarning: React.FC<NetworkWarningProps> = ({
  isTestnet,
  networkName,
  onCheckAgain,
}) => {
  if (isTestnet) return null;

  return (
    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs shadow-lg space-y-2 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-amber-300 text-sm">Wrong Network Detected ({networkName})</h4>
            <p className="text-slate-300 leading-relaxed mt-0.5">
              Stellar Tip Splitter requires <strong>Stellar Testnet</strong>. Please open your Freighter extension popup and switch your active network to <strong>Testnet</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={onCheckAgain}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-check Network
        </button>
      </div>
    </div>
  );
};

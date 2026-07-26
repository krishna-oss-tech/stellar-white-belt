import React, { useState } from 'react';
import { CheckCircle2, XCircle, ExternalLink, Copy, Check, X, ShieldAlert } from 'lucide-react';
import { TransactionResult } from '../services/stellar';

interface TxResultProps {
  result: TransactionResult | null;
  onDismiss: () => void;
}

export const TxResult: React.FC<TxResultProps> = ({ result, onDismiss }) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopyHash = () => {
    if (result.hash) {
      navigator.clipboard.writeText(result.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-slide-down">
      <div className={`p-5 rounded-2xl border shadow-2xl backdrop-blur-lg relative ${
        result.success
          ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100'
          : 'bg-slate-900/95 border-rose-500/40 text-slate-100'
      }`}>
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {result.success ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Transaction Confirmed!</h4>
                <p className="text-xs text-slate-400">
                  Tip payment split across <strong className="text-emerald-400">{result.recipientsCount}</strong> recipient(s) at{' '}
                  <strong className="text-indigo-300 font-mono">{result.amountPerRecipient} XLM</strong> each.
                </p>
              </div>
            </div>

            {/* Hash Display */}
            {result.hash && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">TRANSACTION HASH</span>
                  <span className="font-mono text-xs text-emerald-400 break-all">
                    {result.hash}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleCopyHash}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                    title="Copy Hash"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
                    title="View on Stellar Expert Explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-rose-400">Transaction Failed</h4>
                <p className="text-xs text-slate-300">
                  The tip split transaction could not be completed on Stellar Testnet.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-200 break-words leading-relaxed">
              {result.error || 'Unknown transaction failure.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

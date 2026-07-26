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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {result.success ? (
          <div className="text-center space-y-4">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">Tip Split Successfully Broadcasted!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Distributed tip payment to <strong className="text-emerald-400">{result.recipientsCount}</strong> recipient(s) at{' '}
                <strong className="text-cyan-300 font-mono">{result.amountPerRecipient} XLM</strong> each on Stellar Testnet.
              </p>
            </div>

            {/* Hash Display */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider block mb-1">TRANSACTION HASH</span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-cyan-300 break-all">
                  {result.hash}
                </span>
                <button
                  onClick={handleCopyHash}
                  className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex-shrink-0"
                  title="Copy Hash"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                View on Stellar Expert Explorer
              </a>
              <button
                onClick={onDismiss}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            {/* Failure Icon */}
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
              <XCircle className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-rose-400">Transaction Failed</h3>
              <p className="text-xs text-slate-400 mt-1">
                The Stellar Tip Splitter transaction could not be processed on Testnet.
              </p>
            </div>

            {/* Error Message Box */}
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-left text-xs text-rose-200">
              <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1">
                <ShieldAlert className="w-4 h-4" /> Error Details
              </div>
              <p className="font-mono text-xs break-words leading-relaxed">
                {result.error || 'Unknown error occurred.'}
              </p>
            </div>

            <button
              onClick={onDismiss}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
            >
              Close & Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

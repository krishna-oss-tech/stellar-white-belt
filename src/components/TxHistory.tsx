import React from 'react';
import { History, ExternalLink, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';

export interface TxHistoryItem {
  hash?: string;
  totalAmount: number;
  recipientsCount: number;
  timestamp: string;
  success: boolean;
}

interface TxHistoryProps {
  items: TxHistoryItem[];
}

export const TxHistory: React.FC<TxHistoryProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Session Transaction History</h3>
          <p className="text-xs text-slate-400">Live testnet payments completed in this session</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div
            key={item.hash || idx}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${item.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-sm">
                    -{item.totalAmount} XLM
                  </span>
                  <span className="text-slate-400">
                    split across {item.recipientsCount} recipient(s)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {item.timestamp}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {item.success ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-[11px] font-bold border border-rose-500/20 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Failed
                </span>
              )}

              {item.hash && (
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${item.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white transition-all font-semibold"
                  title="View on Stellar Expert Explorer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Explorer</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

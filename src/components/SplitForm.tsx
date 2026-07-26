import React, { useState, useMemo } from 'react';
import { Send, Users, Calculator, Plus, Trash2, ArrowRight, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { validateAddress } from '../services/stellar';

interface SplitFormProps {
  isWalletConnected: boolean;
  balance: string;
  isSubmitting: boolean;
  onSubmit: (params: { totalAmount: number; recipients: string[]; memo: string }) => void;
}

export const SplitForm: React.FC<SplitFormProps> = ({
  isWalletConnected,
  balance,
  isSubmitting,
  onSubmit,
}) => {
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [recipientRows, setRecipientRows] = useState<string[]>(['']);

  // Handle row input changes
  const handleRowChange = (index: number, value: string) => {
    const updated = [...recipientRows];
    updated[index] = value;
    setRecipientRows(updated);
  };

  const handleAddRow = () => {
    setRecipientRows([...recipientRows, '']);
  };

  const handleRemoveRow = (index: number) => {
    if (recipientRows.length <= 1) return;
    setRecipientRows(recipientRows.filter((_, i) => i !== index));
  };

  // Filter & validate recipient addresses
  const validRecipients = useMemo(() => {
    return recipientRows.map((r) => r.trim()).filter((r) => validateAddress(r));
  }, [recipientRows]);

  const parsedAmount = parseFloat(totalAmount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;

  // Live calculation: X.XX XLM per recipient
  const perPersonAmount = useMemo(() => {
    if (isAmountValid && validRecipients.length > 0) {
      return (parsedAmount / validRecipients.length).toFixed(7);
    }
    return '0.0000000';
  }, [parsedAmount, isAmountValid, validRecipients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isWalletConnected) {
      alert('Please connect your Freighter wallet first.');
      return;
    }

    if (!isAmountValid) {
      alert('Please enter a valid total XLM amount greater than 0.');
      return;
    }

    if (validRecipients.length === 0) {
      alert('Please enter at least one valid 56-character Stellar recipient address starting with G.');
      return;
    }

    onSubmit({
      totalAmount: parsedAmount,
      recipients: validRecipients,
      memo: memo.trim(),
    });
  };

  const handleSetMaxAmount = () => {
    const numBal = parseFloat(balance);
    if (!isNaN(numBal) && numBal > 1) {
      setTotalAmount((numBal - 1).toFixed(4));
    } else if (!isNaN(numBal) && numBal > 0) {
      setTotalAmount(numBal.toFixed(4));
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Split Tip Payment Form</h3>
          <p className="text-xs text-slate-400">Equal XLM distribution across multiple recipient wallets</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Total XLM Amount Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-300 tracking-wider uppercase">
              TOTAL XLM TIP AMOUNT
            </label>
            {isWalletConnected && (
              <button
                type="button"
                onClick={handleSetMaxAmount}
                className="text-[11px] font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 cursor-pointer"
              >
                USE MAX
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type="number"
              step="any"
              min="0.0000001"
              placeholder="e.g. 50.0"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              disabled={isSubmitting || !isWalletConnected}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none text-base font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              XLM
            </span>
          </div>
        </div>

        {/* Dynamic Recipient Address Rows */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-300 tracking-wider uppercase">
              RECIPIENT ADDRESSES ({recipientRows.length})
            </label>
            <span className="text-[11px] text-slate-400">Minimum 1 recipient</span>
          </div>

          <div className="space-y-2">
            {recipientRows.map((rowValue, idx) => {
              const trimmed = rowValue.trim();
              const isValid = trimmed.length > 0 ? validateAddress(trimmed) : null;

              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={`Recipient #${idx + 1} address (G...)`}
                      value={rowValue}
                      onChange={(e) => handleRowChange(idx, e.target.value)}
                      disabled={isSubmitting || !isWalletConnected}
                      className={`w-full bg-slate-950 border ${
                        isValid === true
                          ? 'border-emerald-500/60 focus:border-emerald-500'
                          : isValid === false
                          ? 'border-rose-500/60 focus:border-rose-500'
                          : 'border-slate-800 focus:border-purple-500'
                      } rounded-xl pl-4 pr-10 py-2.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    />

                    {/* Inline Address Validation Icons */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                      {isValid === true && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" title="Valid Stellar Address" />
                      )}
                      {isValid === false && (
                        <XCircle className="w-4 h-4 text-rose-400" title="Invalid Stellar Address (56 chars, G...)" />
                      )}
                    </div>
                  </div>

                  {recipientRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      disabled={isSubmitting || !isWalletConnected}
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 transition-all cursor-pointer disabled:opacity-50"
                      title="Remove Recipient Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Recipient Row Button */}
          <button
            type="button"
            onClick={handleAddRow}
            disabled={isSubmitting || !isWalletConnected}
            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-800 hover:border-purple-500/50 text-xs font-semibold text-purple-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Recipient Row
          </button>
        </div>

        {/* Live Calculation Preview Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
              <Calculator className="w-4 h-4 text-purple-400" />
              LIVE SPLIT CALCULATION PREVIEW
            </div>
            <span className="text-xs font-bold text-purple-400">
              {validRecipients.length} Valid Recipient(s)
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">Amount per recipient:</span>
            <div className="text-right">
              <span className="text-2xl font-mono font-extrabold text-white">
                {perPersonAmount}
              </span>
              <span className="text-xs font-bold text-purple-400 ml-1">XLM</span>
            </div>
          </div>
        </div>

        {/* Memo Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 tracking-wider uppercase block">
            TRANSACTION MEMO (OPTIONAL TEXT)
          </label>
          <input
            type="text"
            maxLength={28}
            placeholder="e.g. Dinner Tip Split"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={isSubmitting || !isWalletConnected}
            className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isWalletConnected || isSubmitting || !isAmountValid || validRecipients.length === 0}
          className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-extrabold text-xs md:text-sm shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Submitting Multi-Payment Transaction...</span>
            </>
          ) : !isWalletConnected ? (
            <span>Connect Freighter Wallet to Split Tip</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Split & Send {isAmountValid ? `${totalAmount} XLM` : 'Tip'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

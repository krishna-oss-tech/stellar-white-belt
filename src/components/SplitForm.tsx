import React, { useState, useMemo } from 'react';
import { Send, Users, Calculator, AlertCircle, Plus, Trash2, ArrowRight, RefreshCw } from 'lucide-react';
import { isValidStellarAddress } from '../services/stellar';

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
  const [useTextarea, setUseTextarea] = useState<boolean>(true);
  
  // Textarea list mode
  const [rawAddressesText, setRawAddressesText] = useState<string>('');

  // Input rows mode
  const [addressRows, setAddressRows] = useState<string[]>(['', '']);

  const recipientList = useMemo(() => {
    if (useTextarea) {
      return rawAddressesText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    } else {
      return addressRows.map((r) => r.trim()).filter((r) => r.length > 0);
    }
  }, [useTextarea, rawAddressesText, addressRows]);

  const validRecipients = useMemo(() => {
    return recipientList.filter((addr) => isValidStellarAddress(addr));
  }, [recipientList]);

  const invalidRecipients = useMemo(() => {
    return recipientList.filter((addr) => !isValidStellarAddress(addr));
  }, [recipientList]);

  const parsedAmount = parseFloat(totalAmount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;

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
      alert('Please provide at least one valid recipient Stellar address starting with G (56 chars).');
      return;
    }

    onSubmit({
      totalAmount: parsedAmount,
      recipients: validRecipients,
      memo: memo.trim(),
    });
  };

  const handleRowChange = (index: number, value: string) => {
    const updated = [...addressRows];
    updated[index] = value;
    setAddressRows(updated);
  };

  const handleAddRow = () => {
    setAddressRows([...addressRows, '']);
  };

  const handleRemoveRow = (index: number) => {
    if (addressRows.length <= 1) return;
    setAddressRows(addressRows.filter((_, i) => i !== index));
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
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-100">Split Tip Payment Form</h2>
          <p className="text-xs text-slate-400">Distribute XLM evenly across multiple recipient wallets</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Total XLM Amount */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-300 tracking-wider uppercase">TOTAL XLM AMOUNT</label>
            {isWalletConnected && (
              <button
                type="button"
                onClick={handleSetMaxAmount}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 cursor-pointer"
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
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              XLM
            </span>
          </div>
        </div>

        {/* Recipient Addresses Toggle */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-300 tracking-wider uppercase">RECIPIENT ADDRESSES</label>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setUseTextarea(true)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  useTextarea ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Textarea List
              </button>
              <button
                type="button"
                onClick={() => setUseTextarea(false)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  !useTextarea ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Input Rows
              </button>
            </div>
          </div>

          {useTextarea ? (
            <div>
              <textarea
                rows={4}
                placeholder="Enter Stellar public addresses (G...), one address per line&#10;GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFXYCZTM6WXIWHCYWCDHY"
                value={rawAddressesText}
                onChange={(e) => setRawAddressesText(e.target.value)}
                disabled={isSubmitting || !isWalletConnected}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          ) : (
            <div className="space-y-2">
              {addressRows.map((rowVal, idx) => {
                const isValid = rowVal.length > 0 ? isValidStellarAddress(rowVal) : null;
                return (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder={`Recipient #${idx + 1} (G...)`}
                      value={rowVal}
                      onChange={(e) => handleRowChange(idx, e.target.value)}
                      disabled={isSubmitting || !isWalletConnected}
                      className={`flex-1 bg-slate-950 border ${
                        isValid === true
                          ? 'border-emerald-500/50'
                          : isValid === false
                          ? 'border-rose-500/50'
                          : 'border-slate-800'
                      } focus:border-indigo-500 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    {addressRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        disabled={isSubmitting || !isWalletConnected}
                        className="p-2 rounded-xl bg-slate-950 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 transition-all cursor-pointer disabled:opacity-50"
                        title="Remove Row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                type="button"
                onClick={handleAddRow}
                disabled={isSubmitting || !isWalletConnected}
                className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-800 hover:border-indigo-500/50 text-xs font-semibold text-indigo-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Add Recipient Row
              </button>
            </div>
          )}

          {/* Validation Badges */}
          <div className="flex justify-between items-center mt-2 text-xs">
            <span className="text-slate-400">
              Valid Recipients: <strong className="text-emerald-400 font-mono">{validRecipients.length}</strong>
            </span>
            {invalidRecipients.length > 0 && (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {invalidRecipients.length} invalid address(es) skipped
              </span>
            )}
          </div>
        </div>

        {/* Live Calculation Preview */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
              <Calculator className="w-4 h-4 text-indigo-400" />
              EQUAL TIP SPLIT PREVIEW
            </div>
            <span className="text-xs font-bold text-indigo-400">
              {validRecipients.length} Recipient(s)
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">Amount per recipient:</span>
            <div className="text-right">
              <span className="text-xl font-mono font-extrabold text-white">
                {perPersonAmount}
              </span>
              <span className="text-xs font-bold text-indigo-400 ml-1">XLM</span>
            </div>
          </div>
        </div>

        {/* Memo Input */}
        <div>
          <label className="text-xs font-bold text-slate-300 tracking-wider block mb-1.5 uppercase">
            MEMO (OPTIONAL TEXT)
          </label>
          <input
            type="text"
            maxLength={28}
            placeholder="e.g. Dinner Tip Split"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={isSubmitting || !isWalletConnected}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isWalletConnected || isSubmitting || !isAmountValid || validRecipients.length === 0}
          className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-extrabold text-xs md:text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Submitting Transaction...</span>
            </>
          ) : !isWalletConnected ? (
            <span>Connect Wallet to Split Tip</span>
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

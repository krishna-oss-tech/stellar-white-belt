import React, { useState, useMemo } from 'react';
import { Send, Users, Calculator, AlertCircle, Plus, Trash2, ArrowRight } from 'lucide-react';
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
  
  // Textarea mode state (addresses separated by newline)
  const [rawAddressesText, setRawAddressesText] = useState<string>('');

  // Row inputs mode state
  const [addressRows, setAddressRows] = useState<string[]>(['', '']);

  // Extract recipient list based on mode
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

  // Valid recipients analysis
  const validRecipients = useMemo(() => {
    return recipientList.filter((addr) => isValidStellarAddress(addr));
  }, [recipientList]);

  const invalidRecipients = useMemo(() => {
    return recipientList.filter((addr) => !isValidStellarAddress(addr));
  }, [recipientList]);

  // Split calculation per person
  const parsedAmount = parseFloat(totalAmount);
  const isAmountValid = !isNaN(parsedAmount) && parsedAmount > 0;

  const perPersonAmount = useMemo(() => {
    if (isAmountValid && validRecipients.length > 0) {
      return (parsedAmount / validRecipients.length).toFixed(7);
    }
    return '0.0000000';
  }, [parsedAmount, isAmountValid, validRecipients]);

  // Form submission handler
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

  // Row management helper functions
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
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Split Tip Form</h2>
          <p className="text-xs text-slate-400">Distribute XLM evenly across multiple recipient wallets</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Total XLM Amount Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-300 tracking-wider">TOTAL XLM AMOUNT TO SPLIT</label>
            {isWalletConnected && (
              <button
                type="button"
                onClick={handleSetMaxAmount}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20"
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
              disabled={isSubmitting}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-base font-medium transition-all"
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
            <label className="text-xs font-bold text-slate-300 tracking-wider">RECIPIENT ADDRESSES</label>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setUseTextarea(true)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  useTextarea ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Textarea List
              </button>
              <button
                type="button"
                onClick={() => setUseTextarea(false)}
                className={`px-2.5 py-1 rounded-md transition-all ${
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
                placeholder="Enter Stellar public addresses (G...), one address per line&#10;GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFXYCZTM6WXIWHCYWCDHY&#10;GDFXK3......"
                value={rawAddressesText}
                onChange={(e) => setRawAddressesText(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl p-3.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-2.5">
              {addressRows.map((rowVal, idx) => {
                const isValid = rowVal.length > 0 ? isValidStellarAddress(rowVal) : null;
                return (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={`Recipient #${idx + 1} (G...)`}
                        value={rowVal}
                        onChange={(e) => handleRowChange(idx, e.target.value)}
                        disabled={isSubmitting}
                        className={`w-full bg-slate-950/80 border ${
                          isValid === true
                            ? 'border-emerald-500/50'
                            : isValid === false
                            ? 'border-rose-500/50'
                            : 'border-slate-800'
                        } focus:border-cyan-500 rounded-xl px-3.5 py-2.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all`}
                      />
                    </div>
                    {addressRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-all"
                        title="Remove Recipient"
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
                className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-dashed border-slate-800 hover:border-cyan-500/50 text-xs font-semibold text-cyan-400 flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Recipient Row
              </button>
            </div>
          )}

          {/* Address Stats Badge */}
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

        {/* Live Split Calculation Preview Card */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
              <Calculator className="w-4 h-4 text-cyan-400" />
              EQUAL TIP SPLIT PREVIEW
            </div>
            <span className="text-xs font-bold text-indigo-400">
              {validRecipients.length} Recipient(s)
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">Amount per recipient:</span>
            <div className="text-right">
              <span className="text-xl font-mono font-extrabold text-cyan-300">
                {perPersonAmount}
              </span>
              <span className="text-xs font-bold text-cyan-400 ml-1">XLM</span>
            </div>
          </div>
        </div>

        {/* Memo Input */}
        <div>
          <label className="text-xs font-bold text-slate-300 tracking-wider block mb-1.5">
            TRANSACTION MEMO (OPTIONAL TEXT)
          </label>
          <input
            type="text"
            maxLength={28}
            placeholder="e.g. Dinner Tip Split"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isWalletConnected || isSubmitting || !isAmountValid || validRecipients.length === 0}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin-fast"></div>
              Awaiting Wallet Signature & Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Split & Send {isAmountValid ? `${totalAmount} XLM` : 'Tip'} via Freighter
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

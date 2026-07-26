import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle2, FileText, ArrowRight, Zap } from 'lucide-react';
import { isValidStellarAddress } from '../services/stellar';

export default function SendForm({ onSend, isSending, balance }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [formError, setFormError] = useState('');

  const isRecipientValid = recipient.length > 0 ? isValidStellarAddress(recipient) : null;

  const handleMaxAmount = () => {
    const numBal = parseFloat(balance);
    if (!isNaN(numBal) && numBal > 1) {
      // Leave 1 XLM for minimum account reserve + tx fees
      setAmount((numBal - 1).toFixed(4));
    } else if (!isNaN(numBal) && numBal > 0) {
      setAmount(numBal.toFixed(4));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!recipient.trim()) {
      setFormError('Please enter a recipient Stellar address.');
      return;
    }

    if (!isValidStellarAddress(recipient.trim())) {
      setFormError('Invalid Stellar Ed25519 public key. Format: G... (56 chars).');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid positive XLM amount.');
      return;
    }

    onSend({
      recipientPublicKey: recipient.trim(),
      amount: amount.toString(),
      memoText: memo.trim(),
    });
  };

  return (
    <div className="glass-card" style={{ padding: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'rgba(79, 172, 254, 0.1)', padding: '0.5rem', borderRadius: '10px', color: '#4facfe' }}>
          <Send size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Send XLM</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Stellar Testnet Transaction</p>
        </div>
      </div>

      {/* Form Error Alert */}
      {formError && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '12px',
          padding: '0.8rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          color: '#fb7185',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Recipient Input */}
        <div className="input-group">
          <div className="input-label">
            <span>RECIPIENT ADDRESS</span>
            {isRecipientValid === true && (
              <span style={{ color: '#34d399', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <CheckCircle2 size={12} /> Valid Address
              </span>
            )}
            {isRecipientValid === false && (
              <span style={{ color: '#fb7185', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <AlertCircle size={12} /> Invalid Address
              </span>
            )}
          </div>
          <input
            type="text"
            className="input-field mono"
            placeholder="G..."
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value);
              setFormError('');
            }}
            disabled={isSending}
            required
          />
        </div>

        {/* Amount Input */}
        <div className="input-group">
          <div className="input-label">
            <span>AMOUNT (XLM)</span>
            <button
              type="button"
              onClick={handleMaxAmount}
              style={{
                background: 'rgba(0, 242, 254, 0.1)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                color: '#00f2fe',
                fontSize: '0.72rem',
                fontWeight: '700',
                padding: '0.15rem 0.5rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              MAX
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              step="any"
              min="0.0000001"
              className="input-field"
              placeholder="0.0000"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setFormError('');
              }}
              disabled={isSending}
              required
            />
            <span style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: 'var(--text-muted)'
            }}>
              XLM
            </span>
          </div>
        </div>

        {/* Memo Input */}
        <div className="input-group">
          <div className="input-label">
            <span>MEMO (OPTIONAL TEXT)</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Max 28 bytes</span>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              maxLength="28"
              className="input-field"
              placeholder="Payment reference or note"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              disabled={isSending}
            />
            <FileText size={16} style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)'
            }} />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSending}
          className="btn-primary"
          style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
        >
          {isSending ? (
            <>
              <div className="spinner"></div>
              Awaiting Freighter Signature...
            </>
          ) : (
            <>
              <Send size={18} />
              Send XLM via Freighter
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

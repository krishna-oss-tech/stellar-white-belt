import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, ExternalLink, Copy, Check, X, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TransactionResultModal({ result, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (result && result.success) {
      // Fire confetti burst on success!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f2fe', '#4facfe', '#7d56c4', '#10b981'],
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }
    }
  }, [result]);

  if (!result) return null;

  const handleCopyHash = () => {
    if (result.hash) {
      navigator.clipboard.writeText(result.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(4, 7, 18, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '2rem',
        position: 'relative',
        animation: 'modalSlideUp 0.3s ease-out'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {result.success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              color: '#34d399',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
            }}>
              <CheckCircle size={40} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.4rem' }}>
              Transaction Confirmed!
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Your XLM payment has been successfully recorded on Stellar Testnet ledger <strong style={{ color: '#00f2fe' }}>#{result.ledger || 'Latest'}</strong>.
            </p>

            {/* Hash Box */}
            <div style={{
              background: 'rgba(8, 11, 24, 0.8)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'left',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.4rem' }}>
                TRANSACTION HASH
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span className="text-mono" style={{ fontSize: '0.82rem', color: '#00f2fe', wordBreak: 'break-all' }}>
                  {result.hash}
                </span>
                <button
                  onClick={handleCopyHash}
                  style={{
                    background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.4rem',
                    color: copied ? '#34d399' : 'var(--text-muted)',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  title="Copy Transaction Hash"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ flex: 1, textDecoration: 'none' }}
              >
                <ExternalLink size={16} />
                View on Stellar Expert
              </a>
              <button onClick={onClose} className="btn-secondary">
                Done
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '2px solid #f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              color: '#fb7185',
              boxShadow: '0 0 30px rgba(244, 63, 94, 0.3)'
            }}>
              <XCircle size={40} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.4rem', color: '#fb7185' }}>
              Transaction Failed
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              The Stellar network or Freighter wallet encountered an error while processing your request.
            </p>

            {/* Error Message Box */}
            <div style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'left',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              color: '#fecdd3'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', marginBottom: '0.4rem', color: '#fb7185' }}>
                <ShieldAlert size={16} /> Error Details
              </div>
              <p style={{ margin: 0, wordBreak: 'break-word', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                {result.error || 'Unknown error occurred.'}
              </p>
            </div>

            <button onClick={onClose} className="btn-secondary" style={{ width: '100%' }}>
              Close & Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

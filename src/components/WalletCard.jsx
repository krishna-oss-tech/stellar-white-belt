import React, { useState } from 'react';
import { Copy, Check, RefreshCw, Coins, Droplets, ExternalLink, QrCode } from 'lucide-react';

export default function WalletCard({
  publicKey,
  balance,
  onRefresh,
  onFundFriendbot,
  isRefreshing,
  isFunding,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUnfunded = balance === '0 (Unfunded)' || balance === '0';

  return (
    <div className="glass-card" style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative Glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '140px',
        height: '140px',
        background: 'radial-gradient(circle, rgba(0, 242, 254, 0.2) 0%, transparent 70%)',
        pointerEvents: 'none'
      }}></div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '0.5rem', borderRadius: '10px', color: '#00f2fe' }}>
            <Coins size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Stellar Account</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Testnet Network</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="btn-secondary"
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
          title="Refresh XLM Balance"
        >
          <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Public Key Banner */}
      <div style={{
        background: 'rgba(8, 11, 24, 0.7)',
        border: '1px solid var(--border-glass)',
        borderRadius: '12px',
        padding: '0.85rem 1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>PUBLIC ADDRESS</span>
          <span style={{ fontSize: '0.72rem', color: '#00f2fe' }}>Ed25519</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span className="text-mono" style={{
            fontSize: '0.82rem',
            wordBreak: 'break-all',
            color: 'var(--text-main)',
            opacity: 0.95
          }}>
            {publicKey}
          </span>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.4rem',
              color: copied ? '#34d399' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            title="Copy Public Key"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Balance Display */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(125, 86, 196, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)',
        border: '1px solid rgba(0, 242, 254, 0.2)',
        borderRadius: '16px',
        padding: '1.25rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.4rem' }}>
          AVAILABLE BALANCE
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.03em' }} className="text-gradient">
            {balance}
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#00f2fe' }}>XLM</span>
        </div>

        {isUnfunded && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.5rem 0.75rem',
            background: 'rgba(246, 185, 59, 0.12)',
            border: '1px solid rgba(246, 185, 59, 0.3)',
            borderRadius: '8px',
            fontSize: '0.78rem',
            color: '#f6b93b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span>⚠️</span> Account is unfunded on Testnet. Use Friendbot below to get 10,000 XLM!
          </div>
        )}
      </div>

      {/* Quick Action: Friendbot Faucet */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={onFundFriendbot}
          disabled={isFunding}
          className="btn-primary"
          style={{ flex: 1, padding: '0.7rem' }}
        >
          {isFunding ? (
            <>
              <div className="spinner"></div>
              Funding via Friendbot...
            </>
          ) : (
            <>
              <Droplets size={17} />
              Fund 10,000 XLM (Friendbot)
            </>
          )}
        </button>

        <a
          href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ textDecoration: 'none' }}
          title="View on Stellar Expert Explorer"
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}

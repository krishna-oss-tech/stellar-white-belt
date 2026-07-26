import React from 'react';
import { History, ExternalLink, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';

export default function RecentTransactions({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '1.75rem', marginTop: '1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
          <History size={32} />
        </div>
        <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0 }}>No Recent Transactions Yet</h4>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
          Your submitted XLM transfers in this session will appear here with live block explorer links.
        </p>
      </div>
    );
  }

  const formatShortAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="glass-card" style={{ padding: '1.75rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'rgba(125, 86, 196, 0.15)', padding: '0.5rem', borderRadius: '10px', color: '#7d56c4' }}>
          <History size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Session Activity</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{transactions.length} recent transfer(s)</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {transactions.map((tx, idx) => (
          <div
            key={tx.hash || idx}
            style={{
              background: 'rgba(8, 11, 24, 0.6)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: tx.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                padding: '0.5rem',
                borderRadius: '10px',
                color: tx.success ? '#34d399' : '#fb7185'
              }}>
                <ArrowUpRight size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                    -{tx.amount} XLM
                  </span>
                  {tx.memo && (
                    <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Memo: {tx.memo}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  To: <span className="text-mono">{formatShortAddress(tx.recipient)}</span> • {tx.timestamp}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {tx.success ? (
                <span className="badge badge-connected" style={{ fontSize: '0.7rem' }}>
                  <CheckCircle2 size={11} /> Confirmed
                </span>
              ) : (
                <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', fontSize: '0.7rem' }}>
                  <XCircle size={11} /> Failed
                </span>
              )}

              {tx.hash && (
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '8px',
                    color: '#00f2fe',
                    textDecoration: 'none',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  title="View on Stellar Expert"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { Download, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';

export default function FreighterInstallNotice() {
  return (
    <div className="glass-card" style={{
      padding: '2rem',
      maxWidth: '650px',
      margin: '2rem auto',
      border: '1px solid rgba(246, 185, 59, 0.4)',
      boxShadow: '0 0 40px rgba(246, 185, 59, 0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{
          background: 'rgba(246, 185, 59, 0.15)',
          padding: '0.75rem',
          borderRadius: '14px',
          color: '#f6b93b',
          flexShrink: 0
        }}>
          <AlertTriangle size={32} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.4rem', color: '#f6b93b' }}>
            Freighter Wallet Extension Required
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
            Freighter is the non-custodial Stellar wallet browser extension needed to sign transactions securely. We could not detect Freighter installed in your browser.
          </p>

          <div style={{
            background: 'rgba(8, 11, 24, 0.6)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: '#00f2fe', marginBottom: '0.4rem' }}>
              <ShieldCheck size={16} /> How to get started:
            </div>
            <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li>Install the <strong>Freighter</strong> browser extension from the official site.</li>
              <li>Create or import a Stellar Testnet wallet.</li>
              <li>Ensure your network setting in Freighter is set to <strong>Testnet</strong>.</li>
              <li>Refresh this page and click <strong>Connect Freighter</strong>.</li>
            </ol>
          </div>

          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ textDecoration: 'none', display: 'inline-flex' }}
          >
            <Download size={18} />
            Install Freighter Wallet
            <ExternalLink size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}

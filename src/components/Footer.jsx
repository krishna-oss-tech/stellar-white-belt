import React from 'react';
import { ExternalLink, Heart, Shield, Code, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="glass-card" style={{ borderRadius: '20px 20px 0 0', padding: '1.5rem 2rem', marginTop: '3rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={18} color="#00f2fe" />
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Built for <strong style={{ color: '#fff' }}>Stellar White Belt Challenge</strong> with React + Vite
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <a
            href="https://developers.stellar.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            Stellar Docs <ExternalLink size={12} />
          </a>

          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            Freighter <ExternalLink size={12} />
          </a>

          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            Stellar Expert <ExternalLink size={12} />
          </a>
        </div>

      </div>
    </footer>
  );
}

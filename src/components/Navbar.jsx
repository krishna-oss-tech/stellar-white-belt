import React from 'react';
import { Wallet, LogOut, ShieldCheck, Zap, Globe } from 'lucide-react';

export default function Navbar({ publicKey, onConnect, onDisconnect, isConnecting }) {
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 5)}...${addr.substring(addr.length - 5)}`;
  };

  return (
    <header className="glass-card" style={{ borderRadius: '0 0 20px 20px', padding: '1rem 2rem', marginBottom: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Logo & Challenge Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #7d56c4 0%, #00f2fe 100%)',
            padding: '0.6rem',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.3)'
          }}>
            <Zap size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
                Stellar <span className="text-gradient">White Belt</span>
              </h1>
              <span className="badge badge-testnet" style={{ fontSize: '0.7rem' }}>
                <Globe size={11} /> Testnet
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              Stellar SDK & Freighter API Challenge
            </p>
          </div>
        </div>

        {/* Action Controls & Wallet Connection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-glass)' }}>
            <ShieldCheck size={14} color="#00f2fe" />
            Freighter Connected
          </div>

          {publicKey ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                background: 'rgba(10, 13, 26, 0.8)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                padding: '0.5rem 0.9rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span className="pulse-dot green"></span>
                <span className="text-mono" style={{ fontSize: '0.88rem', fontWeight: '600', color: '#00f2fe' }}>
                  {formatAddress(publicKey)}
                </span>
              </div>
              
              <button
                onClick={onDisconnect}
                className="btn-danger"
                title="Disconnect Wallet"
              >
                <LogOut size={16} />
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="btn-primary"
            >
              {isConnecting ? (
                <>
                  <div className="spinner"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet size={18} />
                  Connect Freighter
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

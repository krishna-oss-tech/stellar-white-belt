import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WalletCard from './components/WalletCard';
import SendForm from './components/SendForm';
import TransactionResultModal from './components/TransactionResultModal';
import RecentTransactions from './components/RecentTransactions';
import FreighterInstallNotice from './components/FreighterInstallNotice';
import Footer from './components/Footer';
import {
  checkFreighterInstalled,
  connectFreighterWallet,
  fetchXLMBalance,
  sendXLMTransaction,
  fundWithFriendbot,
} from './services/stellar';
import { Wallet, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [hasFreighter, setHasFreighter] = useState(null);
  const [publicKey, setPublicKey] = useState('');
  const [network, setNetwork] = useState('');
  const [balance, setBalance] = useState('0.0000000');
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);
  const [txResult, setTxResult] = useState(null);
  const [recentTxs, setRecentTxs] = useState([]);

  // Check Freighter availability on mount
  useEffect(() => {
    async function initFreighter() {
      const installed = await checkFreighterInstalled();
      setHasFreighter(installed);
      
      // Auto reconnect if previously connected
      if (installed) {
        try {
          const { isAllowed } = await import('@stellar/freighter-api');
          const allowed = await isAllowed();
          if (allowed) {
            handleConnectWallet(false);
          }
        } catch (e) {
          console.log('Auto-connect skipped:', e);
        }
      }
    }
    initFreighter();
  }, []);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Connect Wallet
  const handleConnectWallet = async (showNotification = true) => {
    setIsConnecting(true);
    try {
      const { publicKey: key, network: net } = await connectFreighterWallet();
      setPublicKey(key);
      setNetwork(net || 'TESTNET');
      setHasFreighter(true);

      if (showNotification) {
        showToast('Freighter wallet connected successfully!', 'success');
      }

      // Fetch balance immediately after connecting
      await loadBalance(key);
    } catch (error) {
      console.error('Connection error:', error);
      showToast(error.message || 'Failed to connect Freighter wallet.', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  // 2. Disconnect Wallet
  const handleDisconnectWallet = () => {
    setPublicKey('');
    setNetwork('');
    setBalance('0.0000000');
    showToast('Wallet disconnected.', 'info');
  };

  // 3. Load / Refresh XLM Balance
  const loadBalance = async (keyToUse = publicKey) => {
    if (!keyToUse) return;
    setIsRefreshing(true);
    try {
      const bal = await fetchXLMBalance(keyToUse);
      setBalance(bal);
    } catch (error) {
      console.error('Balance error:', error);
      showToast('Could not refresh XLM balance.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // 4. Fund Account via Friendbot Faucet
  const handleFundFriendbot = async () => {
    if (!publicKey) return;
    setIsFunding(true);
    try {
      await fundWithFriendbot(publicKey);
      showToast('Successfully funded 10,000 XLM via Friendbot!', 'success');
      await loadBalance(publicKey);
    } catch (error) {
      console.error('Friendbot funding failed:', error);
      showToast(`Friendbot error: ${error.message}`, 'error');
    } finally {
      setIsFunding(false);
    }
  };

  // 5. Send XLM Transaction
  const handleSendXLM = async ({ recipientPublicKey, amount, memoText }) => {
    setIsSending(true);
    try {
      const res = await sendXLMTransaction({
        senderPublicKey: publicKey,
        recipientPublicKey,
        amount,
        memoText,
      });

      // Transaction Success!
      const newTx = {
        hash: res.hash,
        recipient: recipientPublicKey,
        amount,
        memo: memoText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        success: true,
      };

      setRecentTxs((prev) => [newTx, ...prev]);
      setTxResult({
        success: true,
        hash: res.hash,
        ledger: res.ledger,
      });

      // Refresh balance after successful transfer
      setTimeout(() => loadBalance(publicKey), 2000);
    } catch (error) {
      console.error('Transaction failed:', error);
      const failedTx = {
        recipient: recipientPublicKey,
        amount,
        memo: memoText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        success: false,
        error: error.message,
      };
      setRecentTxs((prev) => [failedTx, ...prev]);

      setTxResult({
        success: false,
        error: error.message || 'Transaction submission failed.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          background: toastMessage.type === 'error' ? 'rgba(244, 63, 94, 0.95)' : toastMessage.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(0, 242, 254, 0.95)',
          color: toastMessage.type === 'info' ? '#040914' : '#ffffff',
          fontWeight: '600',
          fontSize: '0.88rem',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backdropFilter: 'blur(10px)',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {toastMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        publicKey={publicKey}
        onConnect={() => handleConnectWallet(true)}
        onDisconnect={handleDisconnectWallet}
        isConnecting={isConnecting}
      />

      {/* Main Body Content */}
      <main className="app-container">
        
        {/* Welcome Banner */}
        <div className="glass-card" style={{ padding: '1.75rem 2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className="badge" style={{ background: 'rgba(125, 86, 196, 0.2)', color: '#a78bfa' }}>
                  <Sparkles size={12} /> STELLAR DEVELOPER CHALLENGE
                </span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                Stellar White Belt <span className="text-gradient">DApp</span>
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.3rem', maxWidth: '600px' }}>
                Connect your Freighter Wallet, check testnet XLM balances, fund your account with Friendbot, and submit signed Stellar payments on Testnet.
              </p>
            </div>

            {!publicKey && (
              <button
                onClick={() => handleConnectWallet(true)}
                disabled={isConnecting}
                className="btn-primary"
                style={{ padding: '0.85rem 1.75rem' }}
              >
                <Wallet size={20} />
                Connect Wallet to Begin
              </button>
            )}
          </div>
        </div>

        {/* Freighter Missing Notice */}
        {hasFreighter === false && <FreighterInstallNotice />}

        {/* Wallet Connected Dashboard */}
        {publicKey ? (
          <>
            <div className="dashboard-grid">
              {/* Account & Balance Card */}
              <WalletCard
                publicKey={publicKey}
                balance={balance}
                onRefresh={() => loadBalance(publicKey)}
                onFundFriendbot={handleFundFriendbot}
                isRefreshing={isRefreshing}
                isFunding={isFunding}
              />

              {/* Send XLM Transfer Form */}
              <SendForm
                onSend={handleSendXLM}
                isSending={isSending}
                balance={balance}
              />
            </div>

            {/* Session Activity Table */}
            <RecentTransactions transactions={recentTxs} />
          </>
        ) : (
          hasFreighter !== false && (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', marginTop: '1.5rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(0, 242, 254, 0.1)',
                color: '#00f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <Wallet size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Connect Your Wallet to Get Started
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto 1.5rem auto' }}>
                Click below to authorize Freighter API access and view your Stellar Testnet XLM balance and transactions.
              </p>
              <button
                onClick={() => handleConnectWallet(true)}
                disabled={isConnecting}
                className="btn-primary"
              >
                {isConnecting ? 'Connecting Freighter...' : 'Connect Freighter Wallet'}
              </button>
            </div>
          )
        )}
      </main>

      {/* Transaction Result Modal */}
      <TransactionResultModal
        result={txResult}
        onClose={() => setTxResult(null)}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}

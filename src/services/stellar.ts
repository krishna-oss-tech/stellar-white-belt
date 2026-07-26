import * as StellarSdk from '@stellar/stellar-sdk';
import {
  isConnected,
  getAddress,
  requestAccess,
  signTransaction,
  getNetwork,
  getNetworkDetails,
} from '@stellar/freighter-api';

// Horizon Server for Stellar Testnet
export const TESTNET_HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const TESTNET_PASSPHRASE = StellarSdk.Networks.TESTNET;

// Stellar Horizon Server Instance
export const server = new StellarSdk.Horizon.Server(TESTNET_HORIZON_URL);

export interface SplitTipParams {
  senderAddress: string;
  totalAmount: number;
  recipients: string[];
  memo?: string;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  ledger?: number;
  error?: string;
  recipientsCount?: number;
  amountPerRecipient?: string;
}

export interface WalletConnectionResult {
  address: string;
  network: string;
  isTestnet: boolean;
}

/**
 * Safely extracts address string from freighter response objects (e.g. { address: "G..." })
 */
export function extractAddress(res: any): string | null {
  if (!res) return null;
  if (typeof res === 'object') {
    if (res.error) {
      throw new Error(typeof res.error === 'string' ? res.error : JSON.stringify(res.error));
    }
    if (typeof res.address === 'string' && res.address.trim().length > 0) {
      return res.address.trim();
    }
    if (typeof res.publicKey === 'string' && res.publicKey.trim().length > 0) {
      return res.publicKey.trim();
    }
  }
  if (typeof res === 'string' && res.trim().length > 0) {
    return res.trim();
  }
  return null;
}

/**
 * Validates a Stellar Ed25519 Public Key string
 */
export function validateAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const clean = address.trim();
  if (clean.length !== 56 || !clean.startsWith('G')) return false;
  try {
    return StellarSdk.StrKey.isValidEd25519PublicKey(clean);
  } catch {
    return false;
  }
}

/**
 * Checks if Freighter extension is installed in the browser
 */
export async function checkFreighterInstalled(): Promise<boolean> {
  if (typeof window !== 'undefined' && (window as any).freighterApi) {
    return true;
  }
  try {
    const res: any = await isConnected();
    return !!(res && (res === true || res.isConnected));
  } catch {
    return false;
  }
}

/**
 * Checks Freighter's active network and verifies if it is on TESTNET
 */
export async function checkNetwork(): Promise<{ isTestnet: boolean; networkName: string }> {
  try {
    let networkName = 'TESTNET';
    
    if (typeof getNetworkDetails === 'function') {
      const details: any = await getNetworkDetails();
      if (details) {
        if (details.networkPassphrase) {
          const isTestPass = details.networkPassphrase === TESTNET_PASSPHRASE;
          return { isTestnet: isTestPass, networkName: details.network || (isTestPass ? 'TESTNET' : 'PUBLIC') };
        }
        if (details.network) {
          networkName = details.network;
        }
      }
    }

    if (typeof getNetwork === 'function') {
      const net: any = await getNetwork();
      if (net && typeof net === 'string') {
        networkName = net;
      }
    }

    const isTestnet = networkName.toUpperCase().includes('TEST') || networkName.toUpperCase() === 'TESTNET';
    return { isTestnet, networkName };
  } catch (err) {
    console.warn('Could not check Freighter network:', err);
    return { isTestnet: true, networkName: 'TESTNET' };
  }
}

/**
 * Connects wallet using getAddress() with requestAccess() fallback.
 * Always extracts .address from object response!
 */
export async function connectWallet(): Promise<WalletConnectionResult> {
  const installed = await checkFreighterInstalled();
  if (!installed && typeof window !== 'undefined' && !(window as any).freighterApi) {
    throw new Error('Freighter extension not detected. Please install Freighter from https://www.freighter.app/');
  }

  let addressStr: string | null = null;

  // 1. Attempt getAddress()
  try {
    const getAddrRes = await getAddress();
    addressStr = extractAddress(getAddrRes);
  } catch (err) {
    console.warn('getAddress() call failed, falling back to requestAccess():', err);
  }

  // 2. Fallback to requestAccess()
  if (!addressStr) {
    try {
      const reqRes = await requestAccess();
      addressStr = extractAddress(reqRes);
    } catch (err: any) {
      console.error('requestAccess() error:', err);
      if (err.message?.includes('User rejected') || err.message?.includes('declined') || err.message?.includes('cancel')) {
        throw new Error('Connection request was rejected in Freighter wallet.');
      }
      throw new Error(err.message || 'Access request failed in Freighter wallet.');
    }
  }

  if (!addressStr) {
    throw new Error('Could not retrieve address from Freighter. Please unlock your extension and try again.');
  }

  // Validate address format
  if (!validateAddress(addressStr)) {
    throw new Error(`Invalid address format received: ${addressStr}. Expected 56-character Ed25519 public key starting with G.`);
  }

  const networkInfo = await checkNetwork();

  return {
    address: addressStr,
    network: networkInfo.networkName,
    isTestnet: networkInfo.isTestnet,
  };
}

/**
 * Fetches native XLM balance via Horizon server.loadAccount(address)
 */
export async function fetchXLMBalance(address: string): Promise<{ balance: string; isUnfunded: boolean }> {
  if (!address || !validateAddress(address)) {
    throw new Error(`Invalid address provided for balance query: "${address}".`);
  }

  try {
    const account = await server.loadAccount(address);
    const nativeBal = account.balances.find((b) => b.asset_type === 'native');
    const balance = nativeBal ? parseFloat(nativeBal.balance).toFixed(7) : '0.0000000';
    return { balance, isUnfunded: false };
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return { balance: '0.0000000', isUnfunded: true };
    }
    console.error('Horizon loadAccount error:', error);
    throw new Error(error.message || 'Failed to fetch account balance from Stellar Horizon.');
  }
}

/**
 * Funds address on Testnet via Stellar Friendbot
 */
export async function fundWithFriendbot(address: string): Promise<boolean> {
  if (!address || !validateAddress(address)) {
    throw new Error('Invalid address provided for Friendbot funding.');
  }

  try {
    const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.title || 'Friendbot funding failed.');
    }
    return true;
  } catch (err: any) {
    console.error('Friendbot error:', err);
    throw new Error(err.message || 'Failed to fund account via Friendbot faucet.');
  }
}

/**
 * Builds, signs, and submits a multi-payment tip split transaction on Stellar Testnet
 */
export async function sendTipSplit({
  senderAddress,
  totalAmount,
  recipients,
  memo = '',
}: SplitTipParams): Promise<TransactionResult> {
  if (!senderAddress || !validateAddress(senderAddress)) {
    throw new Error('Wallet not connected or invalid sender address.');
  }

  if (totalAmount <= 0) {
    throw new Error('Total tip amount must be greater than 0 XLM.');
  }

  const validRecipients = recipients
    .map((r) => r.trim())
    .filter((r) => r.length > 0 && validateAddress(r));

  if (validRecipients.length === 0) {
    throw new Error('At least one valid recipient Stellar address is required.');
  }

  const amountPerRecipientNum = totalAmount / validRecipients.length;
  const amountPerRecipientStr = amountPerRecipientNum.toFixed(7);

  try {
    // 1. Load sender account from Horizon server
    let account;
    try {
      account = await server.loadAccount(senderAddress);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        throw new Error('Account not funded on Testnet yet. Click "Fund with Friendbot" to seed your account.');
      }
      throw err;
    }

    // 2. Check balance
    const nativeBalObj = account.balances.find((b) => b.asset_type === 'native');
    const availableBal = nativeBalObj ? parseFloat(nativeBalObj.balance) : 0;
    if (availableBal < totalAmount) {
      throw new Error(`Insufficient XLM balance. Available: ${availableBal.toFixed(4)} XLM, Needed: ${totalAmount} XLM.`);
    }

    // 3. Fetch Base Fee
    const fee = await server.fetchBaseFee();

    // 4. Build Transaction with one Operation.payment per recipient
    let txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: fee.toString(),
      networkPassphrase: TESTNET_PASSPHRASE,
    });

    validRecipients.forEach((recipient) => {
      txBuilder.addOperation(
        StellarSdk.Operation.payment({
          destination: recipient,
          asset: StellarSdk.Asset.native(),
          amount: amountPerRecipientStr,
        })
      );
    });

    if (memo && memo.trim().length > 0) {
      txBuilder.addMemo(StellarSdk.Memo.text(memo.trim().substring(0, 28)));
    }

    txBuilder.setTimeout(180);
    const transaction = txBuilder.build();
    const xdr = transaction.toXDR();

    // 5. Request Freighter signature
    let signedXdr: string;
    try {
      const signRes = await signTransaction(xdr, {
        network: 'TESTNET',
        networkPassphrase: TESTNET_PASSPHRASE,
      });

      if (typeof signRes === 'string') {
        signedXdr = signRes;
      } else if (signRes && typeof (signRes as any).signedTxXdr === 'string') {
        signedXdr = (signRes as any).signedTxXdr;
      } else if (signRes && typeof (signRes as any).xdr === 'string') {
        signedXdr = (signRes as any).xdr;
      } else {
        signedXdr = signRes as any;
      }
    } catch (signErr: any) {
      console.error('Sign transaction error:', signErr);
      throw new Error(signErr.message || 'Transaction signing rejected in Freighter wallet.');
    }

    if (!signedXdr || typeof signedXdr !== 'string') {
      throw new Error('Transaction signing was cancelled or invalid in Freighter.');
    }

    // 6. Submit signed transaction to Horizon server
    const txToSubmit = StellarSdk.TransactionBuilder.fromXDR(signedXdr, TESTNET_PASSPHRASE);
    const result = await server.submitTransaction(txToSubmit);

    return {
      success: true,
      hash: result.hash || result.id,
      ledger: result.ledger,
      recipientsCount: validRecipients.length,
      amountPerRecipient: amountPerRecipientStr,
    };
  } catch (error: any) {
    console.error('Stellar tip transaction submission error:', error);
    let errorMsg = error.message || 'Transaction submission failed.';

    if (error.response?.data?.extras?.result_codes) {
      const codes = error.response.data.extras.result_codes;
      errorMsg += ` (Codes: ${JSON.stringify(codes)})`;
    }

    return {
      success: false,
      error: errorMsg,
    };
  }
}
import * as StellarSdk from '@stellar/stellar-sdk';
import {
  isConnected,
  requestAccess,
  getPublicKey,
  signTransaction,
} from '@stellar/freighter-api';

// Stellar Testnet Configuration
export const HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org';
export const TESTNET_PASSPHRASE = StellarSdk.Networks.TESTNET;

// Horizon Server Instance
export const server = new StellarSdk.Horizon.Server(HORIZON_TESTNET_URL);

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

/**
 * Checks if Freighter extension is installed in the browser window
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
 * Connects Freighter wallet and returns the public key
 */
export async function connectWallet(): Promise<string> {
  const installed = await checkFreighterInstalled();
  if (!installed && typeof window !== 'undefined' && !(window as any).freighterApi) {
    throw new Error('Freighter wallet extension is not installed. Please install Freighter from https://www.freighter.app/');
  }

  // Primary attempt: requestAccess()
  try {
    const key = await requestAccess();
    if (key && typeof key === 'string' && key.startsWith('G')) {
      return key;
    }
  } catch (err: any) {
    console.warn('requestAccess failed or was cancelled:', err);
    if (err.message?.includes('User rejected') || err.message?.includes('declined') || err.message?.includes('cancel')) {
      throw new Error('Wallet connection request was rejected in Freighter wallet.');
    }
  }

  // Secondary attempt: getPublicKey()
  try {
    const pubKey = await getPublicKey();
    if (pubKey && typeof pubKey === 'string' && pubKey.startsWith('G')) {
      return pubKey;
    }
  } catch (err: any) {
    console.warn('getPublicKey failed:', err);
  }

  throw new Error('Could not connect to Freighter. Please open your browser extension and approve access.');
}

/**
 * Fetches native XLM balance for a given public address from Horizon server
 */
export async function fetchXLMBalance(address: string): Promise<string> {
  if (!address) return '0.0000000';

  try {
    const account = await server.loadAccount(address);
    const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
    return nativeBalance ? parseFloat(nativeBalance.balance).toFixed(7) : '0.0000000';
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      throw new Error('Account not funded. Use Friendbot to fund your testnet account: https://friendbot.stellar.org');
    }
    console.error('Error fetching balance from Horizon:', error);
    throw new Error(error.message || 'Failed to fetch account balance from Stellar Horizon server.');
  }
}

/**
 * Validates a Stellar Ed25519 Public Key
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  try {
    return StellarSdk.StrKey.isValidEd25519PublicKey(address.trim());
  } catch {
    return false;
  }
}

/**
 * Splits total XLM evenly among recipients and submits multi-payment transaction on Stellar Testnet
 */
export async function splitAndSendTips({
  senderAddress,
  totalAmount,
  recipients,
  memo = '',
}: SplitTipParams): Promise<TransactionResult> {
  if (!senderAddress) {
    throw new Error('Wallet is not connected. Please connect Freighter first.');
  }

  if (totalAmount <= 0) {
    throw new Error('Total tip amount must be greater than 0 XLM.');
  }

  const validRecipients = recipients
    .map((r) => r.trim())
    .filter((r) => r.length > 0 && isValidStellarAddress(r));

  if (validRecipients.length === 0) {
    throw new Error('Please provide at least one valid recipient Stellar address.');
  }

  // Calculate split amount per recipient
  const amountPerRecipientNum = totalAmount / validRecipients.length;
  const amountPerRecipientStr = amountPerRecipientNum.toFixed(7);

  try {
    // 1. Load sender account from Horizon server
    let account;
    try {
      account = await server.loadAccount(senderAddress);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        throw new Error('Account not funded. Use Friendbot to fund your testnet account: https://friendbot.stellar.org');
      }
      throw err;
    }

    // Check balance
    const nativeBalObj = account.balances.find((b) => b.asset_type === 'native');
    const availableBal = nativeBalObj ? parseFloat(nativeBalObj.balance) : 0;
    if (availableBal < totalAmount) {
      throw new Error(`Insufficient XLM balance. Available: ${availableBal.toFixed(4)} XLM, Needed: ${totalAmount} XLM.`);
    }

    // 2. Fetch base fee
    const fee = await server.fetchBaseFee();

    // 3. Build Transaction
    let txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: fee.toString(),
      networkPassphrase: TESTNET_PASSPHRASE,
    });

    // Add one Operation.payment per recipient
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

    // 4. Request Freighter signature
    let signedXdr: string;
    try {
      signedXdr = await signTransaction(xdr, {
        network: 'TESTNET',
        networkPassphrase: TESTNET_PASSPHRASE,
      });
    } catch (signErr: any) {
      console.error('Freighter sign error:', signErr);
      throw new Error(signErr.message || 'Transaction signing was rejected in Freighter wallet.');
    }

    if (!signedXdr) {
      throw new Error('Transaction signing was cancelled by user in Freighter.');
    }

    // 5. Submit signed transaction to Horizon server
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
    console.error('Stellar transaction error:', error);
    let errorMessage = error.message || 'Transaction submission failed.';

    if (error.response?.data?.extras?.result_codes) {
      const codes = error.response.data.extras.result_codes;
      errorMessage += ` (Codes: ${JSON.stringify(codes)})`;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Funds an account on Testnet using Stellar Friendbot
 */
export async function fundAccountWithFriendbot(address: string): Promise<any> {
  if (!address) throw new Error('No address provided.');

  const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.title || 'Friendbot funding request failed.');
  }
  return data;
}

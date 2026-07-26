import * as StellarSdk from '@stellar/stellar-sdk';
import {
  isConnected,
  requestAccess,
  getPublicKey,
  signTransaction,
} from '@stellar/freighter-api';

// Horizon Server for Stellar Testnet
export const HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org';
export const TESTNET_PASSPHRASE = StellarSdk.Networks.TESTNET;

// Create Horizon Server Instance
export const server = new StellarSdk.Horizon.Server(HORIZON_TESTNET_URL);

/**
 * Interface representing tip transaction parameters
 */
export interface SplitTipParams {
  senderAddress: string;
  totalAmount: number;
  recipients: string[];
  memo?: string;
}

/**
 * Interface representing transaction result
 */
export interface TransactionResult {
  success: boolean;
  hash?: string;
  ledger?: number;
  error?: string;
  recipientsCount?: number;
  amountPerRecipient?: string;
}

/**
 * Checks whether Freighter extension is installed in browser
 */
export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    const connected = await isConnected();
    return !!connected;
  } catch (error) {
    console.error('Error checking Freighter installation:', error);
    return false;
  }
}

/**
 * Connects wallet using Freighter API requestAccess() and retrieves public key
 */
export async function connectWallet(): Promise<string> {
  const installed = await checkFreighterInstalled();
  if (!installed) {
    throw new Error('Freighter wallet extension is not installed in your browser. Please install Freighter from https://www.freighter.app/');
  }

  // Request wallet access from user
  try {
    const keyFromAccess = await requestAccess();
    if (keyFromAccess) {
      return keyFromAccess;
    }
  } catch (err: any) {
    console.warn('requestAccess warning/denied:', err);
  }

  // Fallback to getPublicKey if access is already granted
  const pubKey = await getPublicKey();
  if (!pubKey) {
    throw new Error('Wallet connection rejected or public key not found.');
  }

  return pubKey;
}

/**
 * Fetches native XLM balance for a given Stellar public key
 */
export async function fetchXLMBalance(address: string): Promise<string> {
  if (!address) return '0.0000000';

  try {
    const account = await server.loadAccount(address);
    const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
    return nativeBalance ? nativeBalance.balance : '0.0000000';
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return '0.0000000 (Unfunded)';
    }
    console.error('Error loading account balance from Horizon:', error);
    throw new Error(error.message || 'Failed to fetch account balance.');
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
 * Splits tip total evenly among recipients and submits multi-payment transaction on Stellar Testnet
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

  // Calculate split amount per recipient (rounded to 7 decimals for Stellar XLM precision)
  const amountPerRecipientNum = totalAmount / validRecipients.length;
  const amountPerRecipientStr = amountPerRecipientNum.toFixed(7);

  try {
    // 1. Load sender account from Horizon server
    let account;
    try {
      account = await server.loadAccount(senderAddress);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        throw new Error(
          'Your account is unfunded on Testnet. Click "Fund 10,000 XLM (Friendbot)" to get testnet XLM first!'
        );
      }
      throw err;
    }

    // Check balance sufficiency
    const nativeBalObj = account.balances.find((b) => b.asset_type === 'native');
    const availableBal = nativeBalObj ? parseFloat(nativeBalObj.balance) : 0;
    if (availableBal < totalAmount) {
      throw new Error(
        `Insufficient XLM balance. You have ${availableBal.toFixed(4)} XLM, but trying to send ${totalAmount} XLM.`
      );
    }

    // 2. Fetch base fee
    const fee = await server.fetchBaseFee();

    // 3. Build Transaction with multiple Operation.payment calls
    let txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: fee.toString(),
      networkPassphrase: TESTNET_PASSPHRASE,
    });

    // Add one Operation.payment for each recipient
    validRecipients.forEach((recipient) => {
      txBuilder.addOperation(
        StellarSdk.Operation.payment({
          destination: recipient,
          asset: StellarSdk.Asset.native(),
          amount: amountPerRecipientStr,
        })
      );
    });

    // Add optional text memo if provided
    if (memo && memo.trim().length > 0) {
      txBuilder.addMemo(StellarSdk.Memo.text(memo.trim().substring(0, 28)));
    }

    txBuilder.setTimeout(180);
    const transaction = txBuilder.build();
    const xdr = transaction.toXDR();

    // 4. Request Freighter wallet signature
    let signedXdr: string;
    try {
      signedXdr = await signTransaction(xdr, {
        network: 'TESTNET',
        networkPassphrase: TESTNET_PASSPHRASE,
      });
    } catch (signErr: any) {
      console.error('Freighter sign error:', signErr);
      throw new Error(signErr.message || 'Transaction signature was rejected in Freighter wallet.');
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
    console.error('Stellar Tip Splitter Transaction Error:', error);
    let errorMessage = error.message || 'Transaction submission failed.';

    // Extra error detail parsing if Horizon returns specific result codes
    if (error.response?.data?.extras?.result_codes) {
      const codes = error.response.data.extras.result_codes;
      errorMessage += ` (Network codes: ${JSON.stringify(codes)})`;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Funds address via Stellar Friendbot on Testnet
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

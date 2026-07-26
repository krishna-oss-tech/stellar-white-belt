import * as StellarSdk from '@stellar/stellar-sdk';
import {
  isConnected,
  isAllowed,
  setAllowed,
  getPublicKey,
  getNetwork,
  signTransaction,
} from '@stellar/freighter-api';

// Stellar Testnet Configuration
export const TESTNET_HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const TESTNET_PASSPHRASE = StellarSdk.Networks.TESTNET;

// Create Horizon Server Instance
export const server = new StellarSdk.Horizon.Server(TESTNET_HORIZON_URL);

/**
 * Checks whether Freighter Wallet extension is installed
 */
export async function checkFreighterInstalled() {
  try {
    const connected = await isConnected();
    return !!connected;
  } catch (error) {
    console.error('Error checking Freighter installation:', error);
    return false;
  }
}

/**
 * Connects Freighter wallet and retrieves the user's public key
 */
export async function connectFreighterWallet() {
  const installed = await checkFreighterInstalled();
  if (!installed) {
    throw new Error('Freighter wallet extension is not installed in your browser. Please install Freighter from https://www.freighter.app/');
  }

  // Request user permission if not allowed yet
  const allowed = await isAllowed();
  if (!allowed) {
    const setRes = await setAllowed();
    if (!setRes) {
      throw new Error('Access permission denied by user in Freighter wallet.');
    }
  }

  const publicKey = await getPublicKey();
  if (!publicKey) {
    throw new Error('Could not retrieve public key from Freighter wallet.');
  }

  let network = 'TESTNET';
  try {
    network = await getNetwork();
  } catch (e) {
    console.warn('Could not fetch network from Freighter:', e);
  }

  return { publicKey, network };
}

/**
 * Fetches XLM balance for a given Stellar public key
 */
export async function fetchXLMBalance(publicKey) {
  if (!publicKey) return '0';

  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (b) => b.asset_type === 'native'
    );
    return nativeBalance ? nativeBalance.balance : '0.0000000';
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Account does not exist on testnet yet
      return '0 (Unfunded)';
    }
    console.error('Error fetching account balance:', error);
    throw new Error(
      error.message || 'Failed to fetch account balance from Stellar Horizon.'
    );
  }
}

/**
 * Validates a Stellar Ed25519 Public Key
 */
export function isValidStellarAddress(address) {
  if (!address || typeof address !== 'string') return false;
  try {
    return StellarSdk.StrKey.isValidEd25519PublicKey(address.trim());
  } catch {
    return false;
  }
}

/**
 * Sends XLM from sender to recipient on Stellar Testnet
 */
export async function sendXLMTransaction({
  senderPublicKey,
  recipientPublicKey,
  amount,
  memoText = '',
}) {
  if (!senderPublicKey) {
    throw new Error('Wallet not connected.');
  }

  const cleanRecipient = recipientPublicKey.trim();
  if (!isValidStellarAddress(cleanRecipient)) {
    throw new Error('Invalid Stellar recipient address. Address must start with G and be 56 characters long.');
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Please enter a valid positive XLM amount to send.');
  }

  try {
    // 1. Fetch sender account details to get current sequence number
    let account;
    try {
      account = await server.loadAccount(senderPublicKey);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        throw new Error(
          'Your account is not funded on Stellar Testnet yet. Click "Fund with Friendbot" first!'
        );
      }
      throw err;
    }

    // 2. Fetch current base fee
    const fee = await server.fetchBaseFee();

    // 3. Build Transaction
    let txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: fee.toString(),
      networkPassphrase: TESTNET_PASSPHRASE,
    }).addOperation(
      StellarSdk.Operation.payment({
        destination: cleanRecipient,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString(),
      })
    ).setTimeout(180);

    // Optional memo
    if (memoText && memoText.trim().length > 0) {
      txBuilder = txBuilder.addMemo(StellarSdk.Memo.text(memoText.trim()));
    }

    const transaction = txBuilder.build();
    const xdr = transaction.toXDR();

    // 4. Request Freighter signature
    let signedXdr;
    try {
      signedXdr = await signTransaction(xdr, {
        network: 'TESTNET',
        networkPassphrase: TESTNET_PASSPHRASE,
      });
    } catch (signErr) {
      console.error('Freighter sign error:', signErr);
      throw new Error(
        signErr.message || 'Transaction signing rejected or failed in Freighter.'
      );
    }

    if (!signedXdr) {
      throw new Error('User cancelled or declined the transaction in Freighter.');
    }

    // 5. Submit signed transaction to Horizon server
    const txToSubmit = StellarSdk.TransactionBuilder.fromXDR(
      signedXdr,
      TESTNET_PASSPHRASE
    );

    const result = await server.submitTransaction(txToSubmit);
    return {
      success: true,
      hash: result.hash || result.id,
      ledger: result.ledger,
      rawResult: result,
    };
  } catch (error) {
    console.error('Stellar transaction error:', error);
    let errorMsg = error.message || 'Transaction execution failed.';

    // Extract horizon error details if available
    if (error.response && error.response.data && error.response.data.extras) {
      const resultCodes = error.response.data.extras.result_codes;
      if (resultCodes) {
        errorMsg += ` (Codes: ${JSON.stringify(resultCodes)})`;
      }
    }

    throw new Error(errorMsg);
  }
}

/**
 * Funds an account on Testnet using Stellar Friendbot
 */
export async function fundWithFriendbot(publicKey) {
  if (!publicKey) throw new Error('No public key provided.');

  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || data.title || 'Friendbot funding request failed.'
      );
    }

    return data;
  } catch (error) {
    console.error('Friendbot error:', error);
    throw new Error(error.message || 'Failed to fund account via Friendbot.');
  }
}

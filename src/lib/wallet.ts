import bs58 from 'bs58';

import {
  Keypair,
  PublicKey,
} from '@solana/web3.js';

import { HOUSE_WALLET_PRIVATE_KEY } from './config';

// Constants
export const GRIN_TOKEN_MINT = new PublicKey('7JofsgKgD3MerQDa7hEe4dfkY3c3nMnsThZzUuYyTFpE');
export const HOUSE_WALLET = new PublicKey('HWewatuN4dvmcEjbNw3qBeGnvJ5NG28ATih9CtitNJgC');

function decodePrivateKey(encodedKey: string): Uint8Array {
  try {
    const decoded = bs58.decode(encodedKey);
    if (decoded.length !== 64) {
      throw new Error('Invalid private key length');
    }
    return decoded;
  } catch (error) {
    throw new Error('Failed to decode private key');
  }
}

function createAndValidateKeypair(privateKeyBytes: Uint8Array): Keypair {
  try {
    const keypair = Keypair.fromSecretKey(privateKeyBytes);
    
    // Basic validation - if fromSecretKey succeeds, the keypair is valid
    if (!keypair.secretKey || keypair.secretKey.length !== 64) {
      throw new Error('Invalid keypair generated');
    }
    
    return keypair;
  } catch (error) {
    throw new Error('Failed to create valid keypair');
  }
}

export function initializeHouseKeypair(): Keypair {
  try {
    if (!HOUSE_WALLET_PRIVATE_KEY) {
      throw new Error('House wallet private key is not configured');
    }

    const privateKeyBytes = decodePrivateKey(HOUSE_WALLET_PRIVATE_KEY.trim());
    const keypair = createAndValidateKeypair(privateKeyBytes);

    // Verify the public key matches the expected house wallet
    if (!keypair.publicKey.equals(HOUSE_WALLET)) {
      throw new Error('Keypair does not match expected house wallet address');
    }

    console.log('House wallet initialized successfully');
    return keypair;

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('House wallet initialization failed:', message);
    throw new Error(`House wallet initialization failed: ${message}`);
  }
}

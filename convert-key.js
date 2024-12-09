import bs58 from 'bs58';
import { readFileSync } from 'fs';

import { Keypair } from '@solana/web3.js';

// Read the key file
const keyData = readFileSync('/Users/8bit/cheshirekey/key.json', 'utf8');
const cleanedKey = keyData.trim().replace(/\[|\]/g, '').split(',').map(num => parseInt(num));
const uint8Array = new Uint8Array(cleanedKey);

// Create keypair and show both private and public keys
const keypair = Keypair.fromSecretKey(uint8Array);
console.log('Private Key (base58):', bs58.encode(uint8Array));
console.log('Public Key:', keypair.publicKey.toString());

import bs58 from 'bs58';
import dotenv from 'dotenv';

import { Keypair } from '@solana/web3.js';

// Load the production environment variables
dotenv.config({ path: '.env.production' });

const privateKey = process.env.VITE_HOUSE_WALLET_PRIVATE_KEY;
if (!privateKey) {
    throw new Error('Private key not found in environment variables');
}

const decoded = bs58.decode(privateKey);
const keypair = Keypair.fromSecretKey(decoded);
console.log('Public Key:', keypair.publicKey.toString());

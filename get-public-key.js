import bs58 from 'bs58';

import { Keypair } from '@solana/web3.js';

const privateKey = '5CY4LkwdrRKPvQq6ALvkdTXd5AJAq6qdtJPGp9a3QzmYvJ5eqDFVtUuq5A3GEiHySc';
const decoded = bs58.decode(privateKey);
const keypair = Keypair.fromSecretKey(decoded);
console.log('Public Key:', keypair.publicKey.toString());

import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

// Generate a new keypair
const keypair = Keypair.generate();

// Get the base58 encoded secret key
const secretKeyBase58 = bs58.encode(keypair.secretKey);

console.log('Generated new Solana keypair:');
console.log('Public Key:', keypair.publicKey.toBase58());
console.log('\nPrivate Key (base58):');
console.log(secretKeyBase58);
console.log('\nAdd this to your .env file as:');
console.log(`VITE_HOUSE_WALLET_PRIVATE_KEY=${secretKeyBase58}`);
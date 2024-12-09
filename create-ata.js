import { readFileSync } from 'fs';

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from '@solana/web3.js';

// Constants
const HELIUS_RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=6187a89e-d5e3-48ed-9904-600ae33a06fe';
const GRIN_TOKEN_MINT = new PublicKey('7JofsgKgD3MerQDa7hEe4dfkY3c3nMnsThZzUuYyTFpE');

async function createATA() {
    try {
        // Read and create house keypair
        const keyData = readFileSync('/Users/8bit/cheshirekey/key.json', 'utf8');
        const cleanedKey = keyData.trim().replace(/\[|\]/g, '').split(',').map(num => parseInt(num));
        const secretKey = new Uint8Array(cleanedKey);
        const houseKeypair = Keypair.fromSecretKey(secretKey);
        
        console.log('House wallet public key:', houseKeypair.publicKey.toString());

        // Connect to cluster
        const connection = new Connection(HELIUS_RPC_URL, 'confirmed');

        // First check if the mint uses Token Program 2022
        const mintAccount = await connection.getAccountInfo(GRIN_TOKEN_MINT);
        const tokenProgramId = mintAccount?.owner.equals(TOKEN_2022_PROGRAM_ID) 
            ? TOKEN_2022_PROGRAM_ID 
            : TOKEN_PROGRAM_ID;

        console.log('Using token program:', tokenProgramId.toString());

        // Get ATA address
        const ata = await getAssociatedTokenAddress(
            GRIN_TOKEN_MINT,
            houseKeypair.publicKey,
            false,
            tokenProgramId,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );
        console.log('ATA address to be created:', ata.toString());

        // Check if account already exists
        const accountInfo = await connection.getAccountInfo(ata);
        if (accountInfo !== null) {
            console.log('ATA already exists');
            return;
        }

        // Create transaction
        const transaction = new Transaction();
        
        // Add create ATA instruction
        transaction.add(
            createAssociatedTokenAccountInstruction(
                houseKeypair.publicKey, // payer
                ata, // ata address
                houseKeypair.publicKey, // owner
                GRIN_TOKEN_MINT, // mint
                tokenProgramId,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        );

        // Get latest blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = houseKeypair.publicKey;

        // Sign and send transaction
        transaction.sign(houseKeypair);
        const signature = await connection.sendRawTransaction(transaction.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed'
        });
        
        console.log('Creating ATA...');
        console.log('Transaction signature:', signature);
        
        const confirmation = await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight
        });

        if (confirmation.value.err) {
            throw new Error('Failed to confirm transaction');
        }

        console.log('ATA created successfully!');
        
    } catch (error) {
        console.error('Error creating ATA:', error);
        if (error.logs) {
            console.error('Transaction logs:', error.logs);
        }
    }
}

createATA();

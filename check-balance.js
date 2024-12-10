import dotenv from 'dotenv';

import {
  getAccount,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import {
  Connection,
  PublicKey,
} from '@solana/web3.js';

// Load the production environment variables
dotenv.config({ path: '.env.production' });

const HELIUS_RPC_URL = process.env.VITE_HELIUS_RPC_URL;
const GRIN_TOKEN_MINT = new PublicKey('7JofsgKgD3MerQDa7hEe4dfkY3c3nMnsThZzUuYyTFpE');
const HOUSE_WALLET = new PublicKey('HWewatuN4dvmcEjbNw3qBeGnvJ5NG28ATih9CtitNJgC');

if (!HELIUS_RPC_URL) {
    throw new Error('HELIUS_RPC_URL not found in environment variables');
}

async function checkBalance() {
    try {
        const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
        
        // Get the ATA for the house wallet
        const ata = await getAssociatedTokenAddress(
            GRIN_TOKEN_MINT,
            HOUSE_WALLET,
            false
        );
        console.log('House wallet ATA:', ata.toString());
        
        try {
            const account = await getAccount(connection, ata);
            console.log('GRIN Balance:', Number(account.amount) / (10 ** 9));
        } catch (e) {
            console.log('No ATA found - needs to be created');
        }
        
        // Also check using Helius API
        const response = await fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'grin-flip',
                method: 'searchAssets',
                params: {
                    ownerAddress: HOUSE_WALLET.toString(),
                    tokenType: 'fungible',
                    displayOptions: {
                        showNativeBalance: true
                    }
                },
            }),
        });

        const data = await response.json();
        console.log('Helius API response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

checkBalance();

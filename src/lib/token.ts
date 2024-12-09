import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  createTransferInstruction, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { HELIUS_RPC_URL } from './config';
import { GRIN_TOKEN_MINT, HOUSE_WALLET, initializeHouseKeypair } from './wallet';

// Initialize house keypair with lazy loading
let houseKeypair: ReturnType<typeof initializeHouseKeypair> | null = null;

function getHouseKeypair() {
  if (!houseKeypair) {
    try {
      houseKeypair = initializeHouseKeypair();
    } catch (error) {
      console.error('Failed to initialize house keypair:', error);
      throw error;
    }
  }
  return houseKeypair;
}

interface TokenBalance {
  id: string;
  content: {
    metadata: {
      name: string;
      symbol: string;
    };
  };
  token_info: {
    balance: number;
    decimals: number;
    symbol: string;
  };
}

export async function getGrinBalance(walletAddress: string): Promise<number> {
  try {
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'grin-flip',
        method: 'searchAssets',
        params: {
          ownerAddress: walletAddress,
          tokenType: 'fungible',
          displayOptions: {
            showNativeBalance: true
          }
        },
      }),
    });

    const data = await response.json();
    
    if (data.result?.items) {
      const grinToken = data.result.items.find((item: TokenBalance) => 
        item.id === GRIN_TOKEN_MINT.toString()
      );

      if (grinToken?.token_info) {
        const { balance, decimals = 9 } = grinToken.token_info;
        return balance / Math.pow(10, decimals);
      }
    }

    // If token not found in search results, return 0
    return 0;
  } catch (error) {
    console.error('Error fetching GRIN balance:', error);
    return 0;
  }
}

async function createTokenAccountIfNeeded(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  payer: PublicKey,
  transaction: Transaction
): Promise<PublicKey> {
  const ata = await getAssociatedTokenAddress(mint, owner);
  try {
    await getAccount(connection, ata);
  } catch (error) {
    console.log('Creating new token account for:', owner.toString());
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        ata,
        owner,
        mint
      )
    );
  }
  return ata;
}

export async function placeBet(
  connection: Connection,
  wallet: any,
  amount: number
): Promise<string> {
  try {
    if (!wallet.publicKey) throw new Error('Wallet not connected');

    const transaction = new Transaction();
    
    // Get or create token accounts
    const playerATA = await createTokenAccountIfNeeded(
      connection,
      GRIN_TOKEN_MINT,
      wallet.publicKey,
      wallet.publicKey,
      transaction
    );

    const houseATA = await createTokenAccountIfNeeded(
      connection,
      GRIN_TOKEN_MINT,
      HOUSE_WALLET,
      wallet.publicKey,
      transaction
    );

    // Add transfer instruction
    const transferAmount = Math.floor(amount * LAMPORTS_PER_SOL);
    transaction.add(
      createTransferInstruction(
        playerATA,
        houseATA,
        wallet.publicKey,
        transferAmount,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = wallet.publicKey;

    const signed = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    });
    
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });

    return signature;
  } catch (error) {
    console.error('Error placing bet:', error);
    throw error;
  }
}

export async function processPayout(
  connection: Connection,
  wallet: any,
  amount: number
): Promise<string> {
  try {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    
    const houseKeypair = getHouseKeypair();
    const transaction = new Transaction();

    // Get or create token accounts
    const playerATA = await createTokenAccountIfNeeded(
      connection,
      GRIN_TOKEN_MINT,
      wallet.publicKey,
      HOUSE_WALLET,
      transaction
    );

    const houseATA = await createTokenAccountIfNeeded(
      connection,
      GRIN_TOKEN_MINT,
      HOUSE_WALLET,
      HOUSE_WALLET,
      transaction
    );

    // Add transfer instruction
    const transferAmount = Math.floor(amount * LAMPORTS_PER_SOL);
    transaction.add(
      createTransferInstruction(
        houseATA,
        playerATA,
        HOUSE_WALLET,
        transferAmount,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = HOUSE_WALLET;

    transaction.sign(houseKeypair);
    const signature = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    });
    
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });

    return signature;
  } catch (error) {
    console.error('Error processing payout:', error);
    throw error;
  }
}
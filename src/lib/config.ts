// Environment variables
const REQUIRED_ENV_VARS = {
  HELIUS_RPC_URL: import.meta.env.VITE_HELIUS_RPC_URL,
  HOUSE_WALLET_PRIVATE_KEY: import.meta.env.VITE_HOUSE_WALLET_PRIVATE_KEY,
} as const;

// Validate all required environment variables
Object.entries(REQUIRED_ENV_VARS).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const HELIUS_RPC_URL = REQUIRED_ENV_VARS.HELIUS_RPC_URL;
export const HOUSE_WALLET_PRIVATE_KEY = REQUIRED_ENV_VARS.HOUSE_WALLET_PRIVATE_KEY;

// Constants
export const ENDPOINTS = {
  mainnet: HELIUS_RPC_URL,
  devnet: "https://api.devnet.solana.com",
} as const;
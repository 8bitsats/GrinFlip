# Grin Flip - Solana Coin Flip Game

A provably fair coin flip game powered by $GRIN token on Solana. Players can bet GRIN tokens on heads or tails, with a chance to double their bet on a win.

## Features

- **3D Animated Coin**: Beautiful Three.js-powered coin animation with realistic physics and lighting
- **Sound Effects**: Immersive sound effects for coin flips, wins, and losses
- **Provably Fair**: Transparent and verifiable random number generation
- **Solana Integration**: Seamless integration with Phantom and other Solana wallets
- **Real-time Updates**: Live balance updates and recent flip history
- **Responsive Design**: Clean, modern UI that works on all devices

## Provably Fair System

Our provably fair system ensures complete transparency and fairness in every flip:

1. **Multiple Sources of Entropy**:
   - Client seed (from player's wallet signature)
   - Server seed (generated for each game)
   - Nonce (incrementing counter)
   - Blockchain data (latest blockhash)

2. **Result Generation**:
   - Combines all entropy sources using Keccak-256 hash
   - First byte of hash determines result (< 128 = heads, >= 128 = tails)
   - All components are publicly verifiable

3. **Verification**:
   - Players can verify any previous game result
   - Server seed is revealed after each game
   - All game data is stored on-chain

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd grin-flip
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   VITE_HELIUS_RPC_URL=your_helius_rpc_url
   VITE_HOUSE_WALLET_PRIVATE_KEY=your_base58_encoded_private_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Technical Stack

- **Frontend**: React + TypeScript + Vite
- **3D Graphics**: Three.js
- **Blockchain**: Solana Web3.js
- **State Management**: Zustand
- **Styling**: TailwindCSS
- **Sound**: Web Audio API

## Smart Contract Integration

The game integrates with the GRIN token contract on Solana:
- Token Address: `7JofsgKgD3MerQDa7hEe4dfkY3c3nMnsThZzUuYyTFpE`
- Network: Solana Mainnet
- Standard: SPL Token

## Security Features

1. **Transaction Safety**:
   - All transactions are atomic
   - Strict input validation
   - Secure wallet integration

2. **Fair Play Guarantees**:
   - Server seed rotation
   - Transparent result generation
   - On-chain verification

## Development

1. **File Structure**:
   ```
   src/
   ├── components/     # React components
   ├── lib/           # Core logic and utilities
   ├── effects/       # Sound effects and assets
   └── styles/        # CSS and styling
   ```

2. **Key Components**:
   - `Game.tsx`: Main game logic
   - `CoinFlip.tsx`: 3D coin animation
   - `provably-fair.ts`: Fair result generation
   - `sounds.ts`: Sound effect management

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

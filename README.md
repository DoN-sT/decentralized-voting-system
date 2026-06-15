# 🗳️ DeVote — Decentralized Voting System

A full-stack blockchain-based voting application built with **Solidity**, **Hardhat**, and **Next.js**. Every vote is immutable, transparent, and verifiable on the Ethereum blockchain.

## Features

- **One-Person-One-Vote** — Each wallet address can vote exactly once
- **On-Chain Transparency** — All votes are stored on the blockchain and publicly verifiable
- **MetaMask Integration** — Connect your wallet to cast votes seamlessly
- **Real-Time Results** — Live vote counts and percentage bars update after each transaction
- **Smart Contract Security** — Input validation, double-vote prevention, and event emission
- **Premium UI** — Dark mode with glassmorphism, gradient animations, and micro-interactions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.24 |
| Blockchain Framework | Hardhat |
| Frontend | Next.js (React + TypeScript) |
| Styling | Tailwind CSS + Custom CSS |
| Web3 Integration | wagmi + viem |
| Wallet | MetaMask (Injected Connector) |

## Project Structure

```
├── blockchain/               # Smart contract layer
│   ├── contracts/
│   │   └── Voting.sol        # Voting smart contract
│   ├── scripts/
│   │   └── deploy.js         # Deployment script
│   ├── test/
│   │   └── Voting.test.js    # Unit tests (6 tests)
│   └── hardhat.config.js
│
└── frontend/                 # UI layer
    └── src/
        ├── app/              # Next.js app router
        ├── components/       # React components
        ├── contracts/        # Contract ABI + address
        └── providers/        # Web3 provider config
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MetaMask](https://metamask.io/) browser extension

### 1. Install Dependencies

```bash
# Blockchain
cd blockchain
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start Local Blockchain

```bash
cd blockchain
npx hardhat node
```

This starts a local Ethereum node at `http://127.0.0.1:8545` with 20 pre-funded test accounts.

### 3. Deploy the Smart Contract

Open a new terminal:

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Start the Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Connect MetaMask

1. Open MetaMask → Add a custom network:
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
2. Import a test account using any private key from the Hardhat node terminal
3. Click **"Connect with MetaMask"** on the app
4. Vote for your preferred candidate!

## Running Tests

```bash
cd blockchain
npx hardhat test
```

```
  Voting Contract
    ✔ Should initialize with correct candidates
    ✔ Should allow a user to vote
    ✔ Should prevent double voting
    ✔ Should reject invalid candidate IDs
    ✔ Should return all candidates via getAllCandidates
    ✔ Should emit VotedEvent on voting

  6 passing
```

## Smart Contract Overview

The `Voting.sol` contract provides:

- **`vote(uint256 candidateId)`** — Cast a vote for a candidate
- **`getAllCandidates()`** — Returns all candidates with vote counts
- **`voters(address)`** — Check if an address has already voted
- **`candidatesCount()`** — Total number of candidates
- **`VotedEvent`** — Emitted on every vote for off-chain indexing

## License

MIT

# VotingBlock - Blockchain-Based Voting Platform

## 📖 Overview

**VotingBlock** is a decentralized application (dApp) designed to facilitate secure, transparent, and tamper-proof voting processes using blockchain technology. The platform enables users to create voting sessions, cast votes, and view results through a simple, intuitive interface. All voting data is securely stored on the blockchain, ensuring immutability and trustworthiness.

### 🛠 Features
- **Secure Voting:** Votes are recorded on the blockchain, making them immutable and verifiable.
- **Custom Voting Sessions:** Create voting sessions with a title, candidates, and duration.
- **Real-time Results:** View live results during an active session and final results after it ends.
- **Wallet Integration:** Users connect their MetaMask wallet to participate in voting sessions.
- **Transparency:** All session details and votes are stored publicly on the blockchain.

---

## 🚀 How It Works

1. **Connect Wallet:** Users connect their MetaMask wallet to interact with the platform.
2. **Create Voting Session:** Submit session details (title, candidates, duration) via the frontend. The smart contract stores this data on the blockchain.
3. **Vote:** Select a candidate in an active session and cast your vote. The smart contract verifies that each user can vote only once per session.
4. **View Results:** Once a session ends, results are calculated and displayed on the platform.

---

## 🛠 Tech Stack

- **Smart Contract:** Written in Solidity and deployed on the Sepolia test network.
- **Frontend:** Built with React for a dynamic and responsive user interface.
- **Blockchain Network:** Ethereum (Sepolia testnet).
- **Hosting:** Frontend hosted on Vercel.

---

## 📝 How to Use

### Requirements
- **MetaMask Wallet:** Install the MetaMask extension in your browser.
- **Sepolia Testnet Funds:** Acquire test Ether for transactions.

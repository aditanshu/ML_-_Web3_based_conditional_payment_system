import 'dotenv/config.js';
import { ethers } from 'ethers';

// Get RPC URL and private key from .env
const RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Connect to Sepolia network
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Create a wallet instance
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

async function main() {
    const balance = await wallet.getBalance();
    console.log(`Wallet address: ${wallet.address}`);
    console.log(`Wallet balance: ${ethers.formatEther(balance)} ETH`);
}

main().catch(console.error);

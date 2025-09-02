import { ethers } from 'ethers';
import 'dotenv/config.js';

// Debug: check if RPC URL is loaded
console.log("RPC URL:", process.env.SEPOLIA_RPC_URL);

// Connect to Sepolia
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

async function main() {
    const blockNumber = await provider.getBlockNumber();
    console.log("Current Sepolia block number:", blockNumber);
}

main().catch(console.error);

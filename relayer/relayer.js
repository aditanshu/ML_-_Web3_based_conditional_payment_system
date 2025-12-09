import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let provider;
let wallet;
let contract;

/**
 * Initialize provider and wallet
 */
export function initProvider() {
    const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
    provider = new ethers.JsonRpcProvider(rpcUrl);

    const privateKey = process.env.RELAYER_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("RELAYER_PRIVATE_KEY not set in environment");
    }

    wallet = new ethers.Wallet(privateKey, provider);
    console.log("✅ Relayer wallet initialized:", wallet.address);

    return { provider, wallet };
}

/**
 * Load contract from deployment artifact
 */
export function loadContract() {
    const network = process.env.NETWORK || "localhost";
    const deploymentPath = path.join(__dirname, "..", "deployments", `${network}.json`);

    if (!fs.existsSync(deploymentPath)) {
        throw new Error(`Deployment artifact not found: ${deploymentPath}`);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

    if (!wallet) {
        initProvider();
    }

    contract = new ethers.Contract(deployment.address, deployment.abi, wallet);
    console.log("✅ Contract loaded:", deployment.address);

    return contract;
}

/**
 * Get relayer wallet balance
 */
export async function getRelayerBalance() {
    if (!wallet) {
        initProvider();
    }

    const balance = await provider.getBalance(wallet.address);
    return ethers.formatEther(balance);
}

/**
 * Get condition details from contract
 */
export async function getCondition(conditionId) {
    if (!contract) {
        loadContract();
    }

    try {
        const condition = await contract.getCondition(conditionId);

        return {
            id: condition.id.toString(),
            payer: condition.payer,
            payee: condition.payee,
            amount: ethers.formatEther(condition.amount),
            deadline: Number(condition.deadline),
            metadataURI: condition.metadataURI,
            executed: condition.executed,
            refunded: condition.refunded,
            createdAt: Number(condition.createdAt)
        };
    } catch (error) {
        if (error.message.includes("Condition does not exist")) {
            return null;
        }
        throw error;
    }
}

/**
 * Trigger a condition
 */
export async function triggerCondition(conditionId, proofHash) {
    if (!contract) {
        loadContract();
    }

    // Estimate gas
    const gasEstimate = await contract.triggerCondition.estimateGas(conditionId, proofHash);
    const gasLimit = (gasEstimate * 120n) / 100n; // 20% safety margin

    // Get current nonce
    const nonce = await provider.getTransactionCount(wallet.address, "pending");

    // Send transaction
    const tx = await contract.triggerCondition(conditionId, proofHash, {
        gasLimit,
        nonce
    });

    console.log(`📤 Trigger transaction sent: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();

    console.log(`✅ Trigger confirmed in block ${receipt.blockNumber}`);

    return {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? "success" : "failed"
    };
}

/**
 * Check if condition can be triggered
 */
export async function canTrigger(conditionId) {
    if (!contract) {
        loadContract();
    }

    return await contract.canTrigger(conditionId);
}

/**
 * Check if condition can be refunded
 */
export async function canRefund(conditionId) {
    if (!contract) {
        loadContract();
    }

    return await contract.canRefund(conditionId);
}

/**
 * Get total condition count
 */
export async function getConditionCount() {
    if (!contract) {
        loadContract();
    }

    const count = await contract.getConditionCount();
    return Number(count);
}

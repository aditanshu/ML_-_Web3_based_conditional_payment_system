// scripts/deploy_sepolia.cjs
require("dotenv").config();
const hre = require("hardhat");

async function main() {
    // Get the deployer wallet from Hardhat
    const [deployer] = await hre.ethers.getSigners();

    console.log("🚀 Deploying contracts with account:", deployer.address);

    // Check deployer balance (ethers v6 syntax)
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
        console.error("❌ Insufficient funds! Get Sepolia test ETH first.");
        return;
    }

    // Get the contract factory
    const Factory = await hre.ethers.getContractFactory("ConditionalPayment");

    // === UPDATE BEFORE DEPLOY ===
    const payee = "0x3b84fb1DFBD6CEc557681b0C68579FBa6b107DFB"; // Replace with real Sepolia payee
    const amount = hre.ethers.parseEther("0.01"); // Amount to lock in ETH
    const condition = "Only release after task completed";
    // ============================

    console.log("📦 Deploying ConditionalPayment...");

    // Deploy the contract with constructor args and send ETH
    const contract = await Factory.deploy(payee, amount, condition, {
        value: amount,
    });

    // Wait for deployment to be mined
    await contract.waitForDeployment();

    console.log("✅ Contract deployed at:", await contract.getAddress());
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});

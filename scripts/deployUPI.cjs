require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting ConditionalUPI deployment...\n");

    // Get network information
    const network = hre.network.name;
    const chainId = hre.network.config.chainId;

    console.log(`📡 Network: ${network}`);
    console.log(`🔗 Chain ID: ${chainId}\n`);

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("👤 Deploying with account:", deployer.address);

    // Check deployer balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

    if (balance === 0n) {
        console.error("❌ Insufficient funds! Get testnet ETH first.");
        process.exit(1);
    }

    // Set initial relayer (can be deployer or separate address)
    const initialRelayer = process.env.RELAYER_ADDRESS || deployer.address;
    console.log("🔐 Initial relayer:", initialRelayer, "\n");

    // Deploy ConditionalUPI contract
    console.log("📦 Deploying ConditionalUPI contract...");
    const ConditionalUPI = await hre.ethers.getContractFactory("ConditionalUPI");
    const contract = await ConditionalUPI.deploy(initialRelayer);

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("✅ ConditionalUPI deployed to:", contractAddress);

    // Get deployment transaction details
    const deployTx = contract.deploymentTransaction();
    const receipt = await deployTx.wait();

    console.log("📝 Transaction hash:", deployTx.hash);
    console.log("📦 Block number:", receipt.blockNumber);
    console.log("⛽ Gas used:", receipt.gasUsed.toString(), "\n");

    // Get contract ABI
    const artifact = await hre.artifacts.readArtifact("ConditionalUPI");

    // Create deployment artifact
    const deployment = {
        network: network,
        chainId: chainId,
        contractName: "ConditionalUPI",
        address: contractAddress,
        deployer: deployer.address,
        relayer: initialRelayer,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        abi: artifact.abi,
        transactionHash: deployTx.hash,
        gasUsed: receipt.gasUsed.toString()
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
        console.log("📁 Created deployments directory");
    }

    // Save deployment artifact
    const deploymentPath = path.join(deploymentsDir, `${network}.json`);
    fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
    console.log("💾 Deployment artifact saved to:", deploymentPath, "\n");

    // Also save to frontend contracts folder for easy access
    const frontendContractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
    if (fs.existsSync(frontendContractsDir)) {
        const frontendArtifactPath = path.join(frontendContractsDir, "ConditionalUPI.json");
        fs.writeFileSync(frontendArtifactPath, JSON.stringify(deployment, null, 2));
        console.log("💾 Frontend artifact saved to:", frontendArtifactPath, "\n");
    }

    // Print summary
    console.log("=".repeat(60));
    console.log("📋 DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log(`Contract: ConditionalUPI`);
    console.log(`Address: ${contractAddress}`);
    console.log(`Network: ${network} (Chain ID: ${chainId})`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Relayer: ${initialRelayer}`);
    console.log(`Block: ${receipt.blockNumber}`);
    console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
    console.log("=".repeat(60));

    // Network-specific explorer links
    if (network === "sepolia") {
        console.log(`\n🔍 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    } else if (network === "mumbai") {
        console.log(`\n🔍 View on PolygonScan: https://mumbai.polygonscan.com/address/${contractAddress}`);
    }

    console.log("\n✨ Deployment complete!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });

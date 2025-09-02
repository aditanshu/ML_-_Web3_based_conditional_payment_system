require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  paths: {
    artifacts: "./artifacts",
    sources: "./contracts",
    cache: "./cache",
    tests: "./test",
  },
  networks: {
    hardhat: {},  // default local network
    sepolia: {    // ✅ add this
      url: process.env.SEPOLIA_RPC_URL,       // Alchemy RPC
      accounts: [process.env.PRIVATE_KEY]     // wallet private key
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

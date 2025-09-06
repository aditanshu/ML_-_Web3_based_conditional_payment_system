// Replace with your deployed contract address on Sepolia
export const CONTRACT_ADDRESS = "0xYourContractAddressHere";

// Replace with your compiled contract ABI
export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_description", "type": "string" }
    ],
    "name": "createCondition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_conditionId", "type": "uint256" }
    ],
    "name": "approveCondition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Add more functions from your smart contract if needed
];

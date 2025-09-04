// src/web3/ethersProvider.js
import { ethers } from "ethers";

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // hex for 11155111

// Connect wallet via MetaMask
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();

  if (network.chainId !== BigInt(11155111)) {
    throw new Error("Please switch MetaMask to Sepolia testnet");
  }

  return {
    provider,
    signer,
    account: accounts[0],
    chainId: network.chainId.toString(),
  };
}

// Get current wallet info without reconnect
export async function getWalletInfo() {
  if (!window.ethereum) {
    return null;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.listAccounts();
  if (accounts.length === 0) return null;

  const signer = await provider.getSigner();
  const network = await provider.getNetwork();

  return {
    provider,
    signer,
    account: accounts[0].address,
    chainId: network.chainId.toString(),
  };
}

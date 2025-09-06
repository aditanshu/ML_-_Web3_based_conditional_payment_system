import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../config";

/**
 * Get contract instance
 */
const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask not installed");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  return contract;
};

/**
 * Create a new condition
 */
export const createCondition = async (account, description) => {
  try {
    const contract = await getContract();
    const tx = await contract.createCondition(description);
    await tx.wait();
    console.log("Condition created on blockchain");
  } catch (err) {
    console.error("createCondition error:", err);
    throw err;
  }
};

/**
 * Approve work / release payment
 */
export const approveWork = async (account, conditionId, fileUrl) => {
  try {
    const contract = await getContract();
    const tx = await contract.approveCondition(conditionId);
    await tx.wait();
    console.log("Payment released via smart contract");
  } catch (err) {
    console.error("approveWork error:", err);
    throw err;
  }
};

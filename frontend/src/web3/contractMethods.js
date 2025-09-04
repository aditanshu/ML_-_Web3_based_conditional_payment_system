import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

// ✅ Get contract instance
const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask is not installed");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // ✅ Pass CONTRACT_ABI (array) not full JSON
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  return { contract, signer };
};

// ✅ Method: Get contract details
export const getDetails = async () => {
  try {
    const { contract } = await getContract();
    const details = await contract.getDetails();

    return {
      payer: details[0],
      payee: details[1],
      amount: ethers.formatEther(details[2]),
      condition: details[3],
      isPaid: details[4],
    };
  } catch (error) {
    console.error("Error fetching details:", error);
    throw error;
  }
};

// ✅ Release payment
export const releasePayment = async () => {
  const { contract } = await getContract();
  const tx = await contract.releasePayment();
  await tx.wait();
  return tx.hash;
};

// ✅ Check if paid
export const checkIsPaid = async () => {
  const { contract } = await getContract();
  return await contract.isPaid();
};

export default getContract;

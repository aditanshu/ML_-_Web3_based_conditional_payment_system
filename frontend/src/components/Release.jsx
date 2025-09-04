import React, { useState } from "react";
import { ethers } from "ethers";
import contractABI from "../abi/contractABI.json";
import { CONTRACT_ADDRESS } from "../config";

const Release = () => {
  const [status, setStatus] = useState("");

  const releasePayment = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      setStatus("Processing release...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

      const tx = await contract.releasePayment();
      await tx.wait();

      setStatus("Payment released successfully!");
    } catch (err) {
      console.error(err);
      setStatus("Payment release failed!");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <h2 className="text-xl font-semibold mb-2">Release Payment</h2>
      <button
        onClick={releasePayment}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        Release
      </button>
      {status && <p className="mt-2 text-gray-700">{status}</p>}
    </div>
  );
};

export default Release;

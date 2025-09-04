import React, { useState } from "react";
import { ethers } from "ethers";
import contractABI from "../abi/contractABI.json";
import { CONTRACT_ADDRESS } from "../config";

const Deposit = () => {
  const [depositAmount, setDepositAmount] = useState("");
  const [status, setStatus] = useState("");

  const handleDeposit = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      setStatus("Processing...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

      const tx = await signer.sendTransaction({
        to: CONTRACT_ADDRESS,
        value: ethers.parseEther(depositAmount),
      });

      await tx.wait();
      setStatus(`Deposited ${depositAmount} ETH successfully!`);
      setDepositAmount("");
    } catch (err) {
      console.error(err);
      setStatus("Deposit failed!");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <h2 className="text-xl font-semibold mb-2">Deposit ETH</h2>
      <input
        type="number"
        placeholder="Amount in ETH"
        value={depositAmount}
        onChange={(e) => setDepositAmount(e.target.value)}
        className="border p-2 rounded w-1/2 mb-2"
      />
      <br />
      <button
        onClick={handleDeposit}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        Deposit
      </button>
      {status && <p className="mt-2 text-gray-700">{status}</p>}
    </div>
  );
};

export default Deposit;

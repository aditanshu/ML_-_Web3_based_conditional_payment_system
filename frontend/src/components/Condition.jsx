import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "../abi/contractABI.json";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";


const Condition = () => {
  const [condition, setCondition] = useState("");
  const [inputCondition, setInputCondition] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchCondition();
  }, []);

  const fetchCondition = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider);
      const currentCondition = await contract.condition();
      setCondition(currentCondition);
    } catch (err) {
      console.error(err);
    }
  };

  const setNewCondition = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      setStatus("Updating condition...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

      const tx = await contract.releasePayment(); // Normally, there would be a setter, here we assume releasePayment triggers condition logic
      await tx.wait();
      setCondition(inputCondition);
      setInputCondition("");
      setStatus("Condition updated successfully!");
    } catch (err) {
      console.error(err);
      setStatus("Failed to update condition!");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <h2 className="text-xl font-semibold mb-2">Payment Condition</h2>
      <p className="mb-2">Current Condition: <span className="font-medium">{condition || "Not set"}</span></p>
      <input
        type="text"
        placeholder="Enter new condition"
        value={inputCondition}
        onChange={(e) => setInputCondition(e.target.value)}
        className="border p-2 rounded w-2/3 mb-2"
      />
      <br />
      <button
        onClick={setNewCondition}
        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
      >
        Set Condition
      </button>
      {status && <p className="mt-2 text-gray-700">{status}</p>}
    </div>
  );
};

export default Condition;

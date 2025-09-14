import React, { useState } from "react";
import { ethers } from "ethers";
import contractABI from "../contracts/ConditionalPayment.json";

const CONTRACT_ADDRESS = "0x24552d0b6DA93bD8D19E80099495263c1575eaff"; // replace with deployed Sepolia address when ready

function Sender({ currentAccount }) {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [condition, setCondition] = useState("");
  const [contract, setContract] = useState(null);
  const [paymentReleased, setPaymentReleased] = useState(false);

  // Deploy contract with inputs
const savePayment = async () => {
  if (!window.ethereum) return alert("MetaMask required!");
  if (!receiver || !amount || !condition) return alert("All fields are required!");
  if (isNaN(Number(amount)) || Number(amount) <= 0) return alert("Invalid amount");

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const factory = new ethers.ContractFactory(
      contractABI.abi,
      contractABI.bytecode,
      signer
    );

    const deployed = await factory.deploy(
      receiver,
      ethers.parseEther(amount),
      condition,
      { value: ethers.parseEther(amount) }
    );

    await deployed.waitForDeployment();
    console.log("Deployed at:", await deployed.getAddress());

    setContract(deployed);
    alert(`Contract deployed at ${await deployed.getAddress()}`);
  } catch (err) {
    console.error("Error deploying contract:", err);
    alert("Deployment failed: " + err.message);
  }
};


  // Release payment when checkbox clicked
  const releasePayment = async () => {
    if (!contract) {
      alert("No active contract!");
      return;
    }
    try {
      const tx = await contract.releasePayment();
      await tx.wait();
      setPaymentReleased(true);
      alert("✅ Payment released!");
    } catch (err) {
      console.error("Error releasing payment:", err);
    }
  };

  return (
    <div className="flex justify-center items-center mt-8">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg text-white p-6 rounded-2xl shadow-xl border border-gray-700">
        {/* Title */}
        <h2 className="text-2xl font-bold mb-2">📤 Sender Dashboard</h2>
        <p className="text-sm text-gray-300 mb-6">
          Connected as:{" "}
          <span className="font-mono text-blue-400">{currentAccount}</span>
        </p>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Receiver Address"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Amount in ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Save Button */}
          <button
            onClick={savePayment}
            className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold text-white shadow-md hover:opacity-90 transition"
          >
            💾 Save Payment
          </button>
        </div>

        {/* Release Payment Section */}
        {contract && (
          <div className="mt-6 p-4 bg-gray-900/60 rounded-lg border border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                onChange={releasePayment}
                disabled={paymentReleased}
                className="w-5 h-5 accent-green-500"
              />
              <span className="text-sm">
                Mark task as done <span className="text-green-400">(release funds)</span>
              </span>
            </label>
            {paymentReleased && (
              <p className="mt-2 text-green-400 text-sm font-medium">
                ✅ Payment Released Successfully!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sender;

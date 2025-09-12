import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "../contracts/ConditionalPayment.json";

const CONTRACT_ADDRESS = "0x24552d0b6DA93bD8D19E80099495263c1575eaff"; // replace with Sepolia address when deployed there

function Receiver({ currentAccount }) {
  const [details, setDetails] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (currentAccount) {
      fetchDetails();
    }
  }, [currentAccount]);

  const fetchDetails = async () => {
    if (!window.ethereum) return alert("MetaMask required!");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider);

      const res = await contract.getDetails();
      const parsed = {
        payer: res[0],
        payee: res[1],
        amount: ethers.formatEther(res[2]),
        condition: res[3],
        isPaid: res[4],
      };

      setDetails(parsed);
      setHistory((prev) => [parsed, ...prev]); // latest first
    } catch (err) {
      console.error("Error fetching details:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📥 Receiver Dashboard</h2>
      <p className="text-sm text-gray-600 mb-6">Connected as: 
        <span className="font-mono text-blue-500"> {currentAccount}</span>
      </p>

      {/* Latest Payment Card */}
      {details ? (
        <div className="bg-white shadow-lg rounded-xl p-5 border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Latest Payment Details</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Payer:</span> <span className="font-mono">{details.payer}</span></p>
            <p><span className="font-medium">Payee:</span> <span className="font-mono">{details.payee}</span></p>
            <p><span className="font-medium">Amount:</span> <span className="text-green-600 font-semibold">{details.amount} ETH</span></p>
            <p><span className="font-medium">Condition:</span> {details.condition}</p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              {details.isPaid ? (
                <span className="text-green-600 font-semibold">✅ Paid</span>
              ) : (
                <span className="text-yellow-600 font-semibold">⏳ Pending</span>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg border border-yellow-200 shadow-sm">
          No payment data available yet.
        </div>
      )}

      {/* Payment History */}
      {history.length > 0 && (
        <div className="bg-gray-50 shadow-md rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">📜 Payment History</h3>
          <ul className="space-y-3 text-sm">
            {history.map((item, idx) => (
              <li
                key={idx}
                className="p-3 rounded-lg bg-white shadow-sm border border-gray-100 flex justify-between items-center"
              >
                <div>
                  <span className="text-green-600 font-semibold">{item.amount} ETH</span>{" "}
                  <span className="text-gray-500">from</span>{" "}
                  <span className="font-mono text-blue-500">{item.payer.substring(0, 6)}...{item.payer.slice(-4)}</span>{" "}
                  <span className="text-gray-500">→</span>{" "}
                  <span className="font-mono text-purple-500">{item.payee.substring(0, 6)}...{item.payee.slice(-4)}</span>
                </div>
                <span>
                  {item.isPaid ? (
                    <span className="text-green-600 font-semibold">✅ Paid</span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">⏳ Pending</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Receiver;

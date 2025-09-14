import React, { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";

function Navbar({ currentAccount, connectWallet, disconnectWallet, activeTab, setActiveTab }) {
  const [balance, setBalance] = useState(null);
  const [network, setNetwork] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function fetchDetails() {
      if (window.ethereum && currentAccount) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const bal = await provider.getBalance(currentAccount);
          const networkInfo = await provider.getNetwork();

          setBalance(Number(ethers.formatEther(bal)));
          setNetwork(networkInfo.name);
        } catch (err) {
          console.error("Error fetching wallet details:", err);
        }
      }
    }
    fetchDetails();
  }, [currentAccount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-gray-900 shadow-md border-b border-gray-800 relative">
      {/* Brand */}
      <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Smart UPI Web3
      </h1>

      {/* Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab("sender")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "sender"
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-300 hover:text-white hover:bg-gray-700"
          }`}
        >
          Sender
        </button>
        <button
          onClick={() => setActiveTab("receiver")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "receiver"
              ? "bg-green-600 text-white shadow-md"
              : "text-gray-300 hover:text-white hover:bg-gray-700"
          }`}
        >
          Receiver
        </button>
      </div>

      {/* Wallet / Account */}
      <div className="relative" ref={dropdownRef}>
        {currentAccount ? (
          <>
            {/* Account Logo */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md hover:opacity-90"
            >
              {currentAccount.substring(2, 4).toUpperCase()}
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-5 z-50">
                <span className="text-green-400 font-medium text-sm">✅ Connected</span>

                <div className="mt-3 text-sm text-gray-300 space-y-2">
                  <div>
                    <span className="font-semibold">Network:</span>{" "}
                    <span className="text-white">{network || "Loading..."}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Balance:</span>{" "}
                    <span className="text-white">
                      {balance !== null ? `${balance.toFixed(4)} ETH` : "..."}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Address:</span>{" "}
                    <span className="font-mono text-blue-400 break-all">
                      {currentAccount}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    disconnectWallet();
                    setMenuOpen(false);
                  }}
                  className="mt-4 w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm text-white font-medium transition"
                >
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-semibold text-white shadow transition"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

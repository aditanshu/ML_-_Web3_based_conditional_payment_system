import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navbar from "./components/Navbar";
import Sender from "./components/Sender";
import Receiver from "./components/Receiver";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [activeTab, setActiveTab] = useState("sender"); // default tab

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) {
      console.log("MetaMask not detected!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      }
    } catch (err) {
      console.error("Error checking wallet:", err);
    }
  };

  // ✅ Single connectWallet function
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.error("Error connecting wallet:", err);
    }
  };

  // ✅ Disconnect wallet
  const disconnectWallet = () => {
    setCurrentAccount(null);
    setActiveTab("sender"); // optional reset
  };

  return (
    <div>
      {/* Navbar handles navigation */}
      <Navbar
        currentAccount={currentAccount}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div style={{ padding: "20px" }}>
        {!currentAccount ? (
          <button
            onClick={connectWallet}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Connect Wallet
          </button>
        ) : (
          <>
            {activeTab === "sender" && (
              <Sender currentAccount={currentAccount} />
            )}
            {activeTab === "receiver" && (
              <Receiver currentAccount={currentAccount} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;

// src/components/WalletConnect.jsx
import React, { useState, useEffect } from "react";
import { connectWallet, getWalletInfo } from "../web3/ethersProvider";

const WalletConnect = () => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      try {
        const info = await getWalletInfo();
        if (info) {
          setAccount(info.account);
        }
      } catch (err) {
        console.error(err.message);
      }
    };
    checkConnection();
  }, []);

  const handleConnect = async () => {
    try {
      const info = await connectWallet();
      setAccount(info.account);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="wallet-connect">
      {account ? (
        <p>✅ Connected: {account}</p>
      ) : (
        <button onClick={handleConnect}>
          Connect Wallet
        </button>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default WalletConnect;

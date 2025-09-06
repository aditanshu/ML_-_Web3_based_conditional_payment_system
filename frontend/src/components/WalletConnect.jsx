import React, { useEffect, useState } from "react";
import useWallet from "../hooks/useWallet";
import { ethers } from "ethers";

export default function WalletConnect() {
  const { provider, account, chainId, connect, disconnect } = useWallet();
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchBalance() {
      if (!provider || !account) {
        setBalance(null);
        return;
      }
      try {
        setLoadingBalance(true);
        const bal = await provider.getBalance(account);
        if (!mounted) return;
        setBalance(ethers.utils.formatEther(bal));
      } catch (e) {
        console.error("balance fetch error", e);
        if (mounted) setError("Failed to fetch balance");
      } finally {
        if (mounted) setLoadingBalance(false);
      }
    }
    fetchBalance();
    return () => {
      mounted = false;
    };
  }, [provider, account]);

  const handleConnect = async () => {
    setError(null);
    try {
      await connect();
    } catch (e) {
      console.error(e);
      setError(e?.message || String(e));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 text-white rounded-2xl shadow-lg mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">🔗 Wallet</h2>

      {account ? (
        <div className="space-y-2 text-center">
          <div>
            <strong>Account:</strong>{" "}
            <span className="font-mono break-all">{account}</span>
          </div>
          <div>
            <strong>Network (chainId):</strong> {chainId ?? "—"}
          </div>
          <div>
            <strong>Balance:</strong>{" "}
            {loadingBalance ? "Loading..." : balance ? `${balance} ETH` : "—"}
          </div>

          <button
            className="mt-4 px-4 py-2 rounded bg-red-500 hover:bg-red-400 shadow-md transition"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="space-y-2 text-center">
          <p>Wallet not connected in this browser/profile.</p>
          <button
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 shadow-md transition"
            onClick={handleConnect}
          >
            Connect MetaMask / Wallet
          </button>
          {error && <p className="text-red-200 mt-2">{error}</p>}
          <p className="text-sm text-gray-200 mt-2">
            Tip: MetaMask is profile-specific. Ensure your browser profile
            has MetaMask installed and unlocked.
          </p>
        </div>
      )}
    </div>
  );
}

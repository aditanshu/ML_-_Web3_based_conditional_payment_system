// src/hooks/useWallet.js
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";

/**
 * Simple wallet hook using ethers v5 API.
 * Exposes: provider, signer, account, chainId, connect(), disconnect()
 *
 * If your project uses ethers@6, let me know and I will provide the v6 version.
 */
export default function useWallet() {
  const [provider, setProvider] = useState(null); // ethers.providers.Web3Provider
  const [signer, setSigner] = useState(null); // ethers.Signer
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    if (!window.ethereum) {
      setProvider(null);
      return;
    }

    const p = new ethers.providers.Web3Provider(window.ethereum, "any");
    setProvider(p);

    const handleAccountsChanged = (accounts) => {
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setSigner(p.getSigner());
      } else {
        setAccount(null);
        setSigner(null);
      }
    };

    const handleChainChanged = (chainIdHex) => {
      try {
        const n = Number(chainIdHex);
        setChainId(n);
      } catch {
        // sometimes providers send decimal instead of hex
        setChainId(parseInt(chainIdHex, 10));
      }
    };

    if (window.ethereum.on) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    // initialize if already connected
    (async () => {
      try {
        const accounts = await p.listAccounts();
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          setSigner(p.getSigner());
        }
        const net = await p.getNetwork();
        if (net && net.chainId) setChainId(net.chainId);
      } catch (e) {
        console.warn("useWallet init error", e);
      }
    })();

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask / injected wallet not available in this browser/profile.");
    }
    try {
      const p = provider ?? new ethers.providers.Web3Provider(window.ethereum, "any");
      // request accounts
      const accounts = await p.send("eth_requestAccounts", []);
      setProvider(p);
      setAccount(accounts[0]);
      const s = p.getSigner();
      setSigner(s);
      const net = await p.getNetwork();
      setChainId(net.chainId);
      return { provider: p, signer: s, account: accounts[0], chainId: net.chainId };
    } catch (e) {
      throw e;
    }
  }, [provider]);

  const disconnect = useCallback(() => {
    // cannot truly disconnect MetaMask programmatically; clear local state
    setAccount(null);
    setSigner(null);
    setChainId(null);
  }, []);

  return { provider, signer, account, chainId, connect, disconnect };
}

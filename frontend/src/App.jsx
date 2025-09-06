import React, { useState, useEffect } from "react";
import WalletConnect from "./components/WalletConnect";
import ConditionBuilder from "./components/ConditionBuilder";
import ConditionList from "./components/ConditionList";
import PayeeUpload from "./components/PayeeUpload";
import PayerVerification from "./components/PayerVerification";

function App() {
  const [account, setAccount] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);

  // Wallet connection
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (err) {
      console.error(err);
      alert("Wallet connection failed.");
    }
  };

  useEffect(() => {
    if (window.ethereum && !account) {
      window.ethereum.on("accountsChanged", (accounts) => setAccount(accounts[0] || null));
    }
  }, [account]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header / Wallet Connect */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">💰 Conditional Payment Dashboard</h1>
        <WalletConnect account={account} connectWallet={connectWallet} />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Condition Builder + List */}
        <div>
          <ConditionBuilder account={account} onConditionCreated={() => setSelectedCondition(null)} />
          <ConditionList onSelectCondition={setSelectedCondition} />
        </div>

        {/* Right Column: Payee Upload or Payer Verification */}
        <div>
          {selectedCondition ? (
            account === selectedCondition.payee ? (
              <PayeeUpload condition={selectedCondition} />
            ) : (
              <PayerVerification account={account} condition={selectedCondition} />
            )
          ) : (
            <p className="text-center text-gray-600 mt-6">
              Select a condition from the list to view uploads or verify work.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

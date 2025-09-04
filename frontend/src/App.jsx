import React from "react";
import WalletConnect from "./components/WalletConnect";
import Deposit from "./components/Deposit";
import Condition from "./components/Condition";
import Release from "./components/Release";
import Dashboard from "./components/Dashboard";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Smart Conditional UPI (Web3)
      </h1>

      {/* Wallet Connect Section */}
      <div className="mb-6">
        <WalletConnect />
      </div>

      {/* Dashboard */}
      <div className="mb-6">
        <Dashboard />
      </div>

      {/* Deposit ETH */}
      <div className="mb-6">
        <Deposit />
      </div>

      {/* Set Condition */}
      <div className="mb-6">
        <Condition />
      </div>

      {/* Release Payment */}
      <div className="mb-6">
        <Release />
      </div>
    </div>
  );
};

export default App;

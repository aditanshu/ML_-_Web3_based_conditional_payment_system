import React, { useState } from "react";
import { createCondition } from "../utils/contractHelpers";
import axios from "axios";

function ConditionBuilder({ account, onConditionCreated }) {
  const [description, setDescription] = useState("");
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [conditionType, setConditionType] = useState("time"); // "time" or "work"
  const [dateTime, setDateTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleCreateCondition = async () => {
    if (!description.trim() || !payee.trim() || !amount) {
      alert("Please fill all fields.");
      return;
    }

    if (conditionType === "time" && !dateTime) {
      alert("Please select a date and time for time-based condition.");
      return;
    }

    setLoading(true);
    setStatusMessage("Creating condition...");

    try {
      // Call smart contract if wallet connected
      if (account) {
        await createCondition(account, description);
      }

      // Save condition to backend
      await axios.post("http://localhost:5000/conditions", {
        description,
        payee,
        amount,
        conditionType,
        dateTime,
      });

      setStatusMessage("Condition created successfully!");
      setDescription("");
      setPayee("");
      setAmount("");
      setDateTime("");
      setConditionType("time");
      setLoading(false);

      if (onConditionCreated) onConditionCreated();
    } catch (err) {
      console.error(err);
      setStatusMessage("Failed to create condition.");
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl shadow-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white w-full max-w-lg mx-auto mb-6">
      <h2 className="text-2xl font-bold mb-4 text-center">🛠 Create New Condition</h2>

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the condition (e.g., 'House fully painted')"
        className="w-full p-3 rounded-xl mb-4 text-black"
        rows={3}
      />

      {/* Payee Wallet */}
      <input
        type="text"
        placeholder="Payee Wallet Address"
        value={payee}
        onChange={(e) => setPayee(e.target.value)}
        className="w-full p-3 rounded-xl mb-4 text-black"
      />

      {/* Amount */}
      <input
        type="number"
        placeholder="Amount to Transfer (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 rounded-xl mb-4 text-black"
      />

      {/* Condition Type */}
      <div className="mb-4">
        <label className="mr-4 font-semibold">Condition Type:</label>
        <select
          value={conditionType}
          onChange={(e) => setConditionType(e.target.value)}
          className="p-2 rounded-xl text-black"
        >
          <option value="time">Time-Based</option>
          <option value="work">Work-Based</option>
        </select>
      </div>

      {/* Date/Time Picker (only for time-based) */}
      {conditionType === "time" && (
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="w-full p-3 rounded-xl mb-4 text-black"
        />
      )}

      <button
        onClick={handleCreateCondition}
        disabled={loading || !account}
        className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-xl shadow-lg hover:bg-yellow-300 transition transform hover:scale-105"
      >
        {loading ? "Creating..." : "Create Condition"}
      </button>

      {statusMessage && <p className="mt-3 text-center">{statusMessage}</p>}
    </div>
  );
}

export default ConditionBuilder;

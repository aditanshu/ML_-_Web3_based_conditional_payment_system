import React, { useEffect, useState } from "react";
import axios from "axios";

function ConditionList({ onSelectCondition }) {
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConditions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/conditions");
      setConditions(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center text-indigo-700">📜 Conditions List</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading conditions...</p>
      ) : conditions.length === 0 ? (
        <p className="text-center text-gray-500">No conditions available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {conditions.map((cond) => (
            <div
              key={cond.id}
              onClick={() => onSelectCondition(cond)}
              className="cursor-pointer p-4 rounded-xl shadow-md bg-gradient-to-r from-purple-300 via-pink-200 to-yellow-200 hover:scale-105 transform transition"
            >
              <h3 className="font-bold text-lg">{cond.title || cond.description}</h3>
              <p className="text-sm text-gray-700">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    cond.status === "Verified"
                      ? "text-green-600"
                      : cond.status === "Rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {cond.status}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Type: {cond.conditionType || "Time/Work"} | Amount: {cond.amount || "N/A"} ETH
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConditionList;

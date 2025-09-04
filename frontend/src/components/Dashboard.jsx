import React, { useEffect, useState } from "react";
import { getDetails, releasePayment, checkIsPaid } from "../web3/contractMethods";

const Dashboard = () => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getDetails(); // ✅ use getDetails from contractMethods.js
        setDetails(data); // data is already in the correct format from getDetails()
      } catch (error) {
        console.error("Error fetching contract details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  const handleReleasePayment = async () => {
    try {
      await releasePayment();
      const updatedDetails = await getDetails(); // refresh details
      setDetails(updatedDetails);
    } catch (error) {
      console.error("Error releasing payment:", error);
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading contract details...</p>;
  }

  if (!details) {
    return <p className="text-red-600">No details available.</p>;
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold mb-4">Contract Dashboard</h2>
      <div className="space-y-2">
        <p>
          <strong>Payer:</strong> {details.payer}
        </p>
        <p>
          <strong>Payee:</strong> {details.payee}
        </p>
        <p>
          <strong>Amount:</strong> {details.amount} ETH
        </p>
        <p>
          <strong>Condition:</strong> {details.condition}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          {details.isPaid ? (
            <span className="text-green-600 font-semibold">Paid</span>
          ) : (
            <span className="text-yellow-600 font-semibold">Pending</span>
          )}
        </p>
      </div>

      {!details.isPaid && (
        <button
          onClick={handleReleasePayment}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Release Payment
        </button>
      )}
    </div>
  );
};

export default Dashboard;

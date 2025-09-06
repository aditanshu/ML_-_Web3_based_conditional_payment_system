import React, { useEffect, useState } from "react";
import axios from "axios";
import { approveWork } from "../utils/contractHelpers";

function PayerVerification({ account, condition }) {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fetch uploaded files + AI results
  const fetchUploads = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/verify/${condition.id}`);
      setUploads(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (condition) fetchUploads();
  }, [condition]);

  const handleApprove = async (file) => {
    try {
      setProcessing(true);
      await approveWork(account, condition.id, file.fileUrl);
      // Update UI status
      setUploads((prev) =>
        prev.map((u) =>
          u.fileUrl === file.fileUrl ? { ...u, verified: true } : u
        )
      );
      setProcessing(false);
    } catch (err) {
      console.error(err);
      alert("Approval failed!");
      setProcessing(false);
    }
  };

  const handleReject = async (file) => {
    try {
      setProcessing(true);
      await axios.post("http://localhost:5000/verify/reject", {
        conditionId: condition.id,
        fileUrl: file.fileUrl,
      });
      // Update UI status
      setUploads((prev) =>
        prev.map((u) =>
          u.fileUrl === file.fileUrl ? { ...u, verified: false } : u
        )
      );
      setProcessing(false);
    } catch (err) {
      console.error(err);
      alert("Rejection failed!");
      setProcessing(false);
    }
  };

  if (!condition) return <p className="text-center mt-6 text-gray-600">Select a condition to verify.</p>;

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center text-indigo-700">🔍 Verify Work for: {condition.title || condition.description}</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading uploads...</p>
      ) : uploads.length === 0 ? (
        <p className="text-center text-gray-500">No uploads for this condition yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {uploads.map((file, idx) => (
            <div key={idx} className="p-4 rounded-xl shadow-md bg-white text-black">
              <p className="font-semibold mb-1">File: {file.fileUrl.split("/").pop()}</p>
              <p>AI Score: {file.aiScore}%</p>
              <p>Status: {file.verified === true ? "Verified" : file.verified === false ? "Rejected" : "Pending"}</p>
              <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline block mb-2">
                View File
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(file)}
                  disabled={processing || file.verified === true}
                  className="bg-green-500 hover:bg-green-400 text-white py-2 px-4 rounded-xl shadow-md transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(file)}
                  disabled={processing || file.verified === false}
                  className="bg-red-500 hover:bg-red-400 text-white py-2 px-4 rounded-xl shadow-md transition"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PayerVerification;

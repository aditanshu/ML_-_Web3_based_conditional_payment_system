import React, { useState } from "react";
import axios from "axios";

function PayeeUpload({ condition }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!files.length) return alert("Please select files to upload.");

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    formData.append("conditionId", condition.id);

    try {
      setStatus("Uploading...");
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload response:", res.data);
      setStatus("Upload successful!");
      setFiles([]);
    } catch (err) {
      console.error(err);
      setStatus("Upload failed.");
    }
  };

  return (
    <div className="p-6 rounded-2xl shadow-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">📤 Upload Work for Condition</h2>

      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="w-full mb-4 text-black p-2 rounded-xl"
      />

      <button
        onClick={handleUpload}
        className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-xl shadow-lg hover:bg-yellow-300 transition transform hover:scale-105"
      >
        Upload
      </button>

      {status && <p className="mt-3 text-center">{status}</p>}
    </div>
  );
}

export default PayeeUpload;

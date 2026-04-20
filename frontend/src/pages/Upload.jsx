import { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import Sidebar from "../components/Sidebar";

const Upload = () => {
  const { fetchInventory } = useContext(AppContext);
  const BASE_URL = "http://127.0.0.1:5000";

  const [stockFiles, setStockFiles] = useState([]);
  const [dispenseFiles, setDispenseFiles] = useState([]);

  const [form, setForm] = useState({
    name: "",
    batch: "",
    quantity: "",
    expiry: "",
  });

  const [dispenseForm, setDispenseForm] = useState({
    name: "",
    batch: "",
    quantity: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const makeJsonRequest = async (url, payload, successMsg, errorMsg) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || "Unknown error" };
      }

      if (!res.ok) {
        throw new Error(data.error || errorMsg);
      }

      showToast(successMsg);
      return true;
    } catch (err) {
      console.error("Manual request error:", err);
      showToast(err.message || errorMsg, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = async () => {
    if (!form.name.trim() || !form.batch.trim() || !form.quantity || !form.expiry) {
      return showToast("All fields are required", "error");
    }

    const payload = {
      name: form.name.trim(),
      batch: form.batch.trim(),
      quantity: Number(form.quantity),
      expiry: form.expiry,
    };

    const success = await makeJsonRequest(
      "/add-stock",
      payload,
      "Stock added successfully!",
      "Failed to add stock"
    );

    if (success) {
      setForm({ name: "", batch: "", quantity: "", expiry: "" });
      fetchInventory();
    }
  };

  const handleManualDispense = async () => {
    if (!dispenseForm.name.trim() || !dispenseForm.batch.trim() || !dispenseForm.quantity) {
      return showToast("All fields are required", "error");
    }

    const payload = {
      name: dispenseForm.name.trim(),
      batch: dispenseForm.batch.trim(),
      quantity: Number(dispenseForm.quantity),
    };

    const success = await makeJsonRequest(
      "/add-dispense",
      payload,
      "Dispense added successfully!",
      "Failed to add dispense"
    );

    if (success) {
      setDispenseForm({ name: "", batch: "", quantity: "" });
      fetchInventory();
    }
  };

  const handleFileUpload = async (files, endpoint, successMessage, fileType) => {
    if (files.length === 0) return showToast(`Select ${fileType} files`, "error");

    setLoading(true);
    try {
      for (let file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${BASE_URL}${endpoint}`, {
          method: "POST",
          body: formData,
          // Do NOT set Content-Type for FormData (browser sets it with boundary)
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Upload failed");
        }
      }

      const fileNames = files.map((f) => f.name);
      setUploadedFiles((prev) => [...prev, ...fileNames]);
      setStockFiles([]);     // Reset if stock
      setDispenseFiles([]);  // Reset if dispense

      showToast(successMessage);
      fetchInventory();
    } catch (err) {
      console.error("Upload error:", err);
      showToast(err.message || `${fileType} upload failed`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpload = () => handleFileUpload(
    stockFiles,
    "/upload-stock",
    "Stock uploaded successfully!",
    "stock"
  );

  const handleDispenseUpload = () => handleFileUpload(
    dispenseFiles,
    "/upload-dispensing",
    "Dispensing uploaded successfully!",
    "dispensing"
  );

  const handleDelete = (fileName) => {
    setUploadedFiles((prev) => prev.filter((f) => f !== fileName));
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 p-6 w-full bg-gray-100 min-h-screen relative">
        {/* Toast */}
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg min-w-[260px] text-white transition-all duration-500
            ${toast.show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
            ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}
        >
          {toast.message}
        </div>

        <h1 className="text-3xl font-bold mb-6">Upload Data</h1>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Upload Stock CSV</h2>
            <input
              type="file"
              multiple
              accept=".csv"
              onChange={(e) => setStockFiles(Array.from(e.target.files))}
              className="block w-full border p-2 rounded mb-3"
            />
            <button 
              onClick={handleStockUpload} 
              disabled={loading || stockFiles.length === 0}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded font-medium"
            >
              {loading ? "Uploading..." : "Upload Stock"}
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Upload Dispensing CSV</h2>
            <input
              type="file"
              multiple
              accept=".csv"
              onChange={(e) => setDispenseFiles(Array.from(e.target.files))}
              className="block w-full border p-2 rounded mb-3"
            />
            <button 
              onClick={handleDispenseUpload} 
              disabled={loading || dispenseFiles.length === 0}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded font-medium"
            >
              {loading ? "Uploading..." : "Upload Dispense"}
            </button>
          </div>
        </div>

        {/* Manual Entries - unchanged */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="mb-4 font-semibold">➕ Manual Stock Entry</h2>
            <div className="flex flex-col gap-3">
              <input value={form.name} placeholder="Medicine Name" onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-3 rounded" />
              <input value={form.batch} placeholder="Batch No" onChange={(e) => setForm({ ...form, batch: e.target.value })} className="border p-3 rounded" />
              <input value={form.quantity} type="number" placeholder="Quantity" onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="border p-3 rounded" />
              <input value={form.expiry} type="date" onChange={(e) => setForm({ ...form, expiry: e.target.value })} className="border p-3 rounded" />
              <button onClick={handleManualAdd} disabled={loading} className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-3 rounded font-medium">
                {loading ? "Adding..." : "Add Stock"}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="mb-4 font-semibold">➖ Manual Dispense Entry</h2>
            <div className="flex flex-col gap-3">
              <input value={dispenseForm.name} placeholder="Medicine" onChange={(e) => setDispenseForm({ ...dispenseForm, name: e.target.value })} className="border p-3 rounded" />
              <input value={dispenseForm.batch} placeholder="Batch" onChange={(e) => setDispenseForm({ ...dispenseForm, batch: e.target.value })} className="border p-3 rounded" />
              <input value={dispenseForm.quantity} type="number" placeholder="Quantity" onChange={(e) => setDispenseForm({ ...dispenseForm, quantity: e.target.value })} className="border p-3 rounded" />
              <button onClick={handleManualDispense} disabled={loading} className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white p-3 rounded font-medium">
                {loading ? "Adding..." : "Add Dispense"}
              </button>
            </div>
          </div>
        </div>

        {/* Uploaded Files */}
        <div className="bg-white p-6 rounded-xl shadow mt-6">
          <h2 className="text-lg font-semibold mb-4">📂 Uploaded Files</h2>
          {uploadedFiles.length === 0 ? (
            <p className="text-gray-500">No files uploaded yet</p>
          ) : (
            uploadedFiles.map((file, i) => (
              <div key={i} className="flex justify-between border-b py-2">
                <span>{file}</span>
                <button onClick={() => handleDelete(file)} className="text-red-500 hover:text-red-700">×</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
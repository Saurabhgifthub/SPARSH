import { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import Sidebar from "../components/Sidebar";

const AddMedicine = () => {
  const { fetchInventory } = useContext(AppContext);
  const BASE_URL = "http://127.0.0.1:5000";

  const [form, setForm] = useState({
    name: "",
    batch: "",
    quantity: "",
    expiry: "",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });
  };

  // Auto hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({
          ...prev,
          show: false,
        }));
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${BASE_URL}/add-stock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          batch: form.batch,
          quantity: Number(form.quantity),
          expiry: form.expiry,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add medicine");
      }

      showToast("Medicine added successfully");
      
      // Reset form
      setForm({
        name: "",
        batch: "",
        quantity: "",
        expiry: "",
      });

      await fetchInventory();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error adding medicine", "error");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-6 w-full bg-gray-100 min-h-screen relative">
        {/* Toast Notification */}
        <div
          className={`fixed top-5 right-5 z-50 transition-all duration-500 transform 
            ${toast.show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
            ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}
            text-white px-5 py-3 rounded-xl shadow-lg min-w-[260px]`}
        >
          {toast.message}
        </div>

        <h1 className="text-2xl font-bold mb-6">Add Medicine</h1>

        <div className="bg-white p-6 rounded-xl shadow flex flex-col gap-4 w-96">
          <input
            name="name"
            placeholder="Medicine Name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="batch"
            placeholder="Batch No"
            value={form.batch}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="quantity"
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="expiry"
            type="date"
            value={form.expiry}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded font-medium"
          >
            Add Medicine
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMedicine;
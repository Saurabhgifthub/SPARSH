import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

const BASE_URL = "http://127.0.0.1:5000";

export const AppProvider = ({ children }) => {
  const [medicines, setMedicines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const transformData = (data) => {
    return data.map((item) => {
      const today = new Date();
      const expiry = new Date(item.Expiry_Date);
      const daysLeft = Math.ceil(
        (expiry - today) / (1000 * 60 * 60 * 24)
      );

      return {
        name: item.Medicine,
        batch: item.Batch_No,
        quantity: item.Quantity,
        expiry: daysLeft,
      };
    });
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${BASE_URL}/inventory`);
      const data = await res.json();

      console.log("Inventory API:", data); // 🔥 debug

      setMedicines(transformData(data));
    } catch (err) {
      console.error("Inventory error:", err);
      setMedicines([]);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/alerts`);
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcess = async () => {
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/process-dispensing`, {
        method: "POST",
      });

      await fetchInventory();
      await fetchAlerts();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
    fetchAlerts();
  }, []);

  return (
    <AppContext.Provider
      value={{
        medicines,
        alerts,
        loading,
        fetchInventory,
        handleProcess,
        setMedicines, // ✅ needed for Inventory sorting
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
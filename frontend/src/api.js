const BASE_URL = "http://127.0.0.1:5000";

export const getInventory = async () => {
  const res = await fetch(`${BASE_URL}/inventory`);
  return res.json(); // ✅ FIX
};

export const getAlerts = async () => {
  const res = await fetch(`${BASE_URL}/alerts`);
  return res.json(); // ✅ FIX
};
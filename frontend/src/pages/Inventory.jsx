import { useContext, useState, useMemo, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { Bar, Doughnut } from "react-chartjs-2";
import { Package, Search } from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Inventory = () => {
  const { medicines, setMedicines } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("quantity-desc");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/inventory");

      const formatted = res.data.map((item) => ({
        name: item.Medicine,
        quantity: item.Quantity,
        batch: item.Batch_No,
        expiry: item.Expiry_Date
          ? Math.ceil(
              (new Date(item.Expiry_Date) - new Date()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
      }));

      setMedicines(formatted);
    } catch (err) {
      console.error("Inventory fetch error:", err);
    }
  };

  const filtered = useMemo(() => {
    return medicines.filter((m) =>
      (m?.name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [medicines, search]);

  const sortedMedicines = useMemo(() => {
    let sorted = [...filtered];

    switch (sortType) {
      case "quantity-desc":
        sorted.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
        break;
      case "quantity-asc":
        sorted.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
        break;
      case "expiry-asc":
        sorted.sort((a, b) => (a.expiry || 999) - (b.expiry || 999));
        break;
      case "name-asc":
        sorted.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );
        break;
      default:
        break;
    }

    return sorted;
  }, [filtered, sortType]);

  const safeCount = sortedMedicines.filter((m) => (m.expiry || 0) >= 30).length;
  const expiringCount = sortedMedicines.filter(
    (m) => (m.expiry || 0) < 30 && (m.expiry || 0) >= 7
  ).length;
  const criticalCount = sortedMedicines.filter(
    (m) => (m.expiry || 0) < 7
  ).length;

  const healthChart = {
    labels: ["Safe Stock", "Expiring Soon", "Critical"],
    datasets: [
      {
        data: [safeCount, expiringCount, criticalCount],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderWidth: 4,
        borderColor: "#ffffff",
      },
    ],
  };

  const stockChart = {
    labels: sortedMedicines.map((m) => m.name),
    datasets: [
      {
        label: "Current Stock",
        data: sortedMedicines.map((m) => m.quantity || 0),
        backgroundColor: "#2563eb",
        borderColor: "#1e40af",
        borderWidth: 2,
        borderRadius: 10,
      },
    ],
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 p-8 w-full bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-blue-600 p-4 rounded-2xl">
            <Package className="text-white" size={38} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Inventory</h1>
            <p className="text-slate-500">Real-time stock monitoring</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative flex-1 min-w-[300px]">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={24} />
            </div>
            <input
              type="text"
              placeholder="Search medicine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-lg focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="bg-white border border-slate-200 px-6 py-4 rounded-2xl text-lg"
          >
            <option value="quantity-desc">Quantity: High to Low</option>
            <option value="quantity-asc">Quantity: Low to High</option>
            <option value="expiry-asc">Expiry: Soonest First</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12">
          <div className="px-10 py-6 bg-slate-50 border-b flex justify-between">
            <h2 className="text-2xl font-semibold">Current Inventory</h2>
            <p>{sortedMedicines.length} medicines</p>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-6 text-left">Medicine Name</th>
                <th className="p-6 text-left">Batch No</th>
                <th className="p-6 text-left">Quantity</th>
                <th className="p-6 text-left">Expiry (Days)</th>
                <th className="p-6 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {sortedMedicines.map((m, i) => (
                <tr key={i} className="border-b hover:bg-slate-50">
                  
                  {/* ⭐ UPDATED MEDICINE NAME */}
                  <td className="p-6 text-2xl font-semibold tracking-wide text-slate-900">
                    {m.name}
                  </td>

                  <td className="p-6 text-slate-600">{m.batch || "—"}</td>

                  <td className="p-6 font-bold text-lg">{m.quantity}</td>

                  <td className="p-6 text-slate-600">{m.expiry ?? "—"}</td>

                  <td className="p-6">
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-semibold
                        ${
                          m.expiry < 7
                            ? "bg-red-100 text-red-700"
                            : m.expiry < 30
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                    >
                      {m.expiry < 7
                        ? "Critical"
                        : m.expiry < 30
                        ? "Expiring Soon"
                        : "Safe"}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow">
            <h2 className="text-xl font-semibold mb-4">Stock Health</h2>
            <Doughnut data={healthChart} />
          </div>

          <div className="bg-white p-8 rounded-3xl shadow">
            <h2 className="text-xl font-semibold mb-4">Stock Quantity</h2>
            <Bar data={stockChart} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
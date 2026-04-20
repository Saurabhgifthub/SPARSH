import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Sidebar from "../components/Sidebar";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Pill,
  AlertTriangle,
  Clock,
  TrendingUp,
  PlayCircle,
} from "lucide-react";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Dashboard = () => {
  const { medicines, handleProcess, alerts } = useContext(AppContext);

  const total = medicines.length;
  const lowStock = medicines.filter((m) => (m.quantity || 0) < 50).length;
  const expirySoon = medicines.filter((m) => (m.expiry || 0) < 30).length;

  const safeExpiry = medicines.filter((m) => (m.expiry || 0) >= 30).length;
  const warningExpiry = medicines.filter((m) => (m.expiry || 0) >= 7 && (m.expiry || 0) < 30).length;
  const criticalExpiry = medicines.filter((m) => (m.expiry || 0) < 7).length;

  const topMedicines = [...medicines]
    .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
    .slice(0, 8);

  const stockChart = {
    labels: topMedicines.map((m) => m.name),
    datasets: [
      {
        label: "Current Stock",
        data: topMedicines.map((m) => m.quantity || 0),
        backgroundColor: "#2563eb",
        borderColor: "#1e40af",
        borderWidth: 2,
        borderRadius: 12,
      },
    ],
  };

  const expiryChart = {
    labels: ["Safe (≥30 days)", "Warning (7-29 days)", "Critical (<7 days)"],
    datasets: [
      {
        data: [safeExpiry, warningExpiry, criticalExpiry],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderWidth: 4,
        borderColor: "#ffffff",
      },
    ],
  };

  const lowStockAlerts = medicines
    .filter((m) => (m.quantity || 0) < 50)
    .map((m) => `${m.name} is low in stock (${m.quantity || 0})`);

  const expiryAlerts = medicines
    .filter((m) => (m.expiry || 0) < 30)
    .map((m) => `${m.name} expires in ${m.expiry || 0} days`);

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 p-8 w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-5xl font-bold text-slate-800 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Welcome back to S.P.A.R.S.H Hospital Pharmacy
            </p>
          </div>

          <button
            onClick={handleProcess}
            className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
          >
            <PlayCircle size={26} />
            Process Dispensing
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <KpiCard
            title="Total Medicines"
            value={total}
            icon={<Pill size={32} />}
            color="from-blue-500 to-cyan-500"
          />
          <KpiCard
            title="Low Stock"
            value={lowStock}
            icon={<AlertTriangle size={32} />}
            color="from-amber-500 to-orange-500"
            alert={lowStock > 0}
          />
          <KpiCard
            title="Expiry Alerts"
            value={expirySoon}
            icon={<Clock size={32} />}
            color="from-red-500 to-rose-500"
            alert={expirySoon > 0}
          />
        </div>

        {/* Alerts Banner */}
        {(expiryAlerts.length > 0 || lowStockAlerts.length > 0) && (
          <div className="bg-red-50 border border-red-200 p-5 rounded-2xl mb-10">
            <div className="flex items-start gap-4 mb-4">
              <AlertTriangle className="text-red-600 mt-1" size={28} />
              <div>
                <h3 className="font-semibold text-red-700">Active Alerts</h3>
                <p className="text-red-600 text-sm mt-1">
                  Medicines requiring attention
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-red-200">
              {/* Expiry Alerts - Left */}
              <div className="pb-4 md:pb-0 md:pr-6">
                <h4 className="font-semibold text-red-700 mb-3">Expiry Alerts</h4>
                <div className="text-red-600 text-sm space-y-1">
                  {expiryAlerts.length > 0 ? (
                    expiryAlerts.map((alert, i) => <p key={i}>• {alert}</p>)
                  ) : (
                    <p className="text-red-500">No expiry alerts</p>
                  )}
                </div>
              </div>

              {/* Low Stock Alerts - Right */}
              <div className="pt-4 md:pt-0 md:pl-6">
                <h4 className="font-semibold text-red-700 mb-3">Low Stock Alerts</h4>
                <div className="text-red-600 text-sm space-y-1">
                  {lowStockAlerts.length > 0 ? (
                    lowStockAlerts.map((alert, i) => <p key={i}>• {alert}</p>)
                  ) : (
                    <p className="text-red-500">No low stock alerts</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Stock Bar Chart */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <TrendingUp className="text-blue-600" size={28} />
              Top Medicines by Stock
            </h2>
            <div className="h-80">
              <Bar
                data={stockChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>

          {/* Expiry Doughnut */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Expiry Status Overview
            </h2>
            <div className="h-80 flex items-center justify-center">
              <Doughnut
                data={expiryChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { padding: 20, font: { size: 15 } },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8 border-b bg-slate-50">
            <h2 className="text-2xl font-semibold">Current Inventory</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-6 text-left font-semibold text-slate-700">
                    Medicine
                  </th>
                  <th className="p-6 text-left font-semibold text-slate-700">
                    Batch
                  </th>
                  <th className="p-6 text-left font-semibold text-slate-700">
                    Quantity
                  </th>
                  <th className="p-6 text-left font-semibold text-slate-700">
                    Expiry (Days)
                  </th>
                  <th className="p-6 text-left font-semibold text-slate-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50 transition">
                    <td className="p-6 font-medium">{m.name}</td>
                    <td className="p-6 text-slate-600">{m.batch || "-"}</td>
                    <td className="p-6 font-semibold text-lg">{m.quantity}</td>
                    <td className="p-6 text-slate-600">{m.expiry}</td>
                    <td className="p-6">
                      <span
                        className={`px-5 py-2 rounded-full text-sm font-semibold
                        ${
                          (m.expiry || 0) < 7
                            ? "bg-red-100 text-red-700"
                            : (m.expiry || 0) < 30
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {(m.expiry || 0) < 7
                          ? "Critical"
                          : (m.expiry || 0) < 30
                          ? "Expiring Soon"
                          : "Safe"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon, color, alert = false }) => (
  <div
    className={`bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all group ${
      alert ? "ring-2 ring-red-200" : ""
    }`}
  >
    <div
      className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${color} text-white mb-6 group-hover:scale-110 transition`}
    >
      {icon}
    </div>
    <h3 className="text-slate-500 font-medium">{title}</h3>
    <p className="text-5xl font-bold text-slate-800 mt-3">{value}</p>
  </div>
);

export default Dashboard;
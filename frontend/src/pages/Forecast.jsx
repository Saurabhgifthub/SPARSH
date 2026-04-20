import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Sidebar from "../components/Sidebar";

import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

const Forecast = () => {
  const { medicines } = useContext(AppContext);

  // 📊 FORECAST LOGIC
  const forecastData = medicines.map((m) => {
    const usage = Math.max(1, Math.floor(m.quantity / 10));
    const daysLeft = Math.floor(m.quantity / usage);
    return { ...m, usage, daysLeft };
  });

  // 📊 BAR CHART
  const forecastChart = {
    labels: forecastData.map((m) => m.name),
    datasets: [
      {
        label: "Days Left",
        data: forecastData.map((m) => m.daysLeft),
        backgroundColor: "#3b82f6",
        borderRadius: 6,
      },
    ],
  };

  // 📊 PIE LOGIC
  const urgent = forecastData.filter((m) => m.daysLeft < 5).length;
  const soon = forecastData.filter(
    (m) => m.daysLeft < 15 && m.daysLeft >= 5,
  ).length;
  const safe = forecastData.filter((m) => m.daysLeft >= 15).length;

  const urgencyChart = {
    labels: ["Urgent", "Soon", "Safe"],
    datasets: [
      {
        data: [urgent, soon, safe],
        backgroundColor: [
          "red", // red
          "orange", // yellow
          "green", // green
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 p-6 w-full bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Forecast</h1>

        {/* TABLE */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h2 className="text-lg font-semibold mb-3">Consumption Forecast</h2>

          <table className="w-full text-left table-auto">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="p-3">Medicine</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Usage/day</th>
                <th className="p-3">Days Left</th>
              </tr>
            </thead>

            <tbody>
              {forecastData.map((m, i) => (
                <tr
                  key={i}
                  className={`border-b hover:bg-gray-50 ${
                    m.daysLeft < 5
                      ? "bg-red-100"
                      : m.daysLeft < 15
                        ? "bg-yellow-100"
                        : ""
                  }`}
                >
                  <td className="p-3">{m.name}</td>
                  <td className="p-3">{m.quantity}</td>
                  <td className="p-3">{m.usage}</td>
                  <td className="p-3 font-semibold">{m.daysLeft}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GRAPHS */}
        <div className="grid grid-cols-2 gap-6">
          {/* BAR */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-2">Days Left Forecast</h2>
            <Bar
              data={forecastChart}
              options={{
                plugins: { legend: { display: false } },
              }}
            />
          </div>

          {/* PIE */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-2">Urgency Distribution</h2>
            <Pie data={urgencyChart} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecast;
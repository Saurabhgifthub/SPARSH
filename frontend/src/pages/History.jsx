import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { History as HistoryIcon, Trash2 } from "lucide-react";

const History = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:5000/history");
      const result = await res.json();
      setData(result || []);
    } catch (err) {
      console.error(err);
      setData([]);
    }
  };

  // 🗑 DELETE FUNCTION
  const handleDelete = async (index) => {
    if (!window.confirm("Delete this history entry?")) return;

    try {
      await fetch(`http://localhost:5000/delete-history/${index}`, {
        method: "DELETE",
      });

      fetchHistory(); // refresh
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // FILTER LOGIC
  const filteredData = data.filter((item) => {
    const type = (item.Type || "").toLowerCase();

    const typeMatch =
      filter === "all" ||
      (filter === "stock" && type.includes("stock")) ||
      (filter === "dispense" && type.includes("dispense")) ||
      (filter === "manual" && type.includes("manual"));

    if (timeFilter === "all") return typeMatch;

    const itemDate = new Date(item.Timestamp);
    const now = new Date();

    if (timeFilter === "daily") {
      return typeMatch && itemDate.toDateString() === now.toDateString();
    }

    if (timeFilter === "weekly") {
      const diff = (now - itemDate) / (1000 * 60 * 60 * 24);
      return typeMatch && diff <= 7;
    }

    if (timeFilter === "monthly") {
      return (
        typeMatch &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }

    return typeMatch;
  });

  const getBadge = (type) => {
    const t = (type || "").toLowerCase();

    if (t.includes("stock")) return "bg-blue-100 text-blue-600";
    if (t.includes("dispense")) return "bg-red-100 text-red-600";
    if (t.includes("manual")) return "bg-green-100 text-green-600";

    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 p-6 w-full bg-gray-100 min-h-screen">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <HistoryIcon size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold">History</h1>
        </div>

        {/* FILTERS */}
        <div className="flex gap-4 mb-6">
          <select
            className="p-2 border rounded"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="stock">Stock</option>
            <option value="dispense">Dispense</option>
            <option value="manual">Manual</option>
          </select>

          <select
            className="p-2 border rounded"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="daily">Today</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">This Month</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white p-4 rounded-xl shadow">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">File / Medicine</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-500">
                    No history found
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-100">
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full ${getBadge(item.Type)}`}>
                        {item.Type}
                      </span>
                    </td>

                    <td className="p-3">{item.FileName}</td>
                    <td className="p-3">{item.Timestamp}</td>

                    {/* DELETE BUTTON */}
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
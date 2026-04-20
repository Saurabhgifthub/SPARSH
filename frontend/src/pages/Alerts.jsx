import { useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import Sidebar from "../components/Sidebar";
import { Doughnut } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../logo.png";
import { AlertTriangle, Clock, Package, Download, ShieldCheck } from "lucide-react";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const Alerts = () => {
  const { medicines } = useContext(AppContext);

  // Calculations
  const lowStock = useMemo(() => 
    medicines.filter((m) => (m.quantity || 0) < 50), [medicines]);

  const expirySoon = useMemo(() => 
    medicines.filter((m) => (m.expiry || 0) < 30), [medicines]);

  const criticalExpiry = expirySoon.filter((m) => (m.expiry || 0) < 7);
  const warningExpiry = expirySoon.filter((m) => (m.expiry || 0) >= 7);

  const highStock = medicines.filter((m) => (m.quantity || 0) > 100).length;
  const midStock = medicines.filter((m) => (m.quantity || 0) >= 50 && (m.quantity || 0) <= 100).length;
  const lowStockCount = lowStock.length;

  const safeExpiry = medicines.filter((m) => (m.expiry || 0) >= 30).length;

  // Charts Data
  const stockChartData = {
    labels: ["High Stock", "Medium Stock", "Low Stock"],
    datasets: [{
      data: [highStock, midStock, lowStockCount],
      backgroundColor: ["#10b981", "#3b82f6", "#ef4444"],
      borderWidth: 3,
      borderColor: "#ffffff",
    }],
  };

  const expiryChartData = {
    labels: ["Critical ( <7 days)", "Warning (7-29 days)", "Safe (≥30 days)"],
    datasets: [{
      data: [criticalExpiry.length, warningExpiry.length, safeExpiry],
      backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
      borderWidth: 3,
      borderColor: "#ffffff",
    }],
  };

  // Professional PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header with Logo
    doc.addImage(logo, "PNG", 20, 15, 40, 40);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("S.P.A.R.S.H HOSPITAL", 70, 30);

    doc.setFontSize(16);
    doc.text("Pharmacy Alerts Report", 70, 42);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString()}`, 20, 65);

    let y = 85;

    // Summary
    doc.setFontSize(14);
    doc.setTextColor(30, 64, 175);
    doc.text("Summary", 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81);
    doc.text(`Total Medicines          : ${medicines.length}`, 25, y); y += 8;
    doc.text(`Low Stock Items         : ${lowStock.length}`, 25, y); y += 8;
    doc.text(`Expiry Alerts            : ${expirySoon.length}`, 25, y); y += 15;

    // Low Stock Table
    doc.setFontSize(13);
    doc.setTextColor(220, 38, 38);
    doc.text("LOW STOCK MEDICINES (Reorder Required)", 20, y);
    y += 8;

    const lowStockRows = lowStock.map((m, i) => [
      i + 1,
      m.name,
      m.quantity,
      "URGENT REORDER"
    ]);

    autoTable(doc, {
      startY: y,
      head: [["No.", "Medicine Name", "Quantity", "Status"]],
      body: lowStockRows,
      theme: "grid",
      headStyles: { fillColor: [220, 38, 38], textColor: 255 },
      styles: { fontSize: 11 },
    });

    y = doc.lastAutoTable.finalY + 20;

    // Expiry Table
    doc.setFontSize(13);
    doc.setTextColor(245, 158, 11);
    doc.text("EXPIRY MONITORING", 20, y);
    y += 8;

    const expiryRows = expirySoon.map((m, i) => [
      i + 1,
      m.name,
      `${m.expiry} days`,
      m.expiry < 7 ? "CRITICAL" : "WARNING"
    ]);

    autoTable(doc, {
      startY: y,
      head: [["No.", "Medicine Name", "Days Left", "Priority"]],
      body: expiryRows,
      theme: "grid",
      headStyles: { fillColor: [245, 158, 11], textColor: 255 },
      styles: { fontSize: 11 },
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("This is a system-generated report for internal use only.", 20, 280);

    doc.save("SPARSH_Alerts_Report.pdf");
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 p-8 w-full bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-4 rounded-2xl">
              <AlertTriangle className="text-white" size={38} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-800">Alerts Center</h1>
              <p className="text-slate-500 mt-1">Critical stock and expiry notifications</p>
            </div>
          </div>

          <button
            onClick={exportPDF}
            className="flex items-center gap-3 bg-white hover:bg-slate-50 px-8 py-4 rounded-2xl shadow font-semibold transition-all active:scale-95"
          >
            <Download size={22} />
            Export Alerts Report
          </button>
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Low Stock Card */}
          <div className="bg-white rounded-3xl shadow p-8 border-l-8 border-red-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-100 p-3 rounded-xl">
                <Package className="text-red-600" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-600">Low Stock</h2>
                <p className="text-slate-500">Requires immediate reorder</p>
              </div>
            </div>
            <div className="text-5xl font-bold text-red-600 mb-2">{lowStock.length}</div>
            <p className="text-slate-600">medicines below threshold</p>
          </div>

          {/* Expiry Soon Card */}
          <div className="bg-white rounded-3xl shadow p-8 border-l-8 border-amber-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-amber-100 p-3 rounded-xl">
                <Clock className="text-amber-600" size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-amber-600">Expiring Soon</h2>
                <p className="text-slate-500">Within next 30 days</p>
              </div>
            </div>
            <div className="text-5xl font-bold text-amber-600 mb-2">{expirySoon.length}</div>
            <p className="text-slate-600">medicines need attention</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-3xl shadow p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <ShieldCheck className="text-emerald-600" size={26} />
              Stock Status Distribution
            </h2>
            <div className="h-80">
              <Doughnut 
                data={stockChartData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <Clock className="text-amber-600" size={26} />
              Expiry Status Distribution
            </h2>
            <div className="h-80">
              <Doughnut 
                data={expiryChartData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>

        {/* Detailed Alerts List */}
        <div className="bg-white rounded-3xl shadow p-8">
          <h2 className="text-2xl font-semibold mb-6">Detailed Alerts</h2>

          {lowStock.length > 0 && (
            <div className="mb-10">
              <h3 className="text-red-600 font-bold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle size={24} /> Low Stock Medicines
              </h3>
              <div className="space-y-3">
                {lowStock.map((m, i) => (
                  <div key={i} className="flex justify-between items-center bg-red-50 p-5 rounded-2xl">
                    <div className="font-medium">{m.name}</div>
                    <div className="text-red-600 font-semibold">Only {m.quantity} left</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expirySoon.length > 0 && (
            <div>
              <h3 className="text-amber-600 font-bold text-lg mb-4 flex items-center gap-2">
                <Clock size={24} /> Expiry Soon Medicines
              </h3>
              <div className="space-y-3">
                {expirySoon.map((m, i) => (
                  <div key={i} className="flex justify-between items-center bg-amber-50 p-5 rounded-2xl">
                    <div className="font-medium">{m.name}</div>
                    <div className="text-amber-600 font-semibold">{m.expiry} days left</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lowStock.length === 0 && expirySoon.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              No active alerts at the moment. Everything looks good!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
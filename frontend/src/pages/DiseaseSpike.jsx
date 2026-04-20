import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Bar } from "react-chartjs-2";
import {
  Activity, TrendingUp, Download, Loader2,
  AlertTriangle, Package, FileText, Info, Stethoscope, Search, Calendar
} from "lucide-react";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BASE_URL = "http://127.0.0.1:5000";

const BAR_COLORS = [
  "#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#6366f1",
];

const DISEASE_MAP = {
  "Fever": ["paracetamol", "dolo", "crocin"],
  "Pain": ["ibuprofen", "aspirin", "diclofenac"],
  "Bacterial Infection": ["azithromycin", "amoxicillin", "ciprofloxacin"],
  "Diabetes": ["metformin", "insulin", "glimepiride"],
  "Hypertension": ["amlodipine", "telmisartan", "losartan"],
  "Acidity / GERD": ["pantoprazole", "omeprazole"],
  "Cold & Flu": ["phenylephrine", "chlorpheniramine"],
  "Emergency Cardiac": ["epinephrine", "atropine"],
  "Snake Bite": ["antivenom", "polyvalent"],
  "Severe Allergy": ["epipen", "adrenaline"],
  "Seizure Emergency": ["diazepam", "lorazepam"],
  "Rabies Exposure": ["rabipur", "immunoglobulin"],
  "Poisoning": ["activated charcoal"],
  "Severe Hemorrhage": ["tranexamic"],
  "ICU Sedation": ["propofol", "fentanyl"]
};

const formatDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string" || !dateStr.includes("-")) return dateStr;
  const parts = dateStr.split("-");
  return parts.length === 3 && parts[0].length === 4 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
};

const DiseaseSpike = () => {
  const [stockItems, setStockItems] = useState([]);
  const [selectedMed, setSelectedMed] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/inventory`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setStockItems(data);
      if (data.length > 0) setSelectedMed(data[0].Medicine || data[0].medicine || "");
    } catch (err) { setError("Please upload your CSV stock file first."); }
    finally { setLoading(false); }
  };

  // ── Calculation: Disease Coverage ──
  const diseaseStock = {};
  Object.keys(DISEASE_MAP).forEach(d => diseaseStock[d] = 0);
  stockItems.forEach(item => {
    const medName = (item.Medicine || "").toLowerCase();
    const qty = Number(item.Quantity) || 0;
    Object.entries(DISEASE_MAP).forEach(([disease, meds]) => {
      if (meds.some(m => medName.includes(m))) diseaseStock[disease] += qty;
    });
  });
  const allDiseases = Object.entries(diseaseStock).sort((a, b) => b[1] - a[1]);

  // ── Calculation: Medicine Inventory ──
  const medSorted = [...stockItems].sort((a, b) => (Number(b.Quantity) || 0) - (Number(a.Quantity) || 0));

  const totalUnits = stockItems.reduce((a, i) => a + (Number(i.Quantity) || 0), 0);
  const selectedItem = stockItems.find(i => (i.Medicine || i.medicine || "") === selectedMed);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { font: { weight: '700', size: 11 }, color: '#64748b' }, grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } }
    }
  };

  if (loading) return (
    <div className="flex min-h-screen"><Sidebar />
      <div className="ml-64 flex-1 flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={44} />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans tracking-tight">
      <Sidebar />
      <div className="ml-64 flex-1 p-8" style={{ maxWidth: "calc(100vw - 256px)" }}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
              <Activity size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Full Inventory Intelligence</h1>
              <p className="text-sm text-slate-500 font-medium text-lg">Comprehensive Stock & Condition Mapping</p>
            </div>
          </div>
        </div>

        {/* 1. DISEASE COVERAGE CAROUSEL */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm mb-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Stethoscope className="text-emerald-500" size={20} /> Disease Preparedness
              </h2>
              <p className="text-slate-400 font-medium">Scroll horizontally to see all mapped conditions</p>
            </div>
            <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold border border-red-100">
              {allDiseases.filter(d => d[1] === 0).length} Critical Gaps Detected
            </div>
          </div>
          
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div style={{ minWidth: `${allDiseases.length * 100}px`, height: "350px" }}>
              <Bar 
                data={{
                  labels: allDiseases.map(d => d[0]),
                  datasets: [{
                    data: allDiseases.map(d => d[1]),
                    backgroundColor: allDiseases.map(d => d[1] === 0 ? "#ef4444" : "#10b981"),
                    borderRadius: 6,
                    barThickness: 40
                  }]
                }} 
                options={chartOptions} 
              />
            </div>
          </div>
        </div>

        {/* 2. MEDICINE INVENTORY CAROUSEL */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Package className="text-blue-500" size={20} /> Medicine Stock Levels
            </h2>
            <p className="text-slate-400 font-medium">Every individual medicine found in your inventory</p>
          </div>
          
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div style={{ minWidth: `${medSorted.length * 80}px`, height: "350px" }}>
              <Bar 
                data={{
                  labels: medSorted.map(i => i.Medicine || "Unknown"),
                  datasets: [{
                    data: medSorted.map(i => Number(i.Quantity) || 0),
                    backgroundColor: medSorted.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
                    borderRadius: 6,
                    barThickness: 35
                  }]
                }} 
                options={chartOptions} 
              />
            </div>
          </div>
        </div>

        {/* 3. MEDICINE DETAIL INSPECTOR */}
        <div className="bg-white rounded-[32px] border border-slate-100 p-10 shadow-xl shadow-slate-200/50 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-2">
                <Search size={28} className="text-blue-600" /> Inspector
              </h2>
            </div>
            <select 
              value={selectedMed} 
              onChange={e => setSelectedMed(e.target.value)}
              className="min-w-[320px] bg-slate-50 border-2 border-slate-100 text-slate-900 font-bold text-xl py-4 px-6 rounded-2xl focus:border-blue-500 outline-none"
            >
              {stockItems.map((item, i) => (<option key={i} value={item.Medicine}>{item.Medicine}</option>))}
            </select>
          </div>

          {selectedItem && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-3xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-slate-900/10">
                <div className="text-center md:text-left text-white">
                  <span className="text-blue-300 font-bold text-sm uppercase mb-2 block">Medication Name</span>
                  <h3 className="text-3xl md:text-5xl font-black">{selectedItem.Medicine}</h3>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-8 py-5 rounded-2xl border border-white/10 text-center min-w-[200px]">
                  <p className="text-blue-200 font-bold text-sm uppercase mb-1">Current Stock</p>
                  <p className="text-5xl font-black text-white">{selectedItem.Quantity} <span className="text-xl font-medium opacity-60">units</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(selectedItem)
                  .filter(([k]) => !["id", "_id", "Medicine", "Quantity"].includes(k))
                  .map(([key, val], i) => {
                    const isDate = key.toLowerCase().includes("date") || key.toLowerCase().includes("expiry");
                    return (
                      <div key={i} className="group bg-slate-50 hover:bg-white hover:shadow-lg transition-all p-8 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          {isDate ? <Calendar size={16} className="text-blue-500" /> : <Info size={16} className="text-slate-400" />}
                          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{key.replace(/_/g, ' ')}</p>
                        </div>
                        <p className="text-2xl font-black text-slate-800 break-words">{isDate ? formatDate(String(val)) : String(val || '—')}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default DiseaseSpike;
import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  Loader2, Brain, CheckCircle, AlertCircle,
  XCircle, MessageSquare, Send, Sparkles,
  BarChart3, RefreshCcw
} from "lucide-react";

const BASE_URL = "http://localhost:5000";

const AIAnalysis = () => {
  const [inventory, setInventory] = useState([]);
  const [analysis, setAnalysis] = useState("");
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/inventory`);
      setInventory(res.data || []);
    } catch (err) {
      console.error("Inventory error:", err);
    }
  };

  // ================= SCORE =================
  const calculateScore = () => {
    if (!inventory.length) return 0;

    const total = inventory.length;

    const low = inventory.filter(i => (Number(i.Quantity) || 0) < 10).length;

    const expiry = inventory.filter(i => {
      const d = i.Expiry_Date;
      if (!d) return false;
      const days = (new Date(d) - new Date()) / 86400000;
      return days > 0 && days < 45;
    }).length;

    const penalty = ((low / total) * 60) + ((expiry / total) * 40);
    return Math.max(0, Math.round(100 - penalty));
  };

  const score = calculateScore();

  const getTheme = () => {
    if (score > 80)
      return { color: "text-emerald-600", bg: "bg-emerald-50", label: "Optimal", icon: <CheckCircle className="text-emerald-500" /> };
    if (score > 50)
      return { color: "text-amber-600", bg: "bg-amber-50", label: "At Risk", icon: <AlertCircle className="text-amber-500" /> };
    return { color: "text-red-600", bg: "bg-red-50", label: "Critical", icon: <XCircle className="text-red-500" /> };
  };

  const theme = getTheme();

  // ================= AI REPORT =================
  const generateAIReport = async () => {
    if (!inventory.length) return;

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/ai-analysis`, {
        inventory_context: inventory
      });

      setAnalysis(res.data.analysis || "No response from AI.");
    } catch (err) {
      setAnalysis("⚠️ AI failed. Check backend or API key.");
    } finally {
      setLoading(false);
    }
  };

  // ================= AI CHAT =================
  const askAI = async () => {
    if (!question.trim()) return;

    setChatLoading(true);
    setAiAnswer("");

    try {
      const res = await axios.post(`${BASE_URL}/medicine-chat`, {
        question,
        inventory_context: inventory
      });

      setAiAnswer(res.data.answer || "No answer.");
    } catch (err) {
      setAiAnswer("⚠️ AI communication error.");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar />

      <div className="ml-64 p-10 w-full max-w-[1400px] mx-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-10">
          <div className="flex gap-4 items-center">
            <div className="bg-blue-600 p-3 rounded-xl shadow">
              <Brain className="text-white" size={30} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Analytics Command</h1>
              <p className="text-gray-500">Groq-powered inventory intelligence</p>
            </div>
          </div>

          <button onClick={fetchInventory} className="flex gap-2 items-center text-gray-600">
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>

        {/* SCORE */}
        <div className={`p-6 rounded-xl mb-8 ${theme.bg}`}>
          <div className="flex items-center gap-3 mb-2">
            {theme.icon}
            <span className="font-bold">{theme.label}</span>
          </div>
          <h2 className={`text-5xl font-bold ${theme.color}`}>{score}/100</h2>
        </div>

        {/* AI REPORT */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <div className="flex justify-between mb-4">
            <h2 className="font-bold text-lg flex gap-2 items-center">
              <BarChart3 /> AI Audit
            </h2>

            <button
              onClick={generateAIReport}
              className="bg-black text-white px-4 py-2 rounded flex gap-2 items-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              Run Audit
            </button>
          </div>

          {/* 🔥 IMPROVED AI OUTPUT UI */}
          <div className="bg-gray-50 p-6 rounded-xl min-h-[180px] border border-gray-100">
            {analysis ? (
              <div className="space-y-4 text-gray-700 leading-relaxed">

                {analysis.split("\n").map((line, index) => {
                  const trimmed = line.trim();

                  if (!trimmed) return null;

                  // HEADINGS
                  if (
                    trimmed.toLowerCase().includes("critical") ||
                    trimmed.toLowerCase().includes("expiry") ||
                    trimmed.toLowerCase().includes("restock") ||
                    trimmed.endsWith(":")
                  ) {
                    return (
                      <h3
                        key={index}
                        className="text-lg font-bold text-slate-900 mt-4 mb-2 border-l-4 border-blue-500 pl-3"
                      >
                        {trimmed}
                      </h3>
                    );
                  }

                  // BULLETS
                  if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
                    return (
                      <div key={index} className="flex items-start gap-2 pl-4">
                        <span className="text-blue-500 mt-1">•</span>
                        <p>{trimmed.replace(/^[-•]\s*/, "")}</p>
                      </div>
                    );
                  }

                  // NORMAL TEXT
                  return (
                    <p key={index} className="text-gray-600">
                      {trimmed}
                    </p>
                  );
                })}

              </div>
            ) : (
              <div className="text-center text-gray-400 py-10">
                <p className="font-semibold">No AI Report Generated</p>
                <p className="text-sm">Click "Run Audit" to analyze inventory</p>
              </div>
            )}
          </div>
        </div>

        {/* CHAT */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-bold text-lg mb-4 flex gap-2 items-center">
            <MessageSquare /> Chat Assistant
          </h2>

          <div className="flex gap-3">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 border p-3 rounded"
              placeholder="Ask about inventory..."
            />

            <button
              onClick={askAI}
              className="bg-purple-600 text-white px-6 rounded flex items-center gap-2"
            >
              {chatLoading ? <Loader2 className="animate-spin" /> : <Send />}
              Send
            </button>
          </div>

          {aiAnswer && (
            <div className="mt-4 bg-black text-white p-4 rounded">
              {aiAnswer}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AIAnalysis;
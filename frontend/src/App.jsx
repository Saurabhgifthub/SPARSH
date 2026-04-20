import { HashRouter as Router, Routes, Route } from "react-router-dom";
import AIAnalysis from "./pages/AIAnalysis";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Upload from "./pages/Upload";
import Alerts from "./pages/Alerts";
import Forecast from "./pages/Forecast";
import AddMedicine from "./pages/AddMedicine";
import History from "./pages/History";
import DiseaseSpike from "./pages/DiseaseSpike";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ai-analysis" element={<AIAnalysis />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/add" element={<AddMedicine />} />
        <Route path="/history" element={<History />} />
        <Route path="/disease-spike" element={<DiseaseSpike />} />
      </Routes>
    </Router>
  );
};

export default App;
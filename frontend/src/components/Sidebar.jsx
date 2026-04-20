import logo from "../assets/logo.png";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  Upload,
  AlertTriangle,
  TrendingUp,
  History,
  Brain,
  Activity,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const menu = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: <Boxes size={20} />,
    },
    {
      name: "Upload",
      path: "/upload",
      icon: <Upload size={20} />,
    },
    {
      name: "Alerts",
      path: "/alerts",
      icon: <AlertTriangle size={20} />,
    },
    {
      name: "Forecast",
      path: "/forecast",
      icon: <TrendingUp size={20} />,
    },
    {
      name: "Disease Spike",
      path: "/disease-spike",
      icon: <Activity size={20} />,
    },
    {
      name: "AI Analysis",
      path: "/ai-analysis",
      icon: <Brain size={20} />,
    },
    {
      name: "History",
      path: "/history",
      icon: <History size={20} />,
    },
  ];

  return (
    <div className="w-72 h-screen bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 
                    text-white p-6 fixed shadow-2xl flex flex-col border-r border-blue-600/30">
      
      {/* Logo / Title Section */}
      <div className="flex items-center gap-5 mb-12">
        <div className="w-16 h-16 flex-shrink-0">
          <img
            src={logo}
            alt="SPARSH Logo"
            className="w-full h-full object-contain rounded-2xl"
          />
        </div>
        
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">S.P.A.R.S.H</h1>
          <p className="text-blue-200 text-xs leading-tight mt-1">
            Smart Predictive Analytics for Reliable Supply in<br />
            Healthcare
          </p>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 flex flex-col gap-2">
        {menu.map((item, index) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={index}
              to={item.path}
              className={`group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-medium
                ${
                  isActive
                    ? "bg-white text-blue-900 shadow-lg shadow-blue-950/50 font-semibold scale-[1.02]"
                    : "hover:bg-white/10 hover:text-white active:scale-[0.98]"
                }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                {item.icon}
              </div>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="pt-8 mt-auto border-t border-white/10">
        <div className="flex items-center justify-between text-xs opacity-60">
          <div>© 2026 SPARSH</div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
import { Link, Outlet, useLocation } from "react-router-dom";
import { Shield, Upload, Search, LayoutDashboard, History } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Shield },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/scan", label: "Scan", icon: Search },
  { to: "/history", label: "History", icon: History },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-200">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-3xl">
        <div className="container mx-auto flex items-center justify-between h-20 px-6">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="h-10 w-10 rounded-xl bg-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(8,145,178,0.3)] group-hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] transition-all duration-500">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-white uppercase leading-none italic">Media <span className="text-cyan-500">Guardian</span></span>
                <span className="text-[8px] font-black tracking-[0.3em] text-slate-500 uppercase mt-1">Attribution Intel</span>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
                  location.pathname === to
                    ? "bg-cyan-500 text-white shadow-2xl shadow-cyan-500/20"
                    : "text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/5"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-white/5 py-10 bg-[#030712]/40">
        <div className="container mx-auto px-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 opacity-30 grayscale pointer-events-none">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronized with</span>
            <span className="text-xs font-bold font-mono">GOOGLE_CLOUD_PLATEFORM</span>
          </div>
          <p className="text-[10px] font-black tracking-widest text-slate-600 uppercase">© 2026 Media Guardian Protocol &bull; Intelligence Engine</p>
        </div>
      </footer>
    </div>
  );
}

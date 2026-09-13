import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  FolderKanban,
  Layers, 
  Building2, 
  MapPin, 
  AlertTriangle, 
  Activity, 
  Database
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow">
              P
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white">PAIMANA-INTEL</span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-blue-400 border border-slate-700">
                GOV DECISION SUPPORT
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            <NavLink to="/" className={navLinkClass}>
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Home</span>
            </NavLink>

            <NavLink to="/projects" className={navLinkClass}>
              <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
              <span>Projects</span>
            </NavLink>

            <NavLink to="/sectors" className={navLinkClass}>
              <Layers className="w-3.5 h-3.5" />
              <span>Sectors</span>
            </NavLink>

            <NavLink to="/ministries" className={navLinkClass}>
              <Building2 className="w-3.5 h-3.5" />
              <span>Ministries</span>
            </NavLink>

            <NavLink to="/states" className={navLinkClass}>
              <MapPin className="w-3.5 h-3.5" />
              <span>States</span>
            </NavLink>

            <NavLink to="/early-warning" className={navLinkClass}>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Early Warning</span>
            </NavLink>

            <NavLink to="/operations" className={navLinkClass}>
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Operations</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </NavLink>
          </nav>

          {/* Data Freshness Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-4">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cycle: <strong className="text-slate-200">Jul 2026</strong></span>
          </div>

        </div>
      </div>
    </header>
  );
};

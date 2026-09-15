import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  FolderKanban,
  Layers, 
  Building2, 
  MapPin, 
  AlertTriangle, 
  Activity, 
  Database,
  BookOpen,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { api } from '../../services/api';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportingCycle, setReportingCycle] = useState<string>('Live Canonical');
  const [exploreOpen, setExploreOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api.getHomeSummary()
      .then(res => {
        if (res?.latestReportingPeriod) {
          setReportingCycle(res.latestReportingPeriod);
        }
      })
      .catch(() => {
        // Fallback gracefully
      });
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setExploreOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all ${
      isActive
        ? 'bg-[#1877C9] text-white shadow-xs'
        : 'text-slate-200 hover:text-white hover:bg-[#123B63]'
    }`;

  const isExploreActive = ['/projects', '/sectors', '/ministries', '/states'].some(p => 
    location.pathname === p || (p === '/projects' && location.pathname.startsWith('/projects') && location.pathname !== '/projects')
  );

  return (
    <nav className="sticky top-0 z-50 bg-[#0B2945] border-b border-[#123B63] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13">
          
          {/* Left: Primary Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            {/* Overview / Home */}
            <NavLink to="/" end className={navLinkClass}>
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Overview</span>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              
              {/* Explore Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setExploreOpen(!exploreOpen)}
                  onMouseEnter={() => setExploreOpen(true)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all ${
                    isExploreActive
                      ? 'bg-[#123B63] text-white ring-1 ring-[#1877C9]'
                      : 'text-slate-200 hover:text-white hover:bg-[#123B63]'
                  }`}
                >
                  <FolderKanban className="w-3.5 h-3.5 text-blue-300" />
                  <span>Explore Portfolio</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
                </button>

                {exploreOpen && (
                  <div 
                    onMouseLeave={() => setExploreOpen(false)}
                    className="absolute left-0 mt-1 w-52 bg-[#0B2945] border border-[#123B63] rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <NavLink
                      to="/projects"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 text-xs font-medium ${
                          isActive ? 'bg-[#1877C9] text-white' : 'text-slate-200 hover:bg-[#123B63] hover:text-white'
                        }`
                      }
                    >
                      <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
                      <div>
                        <div className="font-semibold">All Projects</div>
                        <div className="text-[10px] text-slate-300">Multi-attribute query engine</div>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/sectors"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 text-xs font-medium ${
                          isActive ? 'bg-[#1877C9] text-white' : 'text-slate-200 hover:bg-[#123B63] hover:text-white'
                        }`
                      }
                    >
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <div>
                        <div className="font-semibold">Sectors</div>
                        <div className="text-[10px] text-slate-300">12 Infrastructure sectors</div>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/ministries"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 text-xs font-medium ${
                          isActive ? 'bg-[#1877C9] text-white' : 'text-slate-200 hover:bg-[#123B63] hover:text-white'
                        }`
                      }
                    >
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      <div>
                        <div className="font-semibold">Ministries & Agencies</div>
                        <div className="text-[10px] text-slate-300">Line ministries & PSUs</div>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/states"
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 text-xs font-medium ${
                          isActive ? 'bg-[#1877C9] text-white' : 'text-slate-200 hover:bg-[#123B63] hover:text-white'
                        }`
                      }
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <div className="font-semibold">States & UTs</div>
                        <div className="text-[10px] text-slate-300">Geographic investments</div>
                      </div>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Intelligence Section */}
              <NavLink to="/early-warning" className={navLinkClass}>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Early Warning Center</span>
              </NavLink>

              {/* Operations */}
              <NavLink to="/operations" className={navLinkClass}>
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Operations</span>
              </NavLink>

              {/* Technical Methodology */}
              <NavLink to="/methodology" className={navLinkClass}>
                <BookOpen className="w-3.5 h-3.5 text-sky-300" />
                <span>Methodology</span>
              </NavLink>

            </div>
          </div>

          {/* Right: Dynamic Reporting Cycle & System Health */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#123B63]/70 px-3 py-1.5 rounded-full border border-slate-700/60">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px]">Reporting Cycle:</span>
              <strong className="text-white font-semibold">{reportingCycle}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-medium">System Online</span>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-[#123B63]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B2945] border-t border-[#123B63] px-4 pt-2 pb-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
            Navigation
          </div>
          <NavLink to="/" end className={navLinkClass}>
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/projects" className={navLinkClass}>
            <FolderKanban className="w-4 h-4 text-blue-400" />
            <span>All Projects</span>
          </NavLink>
          <NavLink to="/sectors" className={navLinkClass}>
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Sector Analytics</span>
          </NavLink>
          <NavLink to="/ministries" className={navLinkClass}>
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>Ministry Analytics</span>
          </NavLink>
          <NavLink to="/states" className={navLinkClass}>
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>State Analytics</span>
          </NavLink>
          <NavLink to="/early-warning" className={navLinkClass}>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Early Warning Center</span>
          </NavLink>
          <NavLink to="/operations" className={navLinkClass}>
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Operations</span>
          </NavLink>
          <NavLink to="/methodology" className={navLinkClass}>
            <BookOpen className="w-4 h-4 text-sky-300" />
            <span>Technical Methodology</span>
          </NavLink>

          <div className="pt-3 border-t border-[#123B63] mt-2 text-xs text-slate-300 flex items-center justify-between px-3">
            <span>Reporting Cycle:</span>
            <span className="font-semibold text-white">{reportingCycle}</span>
          </div>
        </div>
      )}
    </nav>
  );
};

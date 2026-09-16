import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  FolderKanban,
  Layers, 
  Building2, 
  MapPin, 
  AlertTriangle, 
  Database,
  BookOpen,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setExploreOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all ${
      isActive
        ? 'bg-[#267A69] text-white shadow-xs'
        : 'text-[#E8F0EC] hover:text-white hover:bg-[#1E5246]'
    }`;

  const isExploreActive = ['/projects', '/sectors', '/ministries', '/states'].some(p => 
    location.pathname === p || (p === '/projects' && location.pathname.startsWith('/projects') && location.pathname !== '/projects')
  );

  return (
    <nav className="sticky top-0 z-50 bg-[#173F35] border-b border-[#1F4E42] shadow-sm">
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
              
              {/* Explore Portfolio Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setExploreOpen(!exploreOpen)}
                  onMouseEnter={() => setExploreOpen(true)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all ${
                    isExploreActive
                      ? 'bg-[#1E5246] text-white ring-1 ring-[#267A69]'
                      : 'text-[#E8F0EC] hover:text-white hover:bg-[#1E5246]'
                  }`}
                >
                  <FolderKanban className="w-3.5 h-3.5 text-[#C89432]" />
                  <span>Explore Portfolio</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
                </button>

                {exploreOpen && (
                  <div 
                    onMouseLeave={() => setExploreOpen(false)}
                    className="absolute left-0 mt-1 w-56 bg-[#173F35] border border-[#1F4E42] rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <NavLink
                      to="/projects"
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium ${
                          isActive ? 'bg-[#267A69] text-white' : 'text-[#E8F0EC] hover:bg-[#1E5246] hover:text-white'
                        }`
                      }
                    >
                      <FolderKanban className="w-3.5 h-3.5 text-[#C89432]" />
                      <div>
                        <div className="font-semibold">Central Projects</div>
                        <div className="text-[10px] text-[#A3B8B0]">Multi-attribute query engine</div>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/sectors"
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium ${
                          isActive ? 'bg-[#267A69] text-white' : 'text-[#E8F0EC] hover:bg-[#1E5246] hover:text-white'
                        }`
                      }
                    >
                      <Layers className="w-3.5 h-3.5 text-[#6BB8A6]" />
                      <div>
                        <div className="font-semibold">Sector Intelligence</div>
                        <div className="text-[10px] text-[#A3B8B0]">12 Infrastructure sectors</div>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/ministries"
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium ${
                          isActive ? 'bg-[#267A69] text-white' : 'text-[#E8F0EC] hover:bg-[#1E5246] hover:text-white'
                        }`
                      }
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#E5B8B2]" />
                      <div>
                        <div className="font-semibold">Ministries & Agencies</div>
                        <div className="text-[10px] text-[#A3B8B0]">Implementing line ministries</div>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/states"
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium ${
                          isActive ? 'bg-[#267A69] text-white' : 'text-[#E8F0EC] hover:bg-[#1E5246] hover:text-white'
                        }`
                      }
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#DFCBB0]" />
                      <div>
                        <div className="font-semibold">States & UTs</div>
                        <div className="text-[10px] text-[#A3B8B0]">Geographic density & clusters</div>
                      </div>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Intelligence Section */}
              <NavLink to="/early-warning" className={navLinkClass}>
                <AlertTriangle className="w-3.5 h-3.5 text-[#C89432]" />
                <span>Early Warning Center</span>
              </NavLink>

              {/* Operations */}
              <NavLink to="/operations" className={navLinkClass}>
                <Database className="w-3.5 h-3.5 text-[#6BB8A6]" />
                <span>Operations</span>
              </NavLink>

              {/* Technical Methodology */}
              <NavLink to="/methodology" className={navLinkClass}>
                <BookOpen className="w-3.5 h-3.5 text-[#DFCBB0]" />
                <span>Methodology</span>
              </NavLink>

            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-[#E8F0EC] hover:text-white hover:bg-[#1E5246]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#173F35] border-t border-[#1F4E42] px-4 pt-2 pb-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-[10px] font-bold text-[#A3B8B0] uppercase tracking-wider px-3 py-1">
            National Portals
          </div>
          <NavLink to="/" end className={navLinkClass}>
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/projects" className={navLinkClass}>
            <FolderKanban className="w-4 h-4 text-[#C89432]" />
            <span>Central Projects Registry</span>
          </NavLink>
          <NavLink to="/sectors" className={navLinkClass}>
            <Layers className="w-4 h-4 text-[#6BB8A6]" />
            <span>Sector Intelligence</span>
          </NavLink>
          <NavLink to="/ministries" className={navLinkClass}>
            <Building2 className="w-4 h-4 text-[#E5B8B2]" />
            <span>Ministry Analytics</span>
          </NavLink>
          <NavLink to="/states" className={navLinkClass}>
            <MapPin className="w-4 h-4 text-[#DFCBB0]" />
            <span>State Analytics</span>
          </NavLink>
          <NavLink to="/early-warning" className={navLinkClass}>
            <AlertTriangle className="w-4 h-4 text-[#C89432]" />
            <span>Early Warning & Intervention</span>
          </NavLink>
          <NavLink to="/operations" className={navLinkClass}>
            <Database className="w-4 h-4 text-[#6BB8A6]" />
            <span>Operations & MLOps</span>
          </NavLink>
          <NavLink to="/methodology" className={navLinkClass}>
            <BookOpen className="w-4 h-4 text-[#DFCBB0]" />
            <span>Technical Methodology</span>
          </NavLink>
        </div>
      )}
    </nav>
  );
};

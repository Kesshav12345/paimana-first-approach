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

  // Auto-close explore dropdown on scroll or click outside
  useEffect(() => {
    if (!exploreOpen) return;

    const handleScroll = () => {
      setExploreOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest('#explore-portfolio-container')) {
        setExploreOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exploreOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-xs text-sm font-bold tracking-wide transition-all ${
      isActive
        ? 'bg-[#EBF6FA] text-[#123F63] border-b-2 border-[#187A9E]'
        : 'text-[#25313B] hover:text-[#187A9E] hover:bg-[#F6F7F8]'
    }`;

  const isExploreActive = ['/projects', '/sectors', '/ministries', '/states'].some(p => 
    location.pathname === p || (p === '/projects' && location.pathname.startsWith('/projects') && location.pathname !== '/projects')
  );

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#D9E0E5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-15">
          
          {/* Primary Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            
            {/* Overview / Home */}
            <NavLink to="/" end className={navLinkClass}>
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              
              {/* Explore Portfolio Dropdown */}
              <div id="explore-portfolio-container" className="relative">
                <button
                  type="button"
                  onClick={() => setExploreOpen(!exploreOpen)}
                  onMouseEnter={() => setExploreOpen(true)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xs text-sm font-bold tracking-wide transition-all cursor-pointer ${
                    isExploreActive
                      ? 'bg-[#EBF6FA] text-[#123F63] border-b-2 border-[#187A9E]'
                      : 'text-[#25313B] hover:text-[#187A9E] hover:bg-[#F6F7F8]'
                  }`}
                >
                  <FolderKanban className="w-4 h-4 text-[#66737D]" />
                  <span>Explore Portfolio</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
                </button>

                {exploreOpen && (
                  <div 
                    onMouseLeave={() => setExploreOpen(false)}
                    className="absolute left-0 mt-1 w-72 bg-white border border-[#D9E0E5] rounded-xs shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <NavLink
                      to="/projects"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-b border-[#D9E0E5]/40 transition-colors ${
                          isActive ? 'bg-[#EBF6FA] text-[#123F63]' : 'text-[#25313B] hover:bg-[#F6F7F8] hover:text-[#187A9E]'
                        }`
                      }
                    >
                      <FolderKanban className="w-4 h-4 text-[#187A9E]" />
                      <div>
                        <div className="font-bold text-sm">Central Projects</div>
                        <div className="text-xs text-[#66737D]">Multi-attribute query engine</div>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/sectors"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-b border-[#D9E0E5]/40 transition-colors ${
                          isActive ? 'bg-[#EBF6FA] text-[#123F63]' : 'text-[#25313B] hover:bg-[#F6F7F8] hover:text-[#187A9E]'
                        }`
                      }
                    >
                      <Layers className="w-4 h-4 text-[#187A9E]" />
                      <div>
                        <div className="font-bold text-sm">Sector Intelligence</div>
                        <div className="text-xs text-[#66737D]">12 Infrastructure sectors</div>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/ministries"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-b border-[#D9E0E5]/40 transition-colors ${
                          isActive ? 'bg-[#EBF6FA] text-[#123F63]' : 'text-[#25313B] hover:bg-[#F6F7F8] hover:text-[#187A9E]'
                        }`
                      }
                    >
                      <Building2 className="w-4 h-4 text-[#187A9E]" />
                      <div>
                        <div className="font-bold text-sm">Ministries &amp; Agencies</div>
                        <div className="text-xs text-[#66737D]">Implementing line ministries</div>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/states"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                          isActive ? 'bg-[#EBF6FA] text-[#123F63]' : 'text-[#25313B] hover:bg-[#F6F7F8] hover:text-[#187A9E]'
                        }`
                      }
                    >
                      <MapPin className="w-4 h-4 text-[#187A9E]" />
                      <div>
                        <div className="font-bold text-sm">States &amp; UTs</div>
                        <div className="text-xs text-[#66737D]">Geographic density &amp; clusters</div>
                      </div>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Intelligence Section */}
              <NavLink to="/early-warning" className={navLinkClass}>
                <AlertTriangle className="w-4 h-4 text-[#B94A45]" />
                <span>Early Warning Center</span>
              </NavLink>

              {/* Operations */}
              <NavLink to="/operations" className={navLinkClass}>
                <Database className="w-4 h-4" />
                <span>Operations</span>
              </NavLink>

              {/* Technical Methodology */}
              <NavLink to="/methodology" className={navLinkClass}>
                <BookOpen className="w-4 h-4" />
                <span>Methodology</span>
              </NavLink>

            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xs text-[#25313B] hover:text-[#187A9E] hover:bg-[#F6F7F8]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#D9E0E5] px-4 pt-3 pb-5 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-xs font-bold text-[#66737D] uppercase tracking-wider px-3 py-1">
            National Infrastructure Portals
          </div>
          <NavLink to="/" end className={navLinkClass}>
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/projects" className={navLinkClass}>
            <FolderKanban className="w-4 h-4 text-[#187A9E]" />
            <span>Central Projects Registry</span>
          </NavLink>
          <NavLink to="/sectors" className={navLinkClass}>
            <Layers className="w-4 h-4 text-[#187A9E]" />
            <span>Sector Intelligence</span>
          </NavLink>
          <NavLink to="/ministries" className={navLinkClass}>
            <Building2 className="w-4 h-4 text-[#187A9E]" />
            <span>Ministry Analytics</span>
          </NavLink>
          <NavLink to="/states" className={navLinkClass}>
            <MapPin className="w-4 h-4 text-[#187A9E]" />
            <span>State Analytics</span>
          </NavLink>
          <NavLink to="/early-warning" className={navLinkClass}>
            <AlertTriangle className="w-4 h-4 text-[#B94A45]" />
            <span>Early Warning Center</span>
          </NavLink>
          <NavLink to="/operations" className={navLinkClass}>
            <Database className="w-4 h-4" />
            <span>Operations &amp; MLOps</span>
          </NavLink>
          <NavLink to="/methodology" className={navLinkClass}>
            <BookOpen className="w-4 h-4" />
            <span>Technical Methodology</span>
          </NavLink>
        </div>
      )}
    </nav>
  );
};

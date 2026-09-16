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
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Lock,
  UserCog
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const location = useLocation();
  const { role, user, setIsAuthModalOpen } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setExploreOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all ${
      isActive
        ? 'bg-[#1BA0E2] text-white shadow-xs'
        : 'text-[#E1EFF9] hover:text-white hover:bg-[#104470]'
    }`;

  const isExploreActive = ['/projects', '/sectors', '/ministries', '/states'].some(p => 
    location.pathname === p || (p === '/projects' && location.pathname.startsWith('/projects') && location.pathname !== '/projects')
  );

  return (
    <nav className="sticky top-0 z-50 bg-[#0A365C] border-b border-[#072540] shadow-sm">
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
                      ? 'bg-[#104470] text-white ring-1 ring-[#1BA0E2]'
                      : 'text-[#E1EFF9] hover:text-white hover:bg-[#104470]'
                  }`}
                >
                  <FolderKanban className="w-3.5 h-3.5 text-[#90C3E8]" />
                  <span>Explore Portfolio</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
                </button>

                {exploreOpen && (
                  <div 
                    onMouseLeave={() => setExploreOpen(false)}
                    className="absolute left-0 mt-1 w-60 bg-[#0A365C] border-2 border-[#1B5285] rounded-lg shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <NavLink
                      to="/projects"
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium ${
                          isActive ? 'bg-[#1BA0E2] text-white' : 'text-[#E1EFF9] hover:bg-[#104470] hover:text-white'
                        }`
                      }
                    >
                      <FolderKanban className="w-3.5 h-3.5 text-[#90C3E8]" />
                      <div>
                        <div className="font-semibold">Central Projects</div>
                        <div className="text-[10px] text-[#90C3E8]">Multi-attribute query engine</div>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/sectors"
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium ${
                          isActive ? 'bg-[#1BA0E2] text-white' : 'text-[#E1EFF9] hover:bg-[#104470] hover:text-white'
                        }`
                      }
                    >
                      <Layers className="w-3.5 h-3.5 text-[#90C3E8]" />
                      <div>
                        <div className="font-semibold">Sector Intelligence</div>
                        <div className="text-[10px] text-[#90C3E8]">12 Infrastructure sectors</div>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/ministries"
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium ${
                          isActive ? 'bg-[#1BA0E2] text-white' : 'text-[#E1EFF9] hover:bg-[#104470] hover:text-white'
                        }`
                      }
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#90C3E8]" />
                      <div>
                        <div className="font-semibold">Ministries &amp; Agencies</div>
                        <div className="text-[10px] text-[#90C3E8]">Implementing line ministries</div>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/states"
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium ${
                          isActive ? 'bg-[#1BA0E2] text-white' : 'text-[#E1EFF9] hover:bg-[#104470] hover:text-white'
                        }`
                      }
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#90C3E8]" />
                      <div>
                        <div className="font-semibold">States &amp; UTs</div>
                        <div className="text-[10px] text-[#90C3E8]">Geographic density &amp; clusters</div>
                      </div>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Intelligence Section */}
              <NavLink to="/early-warning" className={navLinkClass}>
                <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Early Warning Center</span>
              </NavLink>

              {/* Operations */}
              <NavLink to="/operations" className={navLinkClass}>
                <Database className="w-3.5 h-3.5 text-[#90C3E8]" />
                <span>Operations</span>
              </NavLink>

              {/* Technical Methodology */}
              <NavLink to="/methodology" className={navLinkClass}>
                <BookOpen className="w-3.5 h-3.5 text-[#90C3E8]" />
                <span>Methodology</span>
              </NavLink>

            </div>
          </div>

          {/* Right: Government Role Badge & Persona Switcher */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#072540] border border-[#1B5285] hover:border-[#1BA0E2] hover:bg-[#104470] transition-all cursor-pointer group"
              title="Click to switch Role or Sign In (Jan Parichay SSO)"
            >
              <div className="w-2 h-2 rounded-full bg-[#1BA0E2] animate-pulse" />
              <div className="flex items-center gap-1.5">
                {role === 'ADMIN' && <Lock className="w-3.5 h-3.5 text-red-400" />}
                {role === 'NODAL_OFFICER' && <ShieldCheck className="w-3.5 h-3.5 text-[#1BA0E2]" />}
                {role === 'PUBLIC' && <UserCheck className="w-3.5 h-3.5 text-[#90C3E8]" />}
                <span className="text-xs font-semibold text-white tracking-wide">
                  {role === 'ADMIN' ? 'Admin DG' : role === 'NODAL_OFFICER' ? 'Nodal Officer' : 'Citizen / Public'}
                </span>
              </div>
              <span className="text-[10px] bg-[#1BA0E2]/25 border border-[#1BA0E2]/40 text-[#90C3E8] px-1.5 py-0.2 rounded font-medium group-hover:bg-[#1BA0E2] group-hover:text-white transition-colors">
                Switch
              </span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="p-1.5 rounded-md bg-[#072540] border border-[#1B5285] text-white text-xs flex items-center gap-1"
            >
              <UserCog className="w-4 h-4 text-[#1BA0E2]" />
              <span className="text-[10px] font-bold">{user.avatarBadge}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-[#E1EFF9] hover:text-white hover:bg-[#104470]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A365C] border-t border-[#072540] px-4 pt-2 pb-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-[10px] font-bold text-[#90C3E8] uppercase tracking-wider px-3 py-1">
            National Portals
          </div>
          <NavLink to="/" end className={navLinkClass}>
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/projects" className={navLinkClass}>
            <FolderKanban className="w-4 h-4 text-[#90C3E8]" />
            <span>Central Projects Registry</span>
          </NavLink>
          <NavLink to="/sectors" className={navLinkClass}>
            <Layers className="w-4 h-4 text-[#90C3E8]" />
            <span>Sector Intelligence</span>
          </NavLink>
          <NavLink to="/ministries" className={navLinkClass}>
            <Building2 className="w-4 h-4 text-[#90C3E8]" />
            <span>Ministry Analytics</span>
          </NavLink>
          <NavLink to="/states" className={navLinkClass}>
            <MapPin className="w-4 h-4 text-[#90C3E8]" />
            <span>State Analytics</span>
          </NavLink>
          <NavLink to="/early-warning" className={navLinkClass}>
            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
            <span>Early Warning Center</span>
          </NavLink>
          <NavLink to="/operations" className={navLinkClass}>
            <Database className="w-4 h-4 text-[#90C3E8]" />
            <span>Operations &amp; MLOps</span>
          </NavLink>
          <NavLink to="/methodology" className={navLinkClass}>
            <BookOpen className="w-4 h-4 text-[#90C3E8]" />
            <span>Technical Methodology</span>
          </NavLink>

          <div className="pt-2 border-t border-[#104470]">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-[#072540] text-xs font-semibold text-white border border-[#1B5285]"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1BA0E2]" />
                Role: {user.name} ({user.avatarBadge})
              </span>
              <span className="text-[10px] text-[#90C3E8]">Change</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

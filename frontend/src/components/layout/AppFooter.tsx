import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Database, Layers } from 'lucide-react';

export const AppFooter: React.FC = () => {
  return (
    <footer className="border-t border-[#DDD9D0] bg-[#173F35] text-[#E8F0EC] mt-auto">
      {/* Top Institutional Context Strip */}
      <div className="border-b border-[#1F4E42] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
            
            {/* Col 1: Institutional Authority */}
            <div className="md:col-span-2 space-y-2.5">
              <div className="flex items-center gap-3">
                <img src="/emblem.png" alt="India Emblem" className="h-9 w-auto invert brightness-200" />
                <div>
                  <div className="font-bold text-white text-sm tracking-tight">PAIMANA Intelligence Atlas</div>
                  <div className="text-[#A3B8B0] text-[11px]">
                    Infrastructure & Project Monitoring Division (IPMD)
                  </div>
                </div>
              </div>
              <p className="text-[#C5D4CD] text-[11px] leading-relaxed max-w-lg mt-2">
                PAIMANA is an institutional infrastructure intelligence and decision-support platform designed to monitor Central Sector Infrastructure Projects (₹150 Cr and above) under the Ministry of Statistics and Programme Implementation (MoSPI), Government of India.
              </p>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2.5">
                Analytical Portals
              </h4>
              <ul className="space-y-2 text-[11px] text-[#C5D4CD]">
                <li>
                  <Link to="/projects" className="hover:text-white hover:underline transition-colors">
                    Central Projects Registry
                  </Link>
                </li>
                <li>
                  <Link to="/early-warning" className="hover:text-white hover:underline transition-colors">
                    Early Warning & Intervention Center
                  </Link>
                </li>
                <li>
                  <Link to="/sectors" className="hover:text-white hover:underline transition-colors">
                    Sectoral Performance Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/states" className="hover:text-white hover:underline transition-colors">
                    Geographic & State Density
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Technical & Compliance */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2.5">
                Platform Architecture
              </h4>
              <ul className="space-y-2 text-[11px] text-[#C5D4CD]">
                <li>
                  <Link to="/methodology" className="hover:text-white hover:underline flex items-center gap-1.5 transition-colors">
                    <Layers className="w-3.5 h-3.5 text-[#6BB8A6]" />
                    <span>Technical Methodology</span>
                  </Link>
                </li>
                <li>
                  <Link to="/operations" className="hover:text-white hover:underline flex items-center gap-1.5 transition-colors">
                    <Database className="w-3.5 h-3.5 text-[#DFCBB0]" />
                    <span>Operations & MLOps Engine</span>
                  </Link>
                </li>
                <li className="pt-2 text-[#A3B8B0] text-[10px]">
                  <span>Analytical Stack: <strong>Deterministic + CatBoost ML</strong></span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimer Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#A3B8B0]">
        <div>
          <span>PAIMANA Intelligence Atlas &copy; {new Date().getFullYear()} — Government of India / MoSPI IPMD. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-[#86EFAC] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>National Infrastructure Monitoring</span>
          </span>
          <span>•</span>
          <span>Official Decision Support System</span>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Database, Layers } from 'lucide-react';

export const AppFooter: React.FC = () => {
  return (
    <footer className="border-t border-[#D9E1EA] bg-[#0B2945] text-slate-300 mt-auto">
      {/* Top Institutional Context Strip */}
      <div className="border-b border-[#123B63] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            
            {/* Col 1: Institutional Authority */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-3">
                <img src="/emblem.png" alt="India Emblem" className="h-8 w-auto invert brightness-200" />
                <div>
                  <div className="font-bold text-white text-sm">PAIMANA Intelligence</div>
                  <div className="text-slate-400 text-[11px]">
                    Infrastructure & Project Monitoring Division (IPMD)
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed max-w-lg mt-2">
                PAIMANA Intelligence is an evidence-based decision support system designed to monitor Central Sector Infrastructure Projects (₹150 Cr and above) under the Ministry of Statistics and Programme Implementation (MoSPI), Government of India.
              </p>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2">
                Analytical Portals
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li>
                  <Link to="/projects" className="hover:text-white hover:underline">
                    Central Projects Registry
                  </Link>
                </li>
                <li>
                  <Link to="/early-warning" className="hover:text-white hover:underline">
                    Early Warning & Intervention Center
                  </Link>
                </li>
                <li>
                  <Link to="/sectors" className="hover:text-white hover:underline">
                    Sectoral Performance Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/states" className="hover:text-white hover:underline">
                    Geographic & State Density
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Technical & Compliance */}
            <div>
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2">
                Platform Architecture
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li>
                  <Link to="/methodology" className="hover:text-white hover:underline flex items-center gap-1">
                    <Layers className="w-3 h-3 text-sky-400" />
                    <span>Technical Methodology</span>
                  </Link>
                </li>
                <li>
                  <Link to="/operations" className="hover:text-white hover:underline flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-400" />
                    <span>Operations & Model MLOps</span>
                  </Link>
                </li>
                <li className="pt-2 text-slate-400 text-[10px]">
                  <span>Engine: <strong>Deterministic + CatBoost ML</strong></span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimer Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
        <div>
          <span>PAIMANA Intelligence &copy; {new Date().getFullYear()} — Government of India / MoSPI IPMD. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Government Decision Support</span>
          </span>
          <span>•</span>
          <span>Designed for National Infrastructure Monitoring</span>
        </div>
      </div>
    </footer>
  );
};

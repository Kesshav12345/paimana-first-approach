import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, ShieldCheck, ExternalLink, Globe, Award, CheckCircle2, Lock } from 'lucide-react';

export const AppFooter: React.FC = () => {
  return (
    <footer className="border-t-2 border-[#B8D9F2] bg-[#FFFFFF] text-[#0F2942] mt-auto">
      {/* Top Banner: Official National Portals Strip */}
      <div className="bg-[#E1EFF9] border-b border-[#B8D9F2] py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#0A365C]">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1BA0E2]" />
            <span>Government of India Official Decision Support System</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <a 
              href="https://www.india.gov.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#1BA0E2] transition-colors inline-flex items-center gap-1"
            >
              National Portal of India <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
            <span className="text-[#90C3E8]">•</span>
            <a 
              href="https://data.gov.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#1BA0E2] transition-colors inline-flex items-center gap-1"
            >
              Open Government Data (OGD) <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
            <span className="text-[#90C3E8]">•</span>
            <a 
              href="https://pmgatishakti.gov.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#1BA0E2] transition-colors inline-flex items-center gap-1"
            >
              PM GatiShakti National Master Plan <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Section 1: Official Emblems & Authority */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-3">
              <img 
                src="/emblem.png" 
                alt="National Emblem of India" 
                className="h-16 w-auto object-contain shrink-0" 
              />
              <div className="text-left leading-tight">
                <div className="text-[11px] font-bold text-[#4B647D] uppercase tracking-wider">
                  भारत सरकार • Government of India
                </div>
                <div className="font-extrabold text-[#0A365C] text-sm sm:text-base tracking-tight mt-0.5">
                  Ministry of Statistics &amp; Programme Implementation
                </div>
                <div className="text-xs text-[#1BA0E2] font-semibold mt-0.5">
                  Infrastructure &amp; Project Monitoring Division (IPMD)
                </div>
              </div>
            </div>

            <p className="text-xs text-[#4B647D] leading-relaxed">
              IPMD is statutory division mandated under the Government of India Allocation of Business Rules to 
              track, audit, and provide early warning on Central Sector Infrastructure Projects sanctioned at ₹150 Crore and above.
            </p>
          </div>

          {/* Section 2: Contact & Secretariat */}
          <div className="lg:col-span-4 space-y-3 border-l lg:border-l-2 border-[#D8EBF8] lg:pl-6">
            <h3 className="font-bold text-sm text-[#0A365C] uppercase tracking-wider">
              Secretariat &amp; Division Contact
            </h3>
            <p className="text-xs text-[#4B647D] leading-relaxed">
              Infrastructure and Project Monitoring Division (IPMD),<br />
              Ministry of Statistics and Programme Implementation, Government of India,<br />
              Khurshid Lal Bhawan, Janpath, New Delhi – 110001 (India).
            </p>
            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex items-center gap-2 text-[#0A365C]">
                <Phone className="w-3.5 h-3.5 text-[#1BA0E2]" />
                <span className="font-semibold">Direct Telephone:</span>
                <a href="tel:011-23455604" className="text-[#0A365C] hover:text-[#1BA0E2] font-mono">011-23455604 / 23455605</a>
              </div>
              <div className="flex items-center gap-2 text-[#0A365C]">
                <Mail className="w-3.5 h-3.5 text-[#1BA0E2]" />
                <span className="font-semibold">Official Nodal Desk:</span>
                <a href="mailto:dir-ipmd@mospi.gov.in" className="text-[#0A365C] hover:text-[#1BA0E2] font-mono">dir-ipmd[at]mospi[dot]gov[dot]in</a>
              </div>
            </div>
          </div>

          {/* Section 3: Compliance & Security Badges */}
          <div className="lg:col-span-4 space-y-3 border-l lg:border-l-2 border-[#D8EBF8] lg:pl-6">
            <h3 className="font-bold text-sm text-[#0A365C] uppercase tracking-wider">
              Compliance &amp; Digital Governance
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#F4F9FD] border border-[#B8D9F2] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-[#0A365C]">GIGW 3.0</div>
                  <div className="text-[10px] text-[#4B647D]">Gov Web Compliance</div>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#F4F9FD] border border-[#B8D9F2] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#1BA0E2] shrink-0" />
                <div>
                  <div className="font-bold text-[#0A365C]">STQC Certified</div>
                  <div className="text-[10px] text-[#4B647D]">Quality Certified</div>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#F4F9FD] border border-[#B8D9F2] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#1BA0E2] shrink-0" />
                <div>
                  <div className="font-bold text-[#0A365C]">WCAG 2.1 AA</div>
                  <div className="text-[10px] text-[#4B647D]">Accessible Portal</div>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#F4F9FD] border border-[#B8D9F2] flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-[#0A365C]">Jan Parichay</div>
                  <div className="text-[10px] text-[#4B647D]">NIC SSO Secured</div>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-[#4B647D]">
              Monitored Universe: <strong className="text-[#0A365C]">1,892 Active Central Projects</strong> across 12 Infrastructure Sectors and 36 States/UTs.
            </div>
          </div>
        </div>

        {/* Section 4: Divider & Quick Links */}
        <div className="border-t-2 border-[#D8EBF8] pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[#4B647D]">
              <Link to="/" className="hover:text-[#1BA0E2] font-semibold transition-colors">
                Home / Overview
              </Link>
              <Link to="/projects" className="hover:text-[#1BA0E2] font-semibold transition-colors">
                Central Projects Registry
              </Link>
              <Link to="/sectors" className="hover:text-[#1BA0E2] font-semibold transition-colors">
                Sector Analytics
              </Link>
              <Link to="/ministries" className="hover:text-[#1BA0E2] font-semibold transition-colors">
                Ministries &amp; Agencies
              </Link>
              <Link to="/states" className="hover:text-[#1BA0E2] font-semibold transition-colors">
                States &amp; UTs
              </Link>
              <Link to="/early-warning" className="hover:text-[#1BA0E2] font-semibold transition-colors">
                Early Warning Center
              </Link>
              <Link to="/methodology" className="hover:text-[#1BA0E2] font-semibold transition-colors">
                Methodology &amp; Standards
              </Link>
              <Link to="/operations" className="hover:text-[#1BA0E2] font-semibold transition-colors">
                Operations &amp; MLOps
              </Link>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-[#4B647D]">
              <span className="hover:text-[#0A365C] cursor-pointer">Hyperlinking Policy</span>
              <span>•</span>
              <span className="hover:text-[#0A365C] cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-[#0A365C] cursor-pointer">Terms of Use</span>
              <span>•</span>
              <span className="hover:text-[#0A365C] cursor-pointer">Disclaimer</span>
            </div>
          </div>
        </div>

        {/* Section 5: Official Legal Ownership and NIC Attribution */}
        <div className="border-t border-[#D8EBF8] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#4B647D]">
          <div className="space-y-0.5 text-center sm:text-left">
            <p>
              <strong className="text-[#0A365C] font-bold">Content Owned, Maintained &amp; Updated by:</strong> Infrastructure &amp; Project Monitoring Division (IPMD), Ministry of Statistics and Programme Implementation, Government of India.
            </p>
            <p className="text-[11px] text-[#7E97B0]">
              Designed, Developed &amp; Hosted with National Informatics Centre (NIC) and Digital India Corporation (DIC).
            </p>
          </div>
          <div className="text-right font-mono text-[11px] text-[#7E97B0] shrink-0">
            PAIMANA-INTEL v2.4.2 • Jul 2026 Reporting Cycle
          </div>
        </div>

      </div>
    </footer>
  );
};

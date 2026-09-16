import React from 'react';
import { Phone, Mail, ShieldCheck, ExternalLink, MapPin, Building2 } from 'lucide-react';

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Main Authority & Secretariat Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Ministry Identity & Mandate */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-start sm:items-center gap-4">
              <img 
                src="/emblem.png" 
                alt="National Emblem of India" 
                className="h-16 w-auto object-contain shrink-0" 
              />
              <div className="text-left leading-tight">
                <div className="text-[11px] font-bold text-[#4B647D] uppercase tracking-wider">
                  भारत सरकार • Government of India
                </div>
                <div className="font-extrabold text-[#0A365C] text-base sm:text-lg tracking-tight mt-0.5">
                  Ministry of Statistics &amp; Programme Implementation
                </div>
                <div className="text-xs sm:text-sm text-[#1BA0E2] font-bold mt-0.5">
                  Infrastructure &amp; Project Monitoring Division (IPMD)
                </div>
              </div>
            </div>

            <p className="text-xs text-[#4B647D] leading-relaxed max-w-2xl font-medium">
              IPMD is statutory division mandated under the Government of India Allocation of Business Rules to 
              track, audit, and provide early warning on Central Sector Infrastructure Projects sanctioned at ₹150 Crore and above.
            </p>
          </div>

          {/* Right: Secretariat & Contact Card */}
          <div className="lg:col-span-5 bg-[#F4F9FD] border-2 border-[#B8D9F2] rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1BA0E2]" />
              <h3 className="font-bold text-xs sm:text-sm text-[#0A365C] uppercase tracking-wider">
                Secretariat &amp; Division Contact
              </h3>
            </div>
            
            <div className="flex items-start gap-2 text-xs text-[#4B647D] leading-relaxed font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#1BA0E2] shrink-0 mt-0.5" />
              <span>
                Khurshid Lal Bhawan, Janpath, New Delhi – 110001 (India)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#D8EBF8] text-xs">
              <div className="flex items-center gap-2 text-[#0A365C]">
                <Phone className="w-3.5 h-3.5 text-[#1BA0E2] shrink-0" />
                <a href="tel:011-23455604" className="text-[#0A365C] hover:text-[#1BA0E2] font-semibold font-mono">011-23455604</a>
              </div>
              <div className="flex items-center gap-2 text-[#0A365C]">
                <Mail className="w-3.5 h-3.5 text-[#1BA0E2] shrink-0" />
                <a href="mailto:dir-ipmd@mospi.gov.in" className="text-[#0A365C] hover:text-[#1BA0E2] font-semibold truncate">dir-ipmd@mospi.gov.in</a>
              </div>
            </div>
          </div>

        </div>

        {/* Legal, Policy & Attribution Bar */}
        <div className="border-t-2 border-[#D8EBF8] pt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#4B647D]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold">
              <span className="hover:text-[#0A365C] cursor-pointer">Hyperlinking Policy</span>
              <span>•</span>
              <span className="hover:text-[#0A365C] cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-[#0A365C] cursor-pointer">Terms of Use</span>
              <span>•</span>
              <span className="hover:text-[#0A365C] cursor-pointer">Disclaimer</span>
              <span>•</span>
              <span className="hover:text-[#0A365C] cursor-pointer">Accessibility Statement</span>
            </div>

            <div className="text-right font-mono text-[11px] text-[#7E97B0]">
              PAIMANA-INTEL v2.4.2 • Jul 2026 Reporting Cycle
            </div>
          </div>

          <div className="text-center sm:text-left text-xs text-[#4B647D] pt-1">
            <p className="leading-relaxed">
              <strong className="text-[#0A365C] font-bold">Content Owned, Maintained &amp; Updated by:</strong> Infrastructure &amp; Project Monitoring Division (IPMD), Ministry of Statistics and Programme Implementation, Government of India.
            </p>
            <p className="text-[11px] text-[#7E97B0] mt-0.5">
              Designed, Developed &amp; Hosted with National Informatics Centre (NIC) and Digital India Corporation (DIC).
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';

export const GovernmentHeader: React.FC = () => {
  return (
    <header className="bg-[#FAF8F5] border-b border-[#DDD9D0] text-[#26312D] relative z-40">
      {/* Subtle National Tricolour Accent Line */}
      <div className="h-[3px] w-full flex">
        <div className="h-full w-1/3 bg-[#E67E22]" />
        <div className="h-full w-1/3 bg-white" />
        <div className="h-full w-1/3 bg-[#27AE60]" />
      </div>

      {/* Institutional Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Emblem of India & Ministry Identity (External Link -> Official MoSPI) */}
          <a 
            href="https://mospi.gov.in/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 sm:gap-4 group cursor-pointer hover:opacity-90 transition-opacity"
            title="Official Portal — Ministry of Statistics and Programme Implementation (External Link)"
          >
            <img 
              src="/emblem.png" 
              alt="State Emblem of India" 
              className="h-10 sm:h-12 w-auto object-contain flex-shrink-0"
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#66736D] tracking-wider uppercase">
                  भारत सरकार
                </span>
                <span className="text-[#C4BFB6] text-[10px] hidden sm:inline">•</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#66736D] tracking-wider uppercase hidden sm:inline">
                  Government of India
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-bold text-[#173F35] tracking-tight leading-tight group-hover:text-[#267A69] transition-colors">
                MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION
              </h1>
              <p className="text-[10px] sm:text-[11px] font-medium text-[#66736D] leading-tight">
                Infrastructure & Project Monitoring Division (IPMD)
              </p>
            </div>
          </a>

          {/* Right: Partner & PAIMANA Branding */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a 
              href="https://dic.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 pr-3 border-r border-[#DDD9D0] hover:opacity-90 transition-opacity cursor-pointer"
              title="Digital India Corporation — Ministry of Electronics & Information Technology (External Link)"
            >
              <img 
                src="/data-for-dev.png" 
                alt="Digital India Corporation — Data for Development" 
                className="h-8 w-auto object-contain"
              />
            </a>

            <Link 
              to="/" 
              className="flex items-center gap-2.5 group cursor-pointer hover:opacity-90 transition-opacity"
              title="PAIMANA Intelligence — Return to National Dashboard"
            >
              <img 
                src="/logo-paimana.png" 
                alt="PAIMANA Intelligence" 
                className="h-6 sm:h-7 w-auto object-contain"
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[11px] font-extrabold text-[#173F35] tracking-wider uppercase leading-tight group-hover:text-[#267A69] transition-colors">
                  PAIMANA ATLAS
                </span>
                <span className="text-[9px] font-medium text-[#267A69] leading-tight">
                  Infrastructure Intelligence
                </span>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
};

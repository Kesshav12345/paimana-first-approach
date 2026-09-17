import React from 'react';
import { Link } from 'react-router-dom';

export const GovernmentHeader: React.FC = () => {
  return (
    <header className="bg-[#FFFFFF] border-b border-[#D9E0E5] text-[#25313B] relative z-40">
      {/* Subtle National Tricolour Accent Line */}
      <div className="h-[3px] w-full flex">
        <div className="h-full w-1/3 bg-[#D99A2B]" />
        <div className="h-full w-1/3 bg-white" />
        <div className="h-full w-1/3 bg-[#4D8A67]" />
      </div>

      {/* Institutional Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Emblem of India & Ministry Identity (External Link -> Official MoSPI) */}
          <a 
            href="https://www.mospi.gov.in/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 sm:gap-5 group cursor-pointer hover:opacity-90 transition-opacity"
            title="Official Portal — Ministry of Statistics and Programme Implementation (External Link)"
          >
            <img 
              src="/emblem.png" 
              alt="State Emblem of India" 
              className="h-14 sm:h-16 md:h-18 w-auto object-contain flex-shrink-0"
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#66737D] tracking-wider uppercase">
                  भारत सरकार
                </span>
                <span className="text-[#D9E0E5] text-xs hidden sm:inline">•</span>
                <span className="text-xs sm:text-sm font-bold text-[#66737D] tracking-wider uppercase hidden sm:inline">
                  Government of India
                </span>
              </div>
              <h1 className="text-sm sm:text-base md:text-lg font-extrabold text-[#123F63] tracking-tight leading-tight group-hover:text-[#187A9E] transition-colors">
                MINISTRY OF STATISTICS &amp; PROGRAMME IMPLEMENTATION
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-[#66737D] leading-tight mt-0.5">
                Infrastructure &amp; Project Monitoring Division (IPMD)
              </p>
            </div>
          </a>

          {/* Right: Partner & PAIMANA Branding */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a 
              href="https://dic.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 pr-4 border-r border-[#D9E0E5] hover:opacity-90 transition-opacity cursor-pointer"
              title="Digital India Corporation — Ministry of Electronics &amp; Information Technology (External Link)"
            >
              <img 
                src="/data-for-dev.png" 
                alt="Digital India Corporation — Data for Development" 
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </a>

            <Link 
              to="/" 
              className="flex items-center gap-3 group cursor-pointer hover:opacity-90 transition-opacity"
              title="PAIMANA Intelligence — Return to National Dashboard"
            >
              <img 
                src="/logo-paimana.png" 
                alt="PAIMANA Intelligence" 
                className="h-9 sm:h-11 w-auto object-contain"
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-base sm:text-lg font-black text-[#123F63] group-hover:text-[#187A9E] tracking-wider uppercase leading-tight transition-colors">
                  PAIMANA
                </span>
                <span className="text-xs font-semibold text-[#66737D] leading-tight">
                  National Infrastructure Platform
                </span>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';

export const GovernmentHeader: React.FC = () => {
  return (
    <header className="bg-white border-b border-[#D9E1EA] text-[#172B4D] relative z-40">
      {/* Subtle National Tricolour Stripe */}
      <div className="h-[3.5px] w-full flex">
        <div className="h-full w-1/3 bg-[#F59E0B]" />
        <div className="h-full w-1/3 bg-white border-y border-slate-100" />
        <div className="h-full w-1/3 bg-[#16804B]" />
      </div>

      {/* Institutional Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Emblem of India & Ministry Identity (Clickable -> Home) */}
          <Link 
            to="/" 
            className="flex items-center gap-3 sm:gap-4 group cursor-pointer hover:opacity-95 transition-opacity"
            title="Return to National Overview"
          >
            <img 
              src="/emblem.png" 
              alt="State Emblem of India" 
              className="h-10 sm:h-12 w-auto object-contain flex-shrink-0"
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 tracking-wider uppercase">
                  भारत सरकार
                </span>
                <span className="text-slate-300 text-[10px] hidden sm:inline">•</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 tracking-wider uppercase hidden sm:inline">
                  Government of India
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-bold text-[#123B63] group-hover:text-[#1877C9] transition-colors tracking-tight leading-tight">
                MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION
              </h1>
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 leading-tight">
                Infrastructure & Project Monitoring Division (IPMD)
              </p>
            </div>
          </Link>

          {/* Right: PAIMANA & Data for Development Identifiers (Clickable -> Home) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              to="/" 
              className="hidden md:flex items-center gap-2 pr-3 border-r border-slate-200 hover:opacity-90 transition-opacity cursor-pointer"
              title="Data for Development - National Infrastructure"
            >
              <img 
                src="/data-for-dev.png" 
                alt="Data for Development" 
                className="h-9 w-auto object-contain"
              />
            </Link>

            <Link 
              to="/" 
              className="flex items-center gap-2.5 group cursor-pointer hover:opacity-95 transition-opacity"
              title="PAIMANA Intelligence - Home"
            >
              <img 
                src="/logo-paimana.png" 
                alt="PAIMANA" 
                className="h-6 sm:h-7 w-auto object-contain"
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[11px] font-extrabold text-[#0B2945] group-hover:text-[#1877C9] transition-colors tracking-wider uppercase leading-tight">
                  PAIMANA INTEL
                </span>
                <span className="text-[9px] font-medium text-[#1877C9] leading-tight">
                  Decision Support System
                </span>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';

export const AppFooter: React.FC = () => {
  return (
    <footer className="border-t border-[#DDD9D0] bg-white text-[#26312D] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Top Section: Official Emblems & Authority */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="/emblem.png" 
              alt="National Emblem of India" 
              className="h-14 w-auto object-contain" 
            />
            <div className="text-left leading-tight">
              <div className="font-bold text-[#173F35] text-sm tracking-tight">
                Ministry of Statistics and
              </div>
              <div className="font-bold text-[#173F35] text-sm tracking-tight">
                Programme Implementation
              </div>
              <div className="text-xs text-[#52605B] font-medium">
                Government of India
              </div>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-[#DDD9D0]" />

          <img 
            src="/data-for-dev.png" 
            alt="Data for Development" 
            className="h-12 w-auto object-contain" 
          />
        </div>

        {/* Section 2: Get in Touch */}
        <div className="space-y-2 pt-2">
          <h3 className="font-bold text-sm text-[#173F35]">
            Get in touch
          </h3>
          <p className="text-xs text-[#404D47] leading-relaxed max-w-4xl">
            Ministry of Statistics and Programme Implementation, Government of India, Khurshid Lal Bhawan, Janpath, New Delhi-110001 (India).
          </p>
          <div className="flex flex-wrap items-center gap-6 pt-1 text-xs text-[#26312D]">
            <a 
              href="tel:011-23455604" 
              className="inline-flex items-center gap-2 text-[#C85A32] hover:text-[#A34320] font-medium transition-colors"
            >
              <Phone className="w-4 h-4 text-[#C85A32]" />
              <span>011-23455604</span>
            </a>
            <a 
              href="mailto:dir-ipmd@mospi.gov.in" 
              className="inline-flex items-center gap-2 text-[#C85A32] hover:text-[#A34320] font-medium transition-colors"
            >
              <Mail className="w-4 h-4 text-[#C85A32]" />
              <span>dir-ipmd[at]mospi[dot]gov[dot]in</span>
            </a>
          </div>
        </div>

        {/* Section 3: Divider & Quick Links */}
        <div className="border-t border-[#E5E0D8] pt-4">
          <h4 className="font-bold text-xs text-[#173F35] mb-2.5">
            Quick Links
          </h4>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#404D47]">
            <Link to="/" className="hover:text-[#173F35] hover:underline font-medium transition-colors">
              Home
            </Link>
            <a href="#contact" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }} className="hover:text-[#173F35] hover:underline font-medium transition-colors">
              Contact Us
            </a>
            <Link to="/methodology" className="hover:text-[#173F35] hover:underline font-medium transition-colors">
              FAQs
            </Link>
            <Link to="/projects" className="hover:text-[#173F35] hover:underline font-medium transition-colors">
              Site Map
            </Link>
            <span className="hover:text-[#173F35] cursor-pointer hover:underline font-medium transition-colors">
              Hyperlinking Policy
            </span>
            <span className="hover:text-[#173F35] cursor-pointer hover:underline font-medium transition-colors">
              Privacy Policy
            </span>
          </div>
        </div>

        {/* Section 4: Divider & Content Ownership / Copyright */}
        <div className="border-t border-[#E5E0D8] pt-4 space-y-1 text-xs text-[#52605B]">
          <p>
            <strong className="text-[#26312D] font-semibold">Content owned and maintained by:</strong> Infrastructure & Project Monitoring Division(IPMD) | Ministry of Statistics and Programme Implementation.
          </p>
          <p>
            Copyright &copy; 2025 Ministry of Statistics and Programme Implementation
          </p>
        </div>

      </div>
    </footer>
  );
};


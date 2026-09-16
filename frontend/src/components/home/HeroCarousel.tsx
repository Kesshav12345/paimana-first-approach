import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  ShieldAlert,
  FolderKanban
} from 'lucide-react';

interface Slide {
  id: number;
  image: string;
  objectPosition: string;
  caption: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    image: '/banner4-BesNf3Ns.png',
    objectPosition: 'center 45%',
    caption: 'Grade-separated transit corridors, multi-level expressways, and high-speed road networks.'
  },
  {
    id: 2,
    image: '/banner2-AZrNp54C.png',
    objectPosition: 'center 40%',
    caption: 'Deep-water logistics terminals, container handling berths, and coastal multi-modal hubs.'
  },
  {
    id: 3,
    image: '/banner3-BkFJVKqW.png',
    objectPosition: 'center 45%',
    caption: 'Modern passenger terminals, integrated air cargo complexes, and runway expansion corridors.'
  },
  {
    id: 4,
    image: '/banner1-1razA4xw.jpeg',
    objectPosition: 'center 65%',
    caption: 'Supercritical power generation units, high-voltage transmission, and clean energy parks.'
  }
];

export const HeroCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4200);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#0A365C] text-white border-b-2 border-[#B8D9F2]"
      aria-roledescription="carousel"
      aria-label="National Infrastructure Highlights"
    >
      {/* Full-bleed Cinematic Viewport */}
      <div className="relative w-full h-[480px] sm:h-[520px] lg:h-[560px]">
        {SLIDES.map((slide, index) => {
          const isActive = index === current;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              {/* Natural Infrastructure Photography with subtle zoom/pan */}
              <img
                src={slide.image}
                alt="Government Infrastructure"
                className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-105 translate-x-1' : 'scale-100 translate-x-0'
                }`}
                style={{ objectPosition: slide.objectPosition }}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* Institutional Government Blue Vignette */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#072540]/90 via-[#0A365C]/55 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#072540]/70 via-transparent to-[#072540]/30 pointer-events-none" />
            </div>
          );
        })}

        {/* Content Container aligned with site grid */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-8 sm:py-10">
          
          {/* Top Row: Eyebrow Tag & Sector Badge */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-[#0A365C]/90 border border-[#1BA0E2]/50 text-white font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                PAIMANA ATLAS
              </span>
              <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-[#072540]/70 text-[#B8D9F2] border border-[#1BA0E2]/30 text-[11px] font-medium backdrop-blur-xs">
                Central Sector Monitoring (₹150 Cr+)
              </span>
            </div>

            {/* Slide Counter (01 / 04) */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#072540]/70 border border-[#1BA0E2]/30 text-xs font-mono font-bold text-[#F0F6FB] backdrop-blur-xs">
              <span className="text-[#1BA0E2]">0{current + 1}</span>
              <span className="text-[#7E97B0]">/</span>
              <span className="text-[#7E97B0]">0{SLIDES.length}</span>
            </div>
          </div>

          {/* Center Text Block: Clean, Authoritative, Open Sans */}
          <div className="max-w-3xl space-y-4 my-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.18] drop-shadow-md">
              Infrastructure Intelligence for Evidence-Based Governance
            </h1>

            <p className="text-base sm:text-lg text-[#F0F6FB] leading-relaxed drop-shadow-sm max-w-2xl font-normal">
              Monitor progress, detect emerging risk, understand underlying drivers and prioritize intervention across India&apos;s major infrastructure portfolio.
            </p>

            {/* Action Buttons: Exact Blue #1BA0E2 & Translucent Navy */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="px-5 py-3 rounded-lg bg-[#1BA0E2] hover:bg-[#148AC4] text-white text-sm font-bold flex items-center gap-2 shadow-sm border border-[#90C3E8]/40 transition-colors cursor-pointer"
              >
                <FolderKanban className="w-4 h-4 text-white" />
                <span>Explore Infrastructure Portfolio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/early-warning')}
                className="px-5 py-3 rounded-lg bg-[#072540]/70 hover:bg-[#072540]/90 text-white border border-[#B8D9F2]/40 text-sm font-bold flex items-center gap-2 backdrop-blur-xs transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
                <span>Explore Early Warning</span>
              </button>
            </div>
          </div>

          {/* Bottom Bar: Indicators & Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20 text-xs text-[#E1EFF9]">
            <div className="text-[11px] text-[#B8D9F2] font-semibold tracking-wide uppercase">
              Ministry of Statistics and Programme Implementation (MoSPI)
            </div>

            <div className="flex items-center gap-3">
              {/* Slide Indicator Dots */}
              <div className="flex items-center gap-1.5" role="tablist">
                {SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={idx === current}
                    aria-label={`Go to slide ${idx + 1}`}
                    onClick={() => setCurrent(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === current ? 'w-7 bg-[#1BA0E2]' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="p-1.5 rounded-full bg-[#072540]/60 hover:bg-[#0A365C] text-[#F0F6FB] border border-[#B8D9F2]/30 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="p-1.5 rounded-full bg-[#072540]/60 hover:bg-[#0A365C] text-[#F0F6FB] border border-[#B8D9F2]/30 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

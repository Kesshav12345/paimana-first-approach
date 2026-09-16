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
  sectorTag: string;
  caption: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    image: '/banner4-BesNf3Ns.png',
    objectPosition: 'center 45%',
    sectorTag: 'National Expressways & Urban Transit',
    caption: 'Grade-separated transit corridors, multi-level expressways, and high-speed road networks.'
  },
  {
    id: 2,
    image: '/banner2-AZrNp54C.png',
    objectPosition: 'center 40%',
    sectorTag: 'Strategic Aerospace & Maritime Logistics',
    caption: 'Deep-water logistics terminals, container handling berths, and coastal multi-modal hubs.'
  },
  {
    id: 3,
    image: '/banner3-BkFJVKqW.png',
    objectPosition: 'center 45%',
    sectorTag: 'Civil Aviation & National Air Corridors',
    caption: 'Modern passenger terminals, integrated air cargo complexes, and runway expansion corridors.'
  },
  {
    id: 4,
    image: '/banner1-1razA4xw.jpeg',
    objectPosition: 'center 65%',
    sectorTag: 'Thermal & Clean Energy Grid',
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

  const activeSlide = SLIDES[current];

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#173F35] text-white border-b border-[#DDD9D0]"
      aria-roledescription="carousel"
      aria-label="National Infrastructure Highlights"
    >
      {/* Full-bleed Cinematic Viewport */}
      <div className="relative w-full h-[470px] sm:h-[510px] lg:h-[550px]">
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
                alt={slide.sectorTag}
                className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-105 translate-x-1' : 'scale-100 translate-x-0'
                }`}
                style={{ objectPosition: slide.objectPosition }}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* Editorial neutral vignette: high legibility without artificial color wash */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
            </div>
          );
        })}

        {/* Content Container aligned with site grid */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-8 sm:py-10">
          
          {/* Top Row: Eyebrow Tag & Sector Badge */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-[#173F35]/90 border border-white/20 text-white font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                PAIMANA ATLAS
              </span>
              <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-black/50 text-[#C5D4CD] border border-white/20 text-[11px] font-medium backdrop-blur-xs">
                Central Sector Monitoring (₹150 Cr+)
              </span>
            </div>

            {/* Slide Counter (01 / 04) */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-white/20 text-xs font-mono font-bold text-[#E8F0EC] backdrop-blur-xs">
              <span className="text-[#F5EEDB]">0{current + 1}</span>
              <span className="text-[#8C9893]">/</span>
              <span className="text-[#8C9893]">0{SLIDES.length}</span>
            </div>
          </div>

          {/* Center Text Block: Editorial, Authoritative & Increased Font Size */}
          <div className="max-w-3xl space-y-4 my-auto">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#F5EEDB] font-bold tracking-wide drop-shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C89432]" />
              <span>{activeSlide.sectorTag}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15] drop-shadow-md">
              Infrastructure Intelligence for Evidence-Based Governance
            </h1>

            <p className="text-sm sm:text-base text-[#F6F3EC] leading-relaxed drop-shadow-sm max-w-2xl font-normal">
              Monitor progress, detect emerging risk, understand underlying drivers and prioritize intervention across India&apos;s major infrastructure portfolio.
            </p>

            {/* Action Buttons: Institutional Forest & Translucent */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="px-4 py-2.5 rounded-lg bg-[#267A69] hover:bg-[#173F35] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm border border-[#3CA38F]/40 transition-colors cursor-pointer"
              >
                <FolderKanban className="w-4 h-4 text-[#F5EEDB]" />
                <span>Explore Infrastructure Portfolio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/early-warning')}
                className="px-4 py-2.5 rounded-lg bg-black/40 hover:bg-black/60 text-white border border-white/30 text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-xs transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-[#C89432]" />
                <span>Explore Early Warning</span>
              </button>
            </div>
          </div>

          {/* Bottom Bar: Indicators & Controls (Caption removed as requested) */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20 text-xs text-[#E8F0EC]">
            <div className="text-[11px] text-[#C5D4CD] font-medium tracking-wide">
              {activeSlide.sectorTag}
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
                      idx === current ? 'w-6 bg-[#C89432]' : 'w-2 bg-white/40 hover:bg-white/70'
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
                  className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-[#E8F0EC] border border-white/20 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-[#E8F0EC] border border-white/20 transition cursor-pointer"
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

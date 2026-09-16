import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
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
    caption: 'Multi-level expressways, elevated transit corridors, and grade-separated interchanges.'
  },
  {
    id: 2,
    image: '/banner2-AZrNp54C.png',
    objectPosition: 'center 40%',
    sectorTag: 'Strategic Aerospace & Maritime Infrastructure',
    caption: 'Deep-water logistics berths, launch complexes, and coastal connectivity hubs.'
  },
  {
    id: 3,
    image: '/banner3-BkFJVKqW.png',
    objectPosition: 'center 45%',
    sectorTag: 'Civil Aviation & National Air Corridors',
    caption: 'Modern airport passenger terminals, integrated air cargo, and runway expansions.'
  },
  {
    id: 4,
    image: '/banner1-1razA4xw.jpeg',
    objectPosition: 'center 65%',
    sectorTag: 'Thermal & Renewable Energy Grid',
    caption: 'Supercritical power complexes, high-voltage transmission, and clean solar infrastructure.'
  }
];

export const HeroCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6500);
    return () => clearInterval(timer);
  }, [isPlaying, nextSlide]);

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
      className="relative w-full overflow-hidden bg-slate-950 text-white border-b border-[#D9E1EA]"
      aria-roledescription="carousel"
      aria-label="National Infrastructure Highlights"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Full-bleed Cinematic Viewport: stretches across the screen */}
      <div className="relative w-full h-[440px] sm:h-[480px] lg:h-[520px]">
        {SLIDES.map((slide, index) => {
          const isActive = index === current;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              {/* Natural Photo with gentle slow pan across screen width, without blue tint */}
              <img
                src={slide.image}
                alt={slide.sectorTag}
                className={`w-full h-full object-cover transition-transform duration-[7000ms] ease-out ${
                  isActive ? 'scale-105 translate-x-1.5' : 'scale-100 translate-x-0'
                }`}
                style={{ objectPosition: slide.objectPosition }}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* Neutral dark gradient focused on left text area for high readability without color tinting the image */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
            </div>
          );
        })}

        {/* Content Container aligned with site grid */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-8 sm:py-10">
          
          {/* Top Row: Eyebrow Tag & Sector Badge */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-[#1877C9] text-white font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-xs">
                PAIMANA INTELLIGENCE
              </span>
              <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-black/60 text-slate-200 border border-white/20 text-[11px] font-medium backdrop-blur-xs">
                Central Sector Monitoring (₹150 Cr+)
              </span>
            </div>

            {/* Slide Counter */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/20 text-xs font-mono font-bold text-slate-200 backdrop-blur-xs">
              <span>0{current + 1}</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-400">0{SLIDES.length}</span>
            </div>
          </div>

          {/* Center Text Block */}
          <div className="max-w-2xl space-y-3 sm:space-y-4 my-auto">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#F59E0B] font-bold tracking-wide drop-shadow-sm">
              <span>●</span>
              <span>{activeSlide.sectorTag}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
              Infrastructure Intelligence for Evidence-Based Governance
            </h2>

            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed drop-shadow-sm max-w-xl font-normal">
              Monitor project milestones, anticipate cost and schedule escalations through deterministic metrics and CatBoost ML, and mobilize timely interventions across India&apos;s critical infrastructure portfolio.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="px-4 py-2.5 rounded-lg bg-[#1877C9] hover:bg-[#123B63] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <FolderKanban className="w-4 h-4" />
                <span>Explore Infrastructure Portfolio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/early-warning')}
                className="px-4 py-2.5 rounded-lg bg-black/50 hover:bg-black/70 text-white border border-white/40 text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-xs transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
                <span>View Early Warning Center</span>
              </button>
            </div>
          </div>

          {/* Bottom Bar: Caption & Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20 text-xs text-slate-200">
            <div className="hidden sm:block text-[11px] text-slate-200 max-w-md truncate drop-shadow-xs">
              {activeSlide.caption}
            </div>

            <div className="flex items-center gap-3 ml-auto">
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
                      idx === current ? 'w-6 bg-[#1877C9]' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              {/* Play/Pause Button */}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-slate-200 border border-white/20 transition cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-slate-200 border border-white/20 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-slate-200 border border-white/20 transition cursor-pointer"
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

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  FolderKanban, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface Slide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  sectorBadge: string;
  objectPosition?: string;
}

const SLIDES: Slide[] = [
  {
    id: 'chenab-bridge',
    image: '/banner1.jpg',
    title: 'Chenab Rail Bridge — Northern Rail Corridor',
    subtitle: 'World\'s highest railway arch bridge (359m above river bed), establishing resilient all-weather connectivity to the Kashmir Valley.',
    sectorBadge: 'Railways & Strategic Connectivity',
    objectPosition: 'center 40%'
  },
  {
    id: 'atal-tunnel',
    image: '/banner2.png',
    title: 'Atal Tunnel Rohtang — Himalayan Strategic Highway',
    subtitle: 'World\'s longest highway tunnel above 10,000 feet (9.02 km), ensuring year-round strategic logistics across the Pir Panjal range.',
    sectorBadge: 'Road Transport & Highways',
    objectPosition: 'center 50%'
  },
  {
    id: 'solar-park',
    image: '/banner3.png',
    title: 'Bhadla Solar Park — Renewable Energy Mission',
    subtitle: 'Mega-scale renewable energy generation complex spanning 14,000+ acres, powering clean industrial capacity across northern states.',
    sectorBadge: 'Power & Renewable Energy',
    objectPosition: 'center 45%'
  },
  {
    id: 'vizhinjam-port',
    image: '/banner4.png',
    title: 'Vizhinjam International Transshipment Deepwater Port',
    subtitle: 'India\'s first deepwater container transshipment hub strategically positioned on global east-west shipping corridors.',
    sectorBadge: 'Ports, Shipping & Waterways',
    objectPosition: 'center 55%'
  }
];

export const HeroCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-advance every 6.5 seconds when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 6500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <div 
      className="relative w-full bg-[#123F63] overflow-hidden select-none border-b border-[#D9E0E5]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="National Infrastructure Major Projects Carousel"
    >
      {/* Expansive Cinematic Viewport with Seamless Page Blending */}
      <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px]">
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
              {/* Natural Infrastructure Photography with slow subtle zoom */}
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-105 translate-x-1' : 'scale-100 translate-x-0'
                }`}
                style={{ objectPosition: slide.objectPosition }}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* Natural contrast overlays — Clear, vibrant photography with excellent text readability and NO milky white haze */}
              <div className="absolute inset-0 bg-black/30 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>
          );
        })}

        {/* Content Container aligned with site grid */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between pt-8 sm:pt-10 pb-24 sm:pb-30">
          
          {/* Top Row: Clean Slide Counter */}
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xs bg-black/50 border border-white/20 text-sm font-mono font-bold text-white backdrop-blur-xs">
              <span className="text-[#D99A2B]">0{current + 1}</span>
              <span className="text-white/40">/</span>
              <span className="text-white/70">0{SLIDES.length}</span>
            </div>
          </div>

          {/* Center Text Block: Authoritative, Grand Typography */}
          <div className="max-w-3xl space-y-4 my-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.14] drop-shadow-md">
              Infrastructure Intelligence for Evidence-Based Governance
            </h1>

            <p className="text-lg sm:text-xl text-[#F6F7F8] leading-relaxed drop-shadow-sm max-w-2xl font-medium">
              Monitor progress, detect emerging risk, understand underlying drivers and prioritize intervention across India&apos;s major infrastructure portfolio.
            </p>

            {/* Action Buttons: Prominent PAIMANA Blue Primary & Institutional Secondary */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xs bg-[#187A9E] hover:bg-[#156586] text-white text-base sm:text-lg font-bold flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <FolderKanban className="w-5 h-5 text-white" />
                <span>Explore Infrastructure Portfolio</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/early-warning')}
                className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-xs bg-white/95 hover:bg-white text-[#123F63] border border-[#D9E0E5] text-base sm:text-lg font-bold flex items-center gap-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <ShieldAlert className="w-5 h-5 text-[#187A9E]" />
                <span>Explore Early Warning</span>
              </button>
            </div>
          </div>

          {/* Bottom Controls Floating Bar: Slide Navigation (Title removed per user request) */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {/* Slide Indicator Bars */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-black/40 backdrop-blur-xs border border-white/20" role="tablist">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === current}
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => setCurrent(idx)}
                  className={`h-2 transition-all cursor-pointer rounded-xs ${
                    idx === current ? 'w-7 bg-[#187A9E]' : 'w-2 bg-white/40 hover:bg-white/75'
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
                className="p-2 rounded-xs bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                className="p-2 rounded-xs bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

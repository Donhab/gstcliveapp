import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  LogIn,
  Sparkles,
  Award,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Play,
  Pause
} from 'lucide-react';

import slideLaptopAward from '../assets/images/gstc_laptop_award_1790463723075.jpg';
import slideStageDebate from '../assets/images/gstc_stage_debate_1790463734940.jpg';
import slideStemAward from '../assets/images/gstc_stem_award_1790463747357.jpg';
import slideStudentsHall from '../assets/images/gstc_students_hall_1790463760283.jpg';
import { SchoolBadge } from './SchoolBadge';

interface SlideItem {
  id: number;
  image: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  highlight: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 1,
    image: slideLaptopAward,
    badge: 'Academic Excellence & ICT Merit',
    badgeColor: 'bg-amber-400 text-stone-950',
    title: 'Rewarding Exceptional Technical Talent',
    subtitle:
      'GSTC Garki outstanding student receiving an HP laptop prize and merit certificate at our annual science & tech honors convocation.',
    highlight: 'Area 10, Garki • FCT Technology Honors'
  },
  {
    id: 2,
    image: slideStageDebate,
    badge: 'National Debate & Leadership',
    badgeColor: 'bg-blue-400 text-stone-950',
    title: 'Articulate Minds, Confident Leaders',
    subtitle:
      'Our college ambassadors representing GSTC Garki with poise, critical reasoning, and eloquence on national inter-school debate podiums.',
    highlight: 'Science & Technical Oratory Champions'
  },
  {
    id: 3,
    image: slideStemAward,
    badge: 'National STEM Champions',
    badgeColor: 'bg-emerald-400 text-stone-950',
    title: 'Pioneering Green Technology & Innovation',
    subtitle:
      'GSTC Garki student innovators standing proud on the national stage as gold medalists in the "Recycle Rex - Never Refuse to Reuse" challenge.',
    highlight: '1st Place FCT Environmental Engineering'
  },
  {
    id: 4,
    image: slideStudentsHall,
    badge: 'Premier Technical Community',
    badgeColor: 'bg-amber-300 text-stone-950',
    title: 'Over 1,500 Future Technicians & Engineers',
    subtitle:
      'Inside the packed multipurpose college auditorium as vocational trainees in royal blue workshop coats assemble for practical briefings.',
    highlight: 'Center of Nigeria\'s Capital City, Abuja'
  }
];

interface ModernHeroSliderProps {
  onOpenLogin: () => void;
  onNavigateToCheckResult?: () => void;
  onExplorePrograms?: () => void;
}

export const ModernHeroSlider: React.FC<ModernHeroSliderProps> = ({
  onOpenLogin,
  onNavigateToCheckResult,
  onExplorePrograms
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<'down' | 'up'>('down');

  // Slide down automatically after every 5 seconds (5000ms)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setDirection('down');
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleNext = () => {
    setDirection('down');
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setDirection('up');
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const active = SLIDES[currentSlide];

  return (
    <div className="space-y-4">
      {/* 1. Super part of the homepage: Full-width modern slider sliding down every 5 seconds */}
      <div
        className="relative h-[420px] sm:h-[480px] lg:h-[520px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 bg-stone-950 group select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Sliding Images Container (Slide down vertical motion) */}
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          const isPrev =
            index === (currentSlide - 1 + SLIDES.length) % SLIDES.length;

          // Slide down animation classes
          let translateClass = 'translate-y-full opacity-0 pointer-events-none';
          if (isActive) {
            translateClass = 'translate-y-0 opacity-100 z-10';
          } else if (isPrev && direction === 'down') {
            translateClass = '-translate-y-full opacity-0 pointer-events-none';
          }

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${translateClass}`}
            >
              {/* Background Picture */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center transform scale-105 group-hover:scale-100 transition-transform duration-1000"
              />

              {/* Rich dark gradient overlays for maximum legibility and modern school feel */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/40 to-transparent" />

              {/* Slide Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-white max-w-3xl space-y-3 z-20">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md ${slide.badgeColor}`}
                  >
                    {slide.badge}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-200 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                    {slide.highlight}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight leading-tight text-white drop-shadow-md">
                  {slide.title}
                </h2>

                <p className="text-xs sm:text-sm lg:text-base text-stone-200 leading-relaxed font-normal max-w-2xl drop-shadow-sm">
                  {slide.subtitle}
                </p>

                {/* 5-second slide countdown visual pulse */}
                <div className="pt-2 flex items-center gap-2 text-[11px] text-stone-300 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    Auto-sliding down every 5 seconds (Slide {currentSlide + 1} of {SLIDES.length})
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Up / Down Slider Controls (Vertical sliding buttons) */}
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-stone-900/80 hover:bg-[#0b4d2c] text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition shadow-lg hover:scale-105 active:scale-95"
            title="Previous slide (Slide Up)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-stone-900/80 hover:bg-[#0b4d2c] text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition shadow-lg hover:scale-105 active:scale-95"
            title="Next slide (Slide Down)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Dot indicators and pause toggle */}
        <div className="absolute top-4 right-4 sm:right-6 z-30 flex items-center gap-2 bg-stone-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="text-white hover:text-amber-300 transition mr-1"
            title={isPaused ? 'Resume auto-sliding' : 'Pause auto-sliding'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentSlide ? 'down' : 'up');
                setCurrentSlide(i);
              }}
              className={`transition-all duration-300 rounded-full ${
                i === currentSlide
                  ? 'w-6 h-2 bg-amber-400'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
              title={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. THE LOGIN BUTTON JUST BELOW THE SLIDES IN THE LANDING PAGE */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#0b4d2c] to-[#06331c] text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-emerald-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Official College Portal Access</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-serif">
            GSTC Garki School Management Portal
          </h3>
          <p className="text-xs text-emerald-100/90 max-w-xl">
            Sign in as Super Admin, Administrator, Staff (Teacher), or Student. 
            Super Admin username: <span className="font-mono font-bold text-amber-300">Admin</span> | Password: <span className="font-mono font-bold text-amber-300">0000</span>
          </p>
        </div>

        {/* Primary Action Buttons Just Below the Slides */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenLogin}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 shrink-0 group border border-amber-300"
          >
            <LogIn className="w-4 h-4 text-stone-950 group-hover:scale-110 transition-transform" />
            <span>Login to Portal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {onNavigateToCheckResult && (
            <button
              onClick={onNavigateToCheckResult}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 backdrop-blur-xs transition flex items-center gap-2 shrink-0"
            >
              <GraduationCap className="w-4 h-4 text-emerald-300" />
              <span>Check Student Result</span>
            </button>
          )}

          {onExplorePrograms && (
            <button
              onClick={onExplorePrograms}
              className="px-4 py-3 text-emerald-200 hover:text-white font-semibold text-xs sm:text-sm transition hidden lg:inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Vocational Trades</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

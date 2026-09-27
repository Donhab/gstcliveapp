import React, { useState } from 'react';
import { WebsiteCustomization, SchoolNews } from '../types/school';
import { SchoolBadge } from './SchoolBadge';
import {
  Globe,
  Bell,
  Newspaper,
  BookOpen,
  Calendar,
  User,
  ArrowRight,
  Sparkles,
  Award,
  Cpu,
  Wrench,
  Zap,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface VisitorPortalProps {
  customization: WebsiteCustomization | null;
  news: SchoolNews[];
  onNavigateToCheckResult?: () => void;
  onOpenAuth?: () => void;
}

export const VisitorPortal: React.FC<VisitorPortalProps> = ({
  customization,
  news,
  onNavigateToCheckResult,
  onOpenAuth
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<SchoolNews | null>(null);

  // Fallback defaults if customization is loading or unset
  const tagline =
    customization?.heroTagline ||
    'Empowering Future Innovators, Engineers & Technical Leaders';
  const announcement =
    customization?.heroAnnouncement ||
    'Admissions for 2026/2027 Academic Session are currently open. Examination results for First Term now available via online scratch card activation.';
  const principalWelcome =
    customization?.principalWelcomeMessage ||
    'Welcome to Government Science & Technical College (GSTC) Garki, Abuja. As a premier center for technical education in Nigeria\'s Federal Capital Territory, our mission is to blend rigorous scientific foundation with hands-on industrial skills.';
  const schoolEmail = customization?.schoolContactEmail || 'admissions@gstcgarki.edu.ng';
  const schoolPhone = customization?.schoolPhone || '+234 9 291 0000';
  const schoolAddress =
    customization?.schoolAddress || 'Area 10, Garki, Abuja Federal Capital Territory, Nigeria';
  const bannerNoticeText =
    customization?.bannerNoticeText ||
    'Official Notice: Terminal examination continuous assessment marks are compiled and available through student portal scratch cards.';
  const showBanner = customization?.bannerNoticeActive ?? true;

  const categories = ['All', 'Admissions', 'Examination', 'Technical Workshop', 'Sports & Culture', 'General'];

  const filteredNews =
    selectedCategory === 'All'
      ? news
      : news.filter((n) => n.category === selectedCategory);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Live Super Admin Broadcast Notice Banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-stone-950 px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold border border-amber-300 animate-pulse">
          <div className="flex items-center gap-2 max-w-5xl">
            <Bell className="w-4 h-4 shrink-0 text-stone-950 font-bold" />
            <span className="font-bold tracking-wide uppercase text-[11px] bg-stone-950 text-amber-300 px-2 py-0.5 rounded">
              Official Bulletin
            </span>
            <span className="truncate">{bannerNoticeText}</span>
          </div>
          <span className="text-[11px] font-mono opacity-80 hidden md:inline">
            Live GSTC Broadcast
          </span>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#07321e] via-[#0b4d2c] to-[#042113] text-white shadow-xl border border-emerald-900/50 p-6 sm:p-10 lg:p-12">
        {/* Subtle decorative circles */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-20 w-60 h-60 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>FCT Education Secretariat • Science & Tech Board</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight leading-tight text-white">
            {tagline}
          </h1>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            {announcement}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {onNavigateToCheckResult && (
              <button
                onClick={onNavigateToCheckResult}
                className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 group"
              >
                <span>Check Student Result</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <a
              href="#school-news"
              className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition flex items-center gap-2"
            >
              <Newspaper className="w-4 h-4 text-emerald-300" />
              <span>Read Latest News ({news.length})</span>
            </a>

            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/5 font-medium text-xs sm:text-sm transition"
              >
                Staff & Student Sign In →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Principal's Welcome Address & College Pillars */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Principal\'s Desk</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
            Welcome to GSTC Garki, Area 10 Abuja
          </h2>
          <div className="relative pl-4 border-l-2 border-emerald-600 text-stone-700 text-sm leading-relaxed italic">
            "{principalWelcome}"
          </div>
          <div className="pt-2 flex items-center gap-3">
            <SchoolBadge size="sm" />
            <div>
              <p className="text-xs font-bold text-stone-900">Principal & Chief Executive</p>
              <p className="text-[11px] text-stone-500">Government Science & Technical College, Garki</p>
            </div>
          </div>
        </div>

        {/* Quick Highlights / College Stats */}
        <div className="bg-stone-900 text-white rounded-xl p-6 sm:p-8 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">College Mandate</span>
            <h3 className="text-lg font-bold font-serif mt-1">Knowledge, Skill & Self Reliance</h3>
            <p className="text-stone-300 text-xs mt-2 leading-relaxed">
              Equipping technical students with vocational mastery for modern industry, digital computing, and higher engineering pursuits.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-800 text-center">
            <div className="bg-stone-800/80 p-3 rounded-lg border border-stone-700">
              <span className="text-xl font-black font-mono text-amber-300">100%</span>
              <p className="text-[10px] text-stone-400 uppercase mt-0.5">Practical Workshops</p>
            </div>
            <div className="bg-stone-800/80 p-3 rounded-lg border border-stone-700">
              <span className="text-xl font-black font-mono text-emerald-400">NABTEB</span>
              <p className="text-[10px] text-stone-400 uppercase mt-0.5">Certified Center</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Latest News Section (Posted by Admins for Visitors) */}
      <section id="school-news" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-[#0b4d2c]" />
              <h2 className="text-xl font-bold font-serif text-stone-900">
                School News & Public Announcements
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Verified dispatches, events, and examination timetables published by the School Administration.
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-[#0b4d2c] text-white shadow-xs font-semibold'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredNews.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-500">
            <Newspaper className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="font-semibold text-sm text-stone-700">No news articles in this category</p>
            <p className="text-xs text-stone-400 mt-1">
              Select another filter or check back as administrative dispatches are posted in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNews.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveArticle(item)}
                className="bg-white rounded-xl border border-stone-200 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between p-5 cursor-pointer group hover:border-emerald-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.category}
                    </span>
                    <span className="text-stone-400 text-[11px] flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      {new Date(item.publishedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-stone-900 group-hover:text-[#0b4d2c] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {item.summary || item.content}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-1.5 text-[11px] truncate">
                    <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="font-medium text-stone-700 truncate">{item.authorName}</span>
                    <span className="text-stone-400 text-[10px]">({item.authorRole})</span>
                  </div>
                  <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px] group-hover:translate-x-1 transition-transform shrink-0">
                    Read <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Technical Departments & Trades Showcase */}
      <section className="bg-stone-50 rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-5">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-800">
            Vocational Specializations
          </span>
          <h2 className="text-xl font-bold font-serif text-stone-900 mt-1">
            Technical Trades & Engineering Craft Programs
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Approved curriculum certified by National Business and Technical Examinations Board (NABTEB).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <Cpu className="w-6 h-6 text-emerald-700" />
            <h4 className="font-bold text-xs text-stone-900">Computer Craft Studies (CCS)</h4>
            <p className="text-[11px] text-stone-500">
              Hardware maintenance, networking protocols, modern software applications, and microcomputing.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <Zap className="w-6 h-6 text-amber-600" />
            <h4 className="font-bold text-xs text-stone-900">Electrical Installation Work</h4>
            <p className="text-[11px] text-stone-500">
              Domestic/industrial wiring, renewable solar panel systems, motor control, and conduit cabling.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            <h4 className="font-bold text-xs text-stone-900">Mechanical & Fabrication</h4>
            <p className="text-[11px] text-stone-500">
              Motor vehicle mechanics, arc/argon welding, metal lathe machining, and structural fabrication.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <h4 className="font-bold text-xs text-stone-900">Building Construction & Joinery</h4>
            <p className="text-[11px] text-stone-500">
              Architectural drafting, bricklaying, furniture woodwork, quantity estimation, and masonry.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Visitor Contact & Enquiries Card */}
      <section className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-2xs">
        <h3 className="text-base font-bold font-serif text-stone-900 mb-4">
          College Location & Admissions Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-800 block">Campus Address</span>
              <span className="text-stone-600">{schoolAddress}</span>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <Phone className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-800 block">Admissions Helplines</span>
              <span className="text-stone-600">{schoolPhone}</span>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
            <Mail className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-800 block">Official Inquiries</span>
              <span className="text-stone-600">{schoolEmail}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                {activeArticle.category}
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 text-sm font-bold transition"
              >
                ✕
              </button>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 leading-snug">
                {activeArticle.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-400 mt-2 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(activeArticle.publishedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                <span>•</span>
                <span>Published by {activeArticle.authorName} ({activeArticle.authorRole})</span>
              </div>
            </div>

            {activeArticle.summary && (
              <p className="text-xs sm:text-sm font-semibold text-stone-700 bg-stone-50 p-3 rounded-lg border-l-4 border-emerald-600">
                {activeArticle.summary}
              </p>
            )}

            <div className="text-stone-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-2 pt-2">
              {activeArticle.content}
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

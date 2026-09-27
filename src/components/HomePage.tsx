import React, { useState } from 'react';
import { WebsiteCustomization, SchoolNews, ScratchCard, ExamResult, Student } from '../types/school';
import { ModernHeroSlider } from './ModernHeroSlider';
import { SchoolBadge } from './SchoolBadge';
import {
  Sparkles,
  MapPin,
  Award,
  BookOpen,
  Cpu,
  Zap,
  Wrench,
  GraduationCap,
  Calendar,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Layers,
  Search,
  KeyRound
} from 'lucide-react';

interface HomePageProps {
  customization: WebsiteCustomization | null;
  news: SchoolNews[];
  scratchCards?: ScratchCard[];
  students?: Student[];
  results?: ExamResult[];
  onOpenLogin: () => void;
  onNavigateToCheckResult: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  customization,
  news,
  scratchCards = [],
  students = [],
  results = [],
  onOpenLogin,
  onNavigateToCheckResult
}) => {
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<SchoolNews | null>(null);

  // Quick PIN check widget state
  const [quickPin, setQuickPin] = useState('');
  const [quickAdmission, setQuickAdmission] = useState('');
  const [quickMessage, setQuickMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPin || !quickAdmission) {
      setQuickMessage({ type: 'error', text: 'Please enter both admission number and 12-digit PIN.' });
      return;
    }
    // Direct user to full student dashboard
    onNavigateToCheckResult();
  };

  const categories = ['All', 'Admissions', 'Examination', 'Technical Workshop', 'Sports & Culture', 'General'];

  const filteredNews =
    selectedNewsCategory === 'All'
      ? news
      : news.filter((n) => n.category === selectedNewsCategory);

  const schoolEmail = customization?.schoolContactEmail || 'admissions@gstcgarki.edu.ng';
  const schoolPhone = customization?.schoolPhone || '+234 9 291 0000';
  const schoolAddress =
    customization?.schoolAddress || 'Area 10, Garki, Abuja Federal Capital Territory, Nigeria';
  const bannerNoticeText =
    customization?.bannerNoticeText ||
    'Official Notice: Terminal examination continuous assessment marks are compiled and available through student portal scratch cards.';
  const showBanner = customization?.bannerNoticeActive ?? true;

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Super part of the homepage: sliding pictures down every 5 seconds & login button below */}
      <section>
        <ModernHeroSlider
          onOpenLogin={onOpenLogin}
          onNavigateToCheckResult={onNavigateToCheckResult}
          onExplorePrograms={() => {
            const el = document.getElementById('trades-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </section>

      {/* 2. Primary Writeup: Center of the Capital City of Nigeria */}
      <section className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        {/* Subtle decorative crest background */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <SchoolBadge size="lg" className="shadow-md" />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>FCT Center of Excellence in Technical Education • Est. 2000</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif text-stone-900 tracking-tight leading-tight">
                One of the Best Science, Technical & Vocational Schools Located in the Center of the Capital City of Nigeria
              </h2>
            </div>
          </div>

          <div className="text-stone-700 text-sm sm:text-base leading-relaxed space-y-4">
            <p className="font-medium text-stone-800 text-base sm:text-lg">
              Strategically positioned in <strong>Area 10, Garki, Abuja</strong>—the prestigious heart and administrative center of Nigeria's Federal Capital Territory—<strong>Government Science and Technical College (GSTC) Garki</strong> stands as a beacon of academic rigor and vocational mastery.
            </p>
            <p>
              Established by the Federal Capital Territory Administration (FCTA) and fully accredited by the <strong>National Business and Technical Examinations Board (NABTEB)</strong>, our institution provides a vibrant ecosystem where theoretical science seamlessly intersects with industrial practice. Here, secondary students are not merely taught formulas; they work with real lathe machinery, industrial wiring boards, modern automotive diagnostic rigs, and advanced computing workstations.
            </p>
            <p className="text-stone-600 text-xs sm:text-sm">
              From winning nationwide environmental and robotics challenges to graduating certified craftsmen ready for immediate self-reliance or distinguished university engineering careers, GSTC Garki continues to pioneer technological leadership in West Africa.
            </p>
          </div>

          {/* Core Highlights Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-stone-200">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-[#0b4d2c] block">
                #1
              </span>
              <span className="text-[11px] text-stone-600 font-semibold uppercase mt-1 block">
                FCT Technical Hub
              </span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-600 block">
                8+
              </span>
              <span className="text-[11px] text-stone-600 font-semibold uppercase mt-1 block">
                Accredited Trades
              </span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-blue-600 block">
                100%
              </span>
              <span className="text-[11px] text-stone-600 font-semibold uppercase mt-1 block">
                Practical Workshops
              </span>
            </div>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 block">
                NABTEB
              </span>
              <span className="text-[11px] text-stone-600 font-semibold uppercase mt-1 block">
                Certified Center
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quick Scratch Card Result Checker & Student Portal Gateway */}
      <section className="bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Instant Online Examination Terminal Portal</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif">
              Check Your Terminal Assessment & Broadsheet Online
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Students and parents can view official continuous assessment marks (1st CA: 10, 2nd CA: 10, 3rd CA: 10, Exam: 70) and print terminal report cards using the 12-digit scratch card PIN issued by the Principal Admin.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onNavigateToCheckResult}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                <span>Go to Result Checker Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenLogin}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition"
              >
                Staff & Admin Sign In
              </button>
            </div>
          </div>

          {/* Interactive Quick-Check Card Form */}
          <div className="lg:col-span-5 bg-stone-800/90 border border-stone-700 p-6 rounded-2xl shadow-inner space-y-4">
            <div className="flex items-center justify-between border-b border-stone-700 pb-3">
              <span className="font-bold text-xs text-amber-300 uppercase tracking-wider">
                Scratch Card Quick Gateway
              </span>
              <span className="text-[10px] text-stone-400 font-mono">12-Digit Security PIN</span>
            </div>

            <form onSubmit={handleQuickCheck} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Student Admission Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. GSTC/2025/001"
                  value={quickAdmission}
                  onChange={(e) => setQuickAdmission(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-600 rounded-lg text-white font-mono placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  12-Digit Scratch Card PIN
                </label>
                <input
                  type="text"
                  placeholder="XXXX-XXXX-XXXX"
                  value={quickPin}
                  onChange={(e) => setQuickPin(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-600 rounded-lg text-white font-mono placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {quickMessage && (
                <p
                  className={`text-[11px] p-2 rounded ${
                    quickMessage.type === 'error'
                      ? 'bg-red-950/80 text-red-300 border border-red-800'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {quickMessage.text}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0b4d2c] hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-md flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Verify & Check Result</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 4. Technical Trades & Vocational Departments Showcase */}
      <section id="trades-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-stone-200">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-800">
              Approved NABTEB Curriculum
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
              Technical Crafts & Specialized Vocational Trades
            </h2>
          </div>
          <p className="text-xs text-stone-500 max-w-sm">
            Practical apprenticeships equipped with full industrial-grade laboratories in the heart of Abuja.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-emerald-600">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">Computer Craft Studies (CCS)</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Software fundamentals, hardware maintenance, web programming, digital electronics, networking and modern microprocessor diagnostics.
            </p>
            <span className="text-[11px] font-semibold text-emerald-700 block">
              Lead Lab: Turing ICT Hall
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-amber-500">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">Electrical Installation Work</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Domestic and commercial conduit wiring, electrical power distribution, renewable solar PV engineering, and industrial motor control.
            </p>
            <span className="text-[11px] font-semibold text-amber-700 block">
              Lead Lab: Faraday Power Workshop
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-blue-600">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">Fabrication & Welding Craft</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Oxy-acetylene, electric arc, and MIG/TIG welding, structural metal drafting, sheet metal forming, and precision engineering fabrication.
            </p>
            <span className="text-[11px] font-semibold text-blue-700 block">
              Lead Lab: Heavy Engineering Bay
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-purple-600">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">Building Construction & Joinery</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Architectural draughtsmanship, structural masonry, modern carpentry, furniture design, concrete technology, and quantity surveying.
            </p>
            <span className="text-[11px] font-semibold text-purple-700 block">
              Lead Lab: Civil & Joinery Yard
            </span>
          </div>
        </div>
      </section>

      {/* 5. School News & Public Dispatches (Posted by Admins for Visitors) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0b4d2c]" />
              <h2 className="text-2xl font-bold font-serif text-stone-900">
                School News & Administrative Announcements
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Verified news, admission notices, and events posted by school administrators.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedNewsCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  selectedNewsCategory === cat
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
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
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
                className="bg-white rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between p-5 cursor-pointer group hover:border-emerald-400"
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

      {/* 6. Campus Location in Area 10, Abuja & Principal Welcome */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Principal\'s Official Address</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
            Inspiring Technical Excellence in the Federal Capital
          </h3>
          <p className="text-stone-700 text-xs sm:text-sm leading-relaxed italic border-l-2 border-emerald-600 pl-4">
            "{customization?.principalWelcomeMessage ||
              'Welcome to Government Science & Technical College Garki. We are committed to practical excellence, technological innovation, and self-reliance. As Nigeria advances in industrialization, GSTC Garki ensures every young mind is equipped with certified vocational trades and intellectual rigour.'}"
          </p>
          <div className="flex items-center gap-3 pt-2">
            <SchoolBadge size="sm" />
            <div>
              <p className="text-xs font-bold text-stone-900">Principal & Chief Executive</p>
              <p className="text-[11px] text-stone-500">Government Science & Technical College, Garki, Abuja</p>
            </div>
          </div>
        </div>

        {/* Location & Quick Contact */}
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Campus Location</span>
            </div>
            <h4 className="font-bold text-stone-900 text-sm">
              Area 10, Garki, Abuja
            </h4>
            <p className="text-xs text-stone-600 mt-1">
              Located right in the capital city center, adjacent to major transit corridors and the FCT Education Secretariat.
            </p>
          </div>

          <div className="space-y-2 text-xs pt-3 border-t border-stone-200">
            <div className="flex items-center gap-2 text-stone-700">
              <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{schoolPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-700">
              <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{schoolEmail}</span>
            </div>
          </div>

          <button
            onClick={onOpenLogin}
            className="w-full py-2.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Staff & Student Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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

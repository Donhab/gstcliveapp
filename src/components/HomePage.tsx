import React, { useState } from 'react';
import { WebsiteCustomization, SchoolNews, ScratchCard, ExamResult, Student } from '../types/school';
import { ModernHeroSlider } from './ModernHeroSlider';
import { SchoolBadge } from './SchoolBadge';
import { SchoolNewsCard, SchoolNewsDetailModal } from './NewsCardAndModal';
import { PostSchoolNewsForm } from './PostSchoolNewsForm';
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
  KeyRound,
  Newspaper,
  Plus,
  X
} from 'lucide-react';

interface HomePageProps {
  customization: WebsiteCustomization | null;
  news: SchoolNews[];
  scratchCards?: ScratchCard[];
  students?: Student[];
  results?: ExamResult[];
  onOpenLogin: () => void;
  onNavigateToCheckResult: () => void;
  onPostNews?: (data: Omit<SchoolNews, 'id' | 'publishedAt'>) => Promise<SchoolNews>;
  onUpdateNews?: (id: string, updates: Partial<SchoolNews>) => Promise<void>;
  canManageNews?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  customization,
  news,
  scratchCards = [],
  students = [],
  results = [],
  onOpenLogin,
  onNavigateToCheckResult,
  onPostNews,
  onUpdateNews,
  canManageNews = false
}) => {
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<SchoolNews | null>(null);
  const [showPostNewsSpace, setShowPostNewsSpace] = useState(false);

  const categories = ['All', 'Admissions', 'Examination', 'Technical Workshop', 'Sports & Culture', 'General'];

  const filteredNews =
    selectedNewsCategory === 'All'
      ? news
      : news.filter((n) => n.category === selectedNewsCategory);

  const schoolEmail = customization?.schoolContactEmail || 'admissions@gstcgarki.edu.ng';
  const schoolPhone = customization?.schoolPhone || '+234 9 291 0000';
  const schoolAddress =
    customization?.schoolAddress?.replace(/Area\s*10,?\s*/gi, 'Area 3 ') ||
    'Garki Area 3, Abuja Federal Capital Territory, Nigeria';
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
                GSTC Garki is one of the best Science, Technical & Vocational colleges located in the center of the capital city of Nigeria.
              </h2>
            </div>
          </div>

          <div className="text-stone-700 text-sm sm:text-base leading-relaxed space-y-4">
            <p className="font-medium text-stone-800 text-base sm:text-lg">
              Strategically positioned in <strong>Area 3 Garki, Abuja</strong>—the prestigious heart and administrative center of Nigeria's Federal Capital Territory—<strong>Government Science and Technical College (GSTC) Garki</strong> stands as a beacon of academic rigor and vocational mastery.
            </p>
            <p>
              Established by the Federal Capital Territory Administration (FCTA) and fully accredited by the <strong>National Business and Technical Examinations Board (NABTEB)</strong>, our institution provides a vibrant ecosystem where theoretical science seamlessly intersects with industrial practice. Here, secondary students are not merely taught formulas; they work with real lathe machinery, industrial wiring boards, modern automotive diagnostic rigs, <strong>outstanding Robotics club with great records</strong> and advanced computing workstations.
            </p>
            <p>
              From winning nationwide environmental and robotics challenges to graduating certified craftsmen ready for immediate self-reliance or distinguished university engineering careers, GSTC Garki continues to pioneer technological leadership in West Africa.
            </p>
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-stone-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0b4d2c]">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Visionary Leadership & High-Performing Faculty</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-stone-700">
                Driving this standard of excellence is our great and result-oriented Principal, <strong>Dr. James Musa Kuta</strong>, whose transformative leadership, strategic foresight, and unwavering commitment to student success continue to set benchmark records across the FCT. He is ably supported by a wonderful team of great-performing administrative and academic staff—dedicated educators, master technicians, and administrators who work tirelessly to mentor, inspire, and equip every student for distinction.
              </p>
            </div>
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
                9
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

      {/* 3. Technical Trades & Vocational Departments Showcase */}
      <section id="trades-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-stone-200">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-800">
              Approved NABTEB Curriculum • 9 Accredited Trades
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
              9 Accredited Technical Crafts & Specialized Vocational Trades
            </h2>
          </div>
          <p className="text-xs text-stone-500 max-w-sm">
            Practical apprenticeships equipped with full industrial-grade laboratories in Area 3 Garki, the heart of Abuja.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-emerald-600">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">1. Computer Craft Studies (CCS)</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Software fundamentals, hardware maintenance, web programming, robotics integration, networking and modern microprocessor diagnostics.
            </p>
            <span className="text-[11px] font-semibold text-emerald-700 block">
              Lead Lab: Turing ICT & Robotics Hall
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-amber-500">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">2. Electrical Installation & Maintenance</h3>
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
            <h3 className="font-bold text-sm text-stone-900">3. Fabrication & Welding Craft</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Oxy-acetylene, electric arc, and MIG/TIG welding, structural metal drafting, sheet metal forming, and precision lathe fabrication.
            </p>
            <span className="text-[11px] font-semibold text-blue-700 block">
              Lead Lab: Heavy Engineering Bay
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-purple-600">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">4. Blocklaying, Bricklaying & Concreting</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Architectural draughtsmanship, structural masonry, modern concrete technology, site setting-out, and quantity surveying.
            </p>
            <span className="text-[11px] font-semibold text-purple-700 block">
              Lead Lab: Civil Construction Yard
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-teal-600">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">5. Carpentry & Joinery Craft</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Industrial woodworking machinery, roof truss construction, cabinetry, bespoke furniture design, and timber structural finishing.
            </p>
            <span className="text-[11px] font-semibold text-teal-700 block">
              Lead Lab: Woodwork & Joinery Studio
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-red-600">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">6. Motor Vehicle Mechanics Work</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Modern automotive OBD diagnostic rigs, internal combustion engine overhaul, transmission systems, and auto-electrical servicing.
            </p>
            <span className="text-[11px] font-semibold text-red-700 block">
              Lead Lab: Automotive Diagnostic Bay
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-pink-600">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">7. Garment Making & Textile Design</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Pattern drafting, industrial sewing machine operation, textile technology, contemporary fashion design, and apparel production.
            </p>
            <span className="text-[11px] font-semibold text-pink-700 block">
              Lead Lab: Apparel & Design Atelier
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-orange-500">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">8. Catering Craft Practice</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Culinary arts, nutrition science, commercial kitchen operations, hospitality management, food hygiene, and pastry production.
            </p>
            <span className="text-[11px] font-semibold text-orange-700 block">
              Lead Lab: Hospitality & Culinary Suite
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition space-y-3 group border-t-4 border-t-indigo-600">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-stone-900">9. Electronics & Radio/TV Servicing</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Printed circuit board assembly, telecommunication electronics, solid-state troubleshooting, and smart appliance maintenance.
            </p>
            <span className="text-[11px] font-semibold text-indigo-700 block">
              Lead Lab: Electronics & Robotics Lab
            </span>
          </div>
        </div>
      </section>

      {/* 5. School News & Public Dispatches (Posted by Admins for Visitors) */}
      <section id="landing-school-news" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-[#0b4d2c]" />
              <h2 className="text-2xl font-bold font-serif text-stone-900">
                School News &amp; Administrative Announcements
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Verified school news, photo galleries, video highlights, admission notices, and events.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Post School News button for admins (or if onPostNews is provided) */}
            {canManageNews && onPostNews && (
              <button
                type="button"
                onClick={() => setShowPostNewsSpace((prev) => !prev)}
                className="px-3.5 py-1.5 rounded-lg bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                {showPostNewsSpace ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Close News Editor</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post School News</span>
                  </>
                )}
              </button>
            )}

            {/* Category Filter Controls */}
            <div className="flex flex-wrap gap-1 p-1 bg-stone-100 rounded-lg">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedNewsCategory(cat)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    selectedNewsCategory === cat
                      ? 'bg-[#0b4d2c] text-white shadow-xs font-semibold'
                      : 'hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible Post School News Composer Space */}
        {showPostNewsSpace && onPostNews && (
          <div className="animate-in fade-in duration-200">
            <PostSchoolNewsForm
              onPostNews={onPostNews}
              onUpdateNews={onUpdateNews}
            />
          </div>
        )}

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
              <SchoolNewsCard
                key={item.id}
                item={item}
                onSelect={(article) => setActiveArticle(article)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 6. Campus Location in Area 3 Garki, Abuja & Principal Welcome */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Principal&apos;s Official Address & Executive Leadership</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
            Inspiring Technical Excellence Under Dr. James Musa Kuta
          </h3>
          <p className="text-stone-700 text-xs sm:text-sm leading-relaxed italic border-l-2 border-emerald-600 pl-4">
            "{customization?.principalWelcomeMessage ||
              'Welcome to Government Science & Technical College Garki, Area 3 Abuja. Together with our wonderful team of high-performing administrative and academic staff, we are committed to practical excellence, technological innovation, and self-reliance across all 9 NABTEB-accredited trades.'}"
          </p>
          <p className="text-stone-600 text-xs leading-relaxed">
            Under the great and result-oriented leadership of <strong>Dr. James Musa Kuta</strong>, and backed by a dedicated team of top-performing administrative officers, master craftsmen, and academic instructors, GSTC Garki continues to set the pace in science, robotics, and technical education in Nigeria.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <SchoolBadge size="sm" />
            <div>
              <p className="text-xs font-bold text-stone-900">Dr. James Musa Kuta</p>
              <p className="text-[11px] text-stone-500">Principal & Chief Executive • GSTC Area 3 Garki, Abuja</p>
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
              Area 3 Garki, Abuja
            </h4>
            <p className="text-xs text-stone-600 mt-1">
              Strategically positioned in Area 3 Garki, Abuja—the prestigious heart and administrative center of Nigeria&apos;s Federal Capital Territory.
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

      {/* Article Detail Modal with Images & Videos */}
      <SchoolNewsDetailModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
      />
    </div>
  );
};

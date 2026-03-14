import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

const useInView = (threshold = 0.12) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
};

const AnimatedSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0px)' : 'translateY(40px)',
        transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

const teamMembers = [
  {
    name: 'أحمد الشمري',
    role: 'المؤسس والرئيس التنفيذي',
    bio: 'خبرة أكثر من 15 عاماً في قطاع الأزياء والتقنية. أسس DressnMore برؤية واضحة لتحويل إدارة الأتيليهات رقمياً.',
    img: 'https://readdy.ai/api/search-image?query=professional%20Arab%20businessman%20in%20elegant%20suit%20confident%20smile%20modern%20office%20background%20executive%20portrait%20high%20quality%20photography%20warm%20lighting%20sophisticated%20look&width=400&height=400&seq=team-ceo-001&orientation=squarish',
    social: { linkedin: '#', twitter: '#' },
    badge: 'المؤسس',
  },
  {
    name: 'سارة العتيبي',
    role: 'مديرة تطوير المنتج',
    bio: 'متخصصة في تجربة المستخدم وتصميم الأنظمة. تقود فريق التطوير لضمان أن كل ميزة تلبي احتياجات الأتيليهات الفعلية.',
    img: 'https://readdy.ai/api/search-image?query=professional%20Arab%20businesswoman%20elegant%20hijab%20confident%20smile%20modern%20office%20background%20product%20manager%20portrait%20high%20quality%20photography%20warm%20lighting%20sophisticated%20look&width=400&height=400&seq=team-pm-002&orientation=squarish',
    social: { linkedin: '#', twitter: '#' },
    badge: 'المنتج',
  },
  {
    name: 'محمد القحطاني',
    role: 'مدير التقنية CTO',
    bio: 'مهندس برمجيات بخبرة 12 عاماً في بناء الأنظمة السحابية. يقود الفريق التقني لضمان أعلى معايير الأداء والأمان.',
    img: 'https://readdy.ai/api/search-image?query=professional%20Arab%20male%20software%20engineer%20tech%20lead%20confident%20smile%20modern%20tech%20office%20background%20CTO%20portrait%20high%20quality%20photography%20cool%20lighting%20sophisticated%20look&width=400&height=400&seq=team-cto-003&orientation=squarish',
    social: { linkedin: '#', twitter: '#' },
    badge: 'التقنية',
  },
  {
    name: 'نورة الدوسري',
    role: 'مديرة نجاح العملاء',
    bio: 'متخصصة في دعم العملاء وبناء العلاقات. تضمن أن كل عميل يحصل على أقصى استفادة من النظام منذ اليوم الأول.',
    img: 'https://readdy.ai/api/search-image?query=professional%20Arab%20businesswoman%20elegant%20hijab%20warm%20smile%20customer%20success%20manager%20modern%20office%20background%20portrait%20high%20quality%20photography%20soft%20lighting%20friendly%20look&width=400&height=400&seq=team-cs-004&orientation=squarish',
    social: { linkedin: '#', twitter: '#' },
    badge: 'العملاء',
  },
  {
    name: 'خالد الزهراني',
    role: 'مدير المبيعات والشراكات',
    bio: 'خبير في بناء الشراكات الاستراتيجية وتوسيع قاعدة العملاء. يقود فريق المبيعات في أكثر من 10 دول عربية.',
    img: 'https://readdy.ai/api/search-image?query=professional%20Arab%20businessman%20sales%20director%20confident%20smile%20modern%20office%20background%20portrait%20high%20quality%20photography%20warm%20lighting%20business%20look&width=400&height=400&seq=team-sales-005&orientation=squarish',
    social: { linkedin: '#', twitter: '#' },
    badge: 'المبيعات',
  },
  {
    name: 'ريم الحربي',
    role: 'مديرة التسويق',
    bio: 'متخصصة في التسويق الرقمي وبناء العلامات التجارية. تقود استراتيجية التسويق لـ DressnMore في المنطقة العربية.',
    img: 'https://readdy.ai/api/search-image?query=professional%20Arab%20businesswoman%20marketing%20director%20elegant%20hijab%20confident%20smile%20modern%20creative%20office%20background%20portrait%20high%20quality%20photography%20vibrant%20lighting&width=400&height=400&seq=team-mkt-006&orientation=squarish',
    social: { linkedin: '#', twitter: '#' },
    badge: 'التسويق',
  },
];

const milestones = [
  { year: '2019', title: 'بداية الفكرة', desc: 'وُلدت فكرة DressnMore من معاناة أصحاب الأتيليهات مع الإدارة اليدوية وضياع البيانات.', icon: 'ri-lightbulb-line' },
  { year: '2020', title: 'تأسيس الشركة', desc: 'تأسست الشركة رسمياً في الرياض بفريق مكوّن من 5 أشخاص وبدأ تطوير النظام الأول.', icon: 'ri-building-line' },
  { year: '2021', title: 'الإطلاق الرسمي', desc: 'أُطلق النظام رسمياً وانضم أول 50 أتيليه إلى المنصة خلال الأشهر الثلاثة الأولى.', icon: 'ri-rocket-line' },
  { year: '2022', title: 'التوسع الإقليمي', desc: 'توسعنا لتغطية 6 دول عربية وتجاوزنا 200 أتيليه مشترك مع إطلاق وحدة الفروع المتعددة.', icon: 'ri-global-line' },
  { year: '2023', title: 'جائزة الابتكار', desc: 'حصلنا على جائزة أفضل حل تقني لقطاع الأزياء في مؤتمر التقنية السعودي LEAP 2023.', icon: 'ri-award-line' },
  { year: '2024', title: 'الذكاء الاصطناعي', desc: 'أطلقنا وحدة التحليلات الذكية المدعومة بالذكاء الاصطناعي لتوقع الطلب وتحسين المخزون.', icon: 'ri-brain-line' },
  { year: '2025', title: 'أكثر من 500 أتيليه', desc: 'تجاوزنا 500 أتيليه في 10 دول عربية ونواصل النمو نحو تحقيق رؤيتنا الكبرى.', icon: 'ri-trophy-line' },
];

const values = [
  { icon: 'ri-heart-3-line', title: 'العميل أولاً', desc: 'كل قرار نتخذه يبدأ بسؤال واحد: كيف يفيد هذا عميلنا؟ رضاك هو مقياس نجاحنا الحقيقي.', color: 'from-rose-500 to-pink-600' },
  { icon: 'ri-shield-star-line', title: 'الجودة بلا تنازل', desc: 'نؤمن أن التفاصيل الصغيرة تصنع الفارق الكبير. نختبر كل ميزة بدقة قبل إطلاقها.', color: 'from-blue-600 to-cyan-500' },
  { icon: 'ri-refresh-line', title: 'التطوير المستمر', desc: 'نستمع لعملائنا ونطور النظام باستمرار. كل تحديث يعكس احتياجات حقيقية من السوق.', color: 'from-emerald-500 to-teal-600' },
  { icon: 'ri-team-line', title: 'العمل بروح الفريق', desc: 'فريقنا هو قوتنا. نؤمن بالتعاون والاحترام المتبادل لتحقيق أهداف أكبر مما يمكن لأي فرد وحده.', color: 'from-amber-500 to-orange-500' },
  { icon: 'ri-lock-2-line', title: 'الأمانة والشفافية', desc: 'نتحدث بصدق مع عملائنا حول قدرات النظام وحدوده. لا وعود زائفة، فقط نتائج حقيقية.', color: 'from-violet-500 to-purple-600' },
  { icon: 'ri-global-line', title: 'التأثير الإيجابي', desc: 'هدفنا أكبر من الربح — نريد رفع مستوى قطاع الأزياء العربي وتمكين أصحاب الأتيليهات من النجاح.', color: 'from-sky-500 to-blue-600' },
];

const stats = [
  { num: '500+', label: 'أتيليه نشط', icon: 'ri-store-2-line' },
  { num: '10', label: 'دولة عربية', icon: 'ri-map-pin-line' },
  { num: '50+', label: 'موظف متخصص', icon: 'ri-group-line' },
  { num: '98%', label: 'رضا العملاء', icon: 'ri-heart-line' },
  { num: '6', label: 'سنوات خبرة', icon: 'ri-calendar-line' },
  { num: '30', label: 'يوم تجربة مجانية', icon: 'ri-gift-line' },
];

const pressItems = [
  { logo: 'ri-newspaper-line', name: 'Arab News', quote: 'DressnMore يُحدث ثورة في إدارة الأتيليهات العربية بحلول تقنية مبتكرة', year: '2024' },
  { logo: 'ri-tv-line', name: 'قناة العربية', quote: 'النظام الأول من نوعه المصمم خصيصاً لقطاع الأزياء والتفصيل في المنطقة', year: '2023' },
  { logo: 'ri-article-line', name: 'Forbes Arabia', quote: 'من بين أبرز 10 شركات ناشئة في قطاع التقنية المالية والإدارية لعام 2024', year: '2024' },
];

const faqs = [
  { q: 'ما الذي يميز DressnMore عن الأنظمة الأخرى؟', a: 'DressnMore هو النظام الوحيد المصمم من الصفر لقطاع الأتيليهات والأزياء العربية. كل وحدة فيه تعكس احتياجات حقيقية من السوق، بخلاف الأنظمة العامة التي تحتاج تخصيصاً مكلفاً.' },
  { q: 'هل الفريق متاح للدعم بعد الاشتراك؟', a: 'نعم، لدينا فريق دعم متخصص متاح الأحد إلى الخميس من 9 صباحاً حتى 6 مساءً، وللحالات الطارئة على مدار الساعة. كما نوفر مدير حساب مخصص لكل عميل.' },
  { q: 'هل يمكن تخصيص النظام لاحتياجات أتيليهي الخاصة؟', a: 'بالتأكيد! نوفر خيارات تخصيص واسعة تشمل الحقول المخصصة، قوالب الفواتير، وتقارير مخصصة. للاحتياجات الأكبر، يمكن التواصل مع فريق المبيعات لحلول مؤسسية.' },
  { q: 'ما هي الدول التي تخدمها DressnMore؟', a: 'نخدم حالياً: المملكة العربية السعودية، الإمارات، الكويت، قطر، البحرين، عُمان، الأردن، مصر، المغرب، وتونس. ونعمل على التوسع لدول عربية إضافية.' },
];

export default function AboutPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'mission' | 'vision' | 'values'>('mission');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const tabContent = {
    mission: {
      icon: 'ri-focus-3-line',
      title: 'مهمتنا',
      text: 'تمكين أصحاب الأتيليهات والأزياء في العالم العربي من إدارة أعمالهم بكفاءة عالية وبساطة متناهية، من خلال نظام متكامل يجمع كل جوانب العمل في منصة واحدة ذكية وسهلة الاستخدام.',
      highlight: 'نؤمن أن كل أتيليه — مهما كان حجمه — يستحق أدوات إدارة احترافية.',
    },
    vision: {
      icon: 'ri-eye-line',
      title: 'رؤيتنا',
      text: 'أن نكون المنصة الرقمية الأولى والأكثر ثقة لإدارة أتيليهات الأزياء في العالم العربي بحلول 2030، مع التوسع نحو الأسواق العالمية لخدمة مجتمعات الأزياء العربية في كل مكان.',
      highlight: 'هدفنا: 5000 أتيليه في 20 دولة بحلول 2030.',
    },
    values: {
      icon: 'ri-star-line',
      title: 'قيمنا',
      text: 'نبني كل شيء على أساس من الأمانة والشفافية والتطوير المستمر. نؤمن أن نجاح عملائنا هو نجاحنا، وأن الجودة ليست خياراً بل التزاماً راسخاً في كل ما نقدمه.',
      highlight: 'العميل أولاً — دائماً وأبداً.',
    },
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        * { font-family: 'Cairo', sans-serif; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes slide-up { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.8);opacity:0} }
        .float { animation: float 4s ease-in-out infinite; }
        .shimmer-text { background: linear-gradient(90deg, #1e40af, #0ea5e9, #1e40af); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
        .slide-up { animation: slide-up 0.7s ease forwards; }
        .glass { background: rgba(255,255,255,0.08); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.15); }
        .glass-light { background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.6); }
        .text-gradient { background: linear-gradient(135deg, #1e3a8a, #0ea5e9, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .card-hover { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .card-hover:hover { transform: translateY(-8px) scale(1.02); }
        .border-gradient { border: 1px solid transparent; background: linear-gradient(white,white) padding-box, linear-gradient(135deg,#3b82f6,#0ea5e9) border-box; }
        .timeline-line::before { content:''; position:absolute; right:50%; top:0; bottom:0; width:2px; background:linear-gradient(to bottom,transparent,#3b82f6,#0ea5e9,transparent); transform:translateX(50%); }
        .team-card:hover .team-overlay { opacity:1; }
        .team-overlay { opacity:0; transition:opacity 0.4s ease; }
        .press-card { transition: all 0.3s ease; }
        .press-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(59,130,246,0.12); }
      `}</style>

      {/* ===== NAVBAR ===== */}
      <nav className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-blue-100/50' : 'bg-transparent'}`}>
        <div className="mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 to-blue-500 shadow-lg">
                <i className="ri-scissors-cut-line text-white text-xl"></i>
              </div>
              <span className={`text-2xl font-black tracking-tight ${isScrolled ? 'text-gradient' : 'text-white'}`}>DressnMore</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {[['/', 'الرئيسية'], ['/about', 'من نحن']].map(([path, label]) => (
                <button key={path} onClick={() => navigate(path)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${isScrolled ? 'text-gray-600 hover:text-blue-700 hover:bg-blue-50' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                  {label}
                </button>
              ))}
              {[['team', 'الفريق'], ['timeline', 'رحلتنا'], ['faq-about', 'الأسئلة']].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${isScrolled ? 'text-gray-600 hover:text-blue-700 hover:bg-blue-50' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/login')}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${isScrolled ? 'text-blue-700 hover:bg-blue-50' : 'text-white hover:bg-white/10'}`}>
                <i className="ri-login-circle-line ml-1"></i>
                تسجيل الدخول
              </button>
              <button onClick={() => navigate('/#contact')}
                className="bg-gradient-to-l from-blue-900 to-blue-500 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 whitespace-nowrap cursor-pointer">
                ابدأ مجاناً
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=modern%20creative%20tech%20startup%20office%20team%20collaboration%20open%20space%20elegant%20interior%20design%20warm%20golden%20lighting%20professional%20workspace%20with%20large%20windows%20city%20view%20sophisticated%20atmosphere%20cinematic%20photography&width=1920&height=1080&seq=about-hero-bg-001&orientation=landscape"
            alt="فريق DressnMore"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-blue-950/95 via-blue-950/80 to-blue-950/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-transparent to-blue-950/40"></div>
        </div>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)',backgroundSize:'60px 60px'}}></div>

        <div className="relative z-10 max-w-5xl mx-auto px-8 py-32 w-full text-center slide-up">
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2.5 mb-8">
            <i className="ri-team-line text-cyan-400 text-sm"></i>
            <span className="text-cyan-300 text-sm font-semibold">تعرّف على فريقنا ورؤيتنا</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-white leading-tight mb-6">
            نحن
            <br />
            <span className="shimmer-text">DressnMore</span>
          </h1>
          <p className="text-white/70 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            فريق من المبدعين والمطورين والخبراء، متحدون بهدف واحد: تحويل إدارة الأتيليهات العربية إلى تجربة رقمية استثنائية.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={() => scrollTo('team')}
              className="bg-gradient-to-l from-blue-900 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 whitespace-nowrap cursor-pointer">
              <i className="ri-group-line ml-2"></i>
              تعرّف على الفريق
            </button>
            <button onClick={() => scrollTo('timeline')}
              className="glass text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/15 transition-all duration-300 whitespace-nowrap cursor-pointer">
              <i className="ri-history-line ml-2"></i>
              رحلتنا
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-20">
            {stats.map((s, i) => (
              <div key={i} className="glass rounded-2xl p-4 text-center">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded-xl mx-auto mb-2">
                  <i className={`${s.icon} text-cyan-400 text-lg`}></i>
                </div>
                <div className="text-white text-2xl font-black">{s.num}</div>
                <div className="text-white/50 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer" onClick={() => scrollTo('mission')}>
          <span className="text-white/40 text-xs">اكتشف المزيد</span>
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" style={{animation:'float 1.5s ease-in-out infinite'}}></div>
          </div>
        </div>
      </section>

      {/* ===== MISSION / VISION / VALUES TABS ===== */}
      <section id="mission" className="py-28 bg-gradient-to-b from-slate-950 to-blue-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{backgroundImage:'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(14,165,233,0.4) 0%, transparent 50%)'}}></div>
        <div className="relative max-w-6xl mx-auto px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">
              من نحن
              <br />
              <span className="shimmer-text">وماذا نريد؟</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">ثلاثة محاور تحدد هويتنا وتوجهنا في كل خطوة نخطوها</p>
          </AnimatedSection>

          {/* Tabs */}
          <AnimatedSection delay={0.1} className="flex justify-center mb-12">
            <div className="glass rounded-2xl p-1.5 flex gap-1">
              {(['mission', 'vision', 'values'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${activeTab === tab ? 'bg-gradient-to-l from-blue-900 to-blue-500 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                >
                  <i className={`${tabContent[tab].icon} ml-2`}></i>
                  {tabContent[tab].title}
                </button>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="glass rounded-3xl p-10">
                <div className="w-16 h-16 flex items-center justify-center bg-blue-500/20 rounded-2xl mb-6">
                  <i className={`${tabContent[activeTab].icon} text-cyan-400 text-3xl`}></i>
                </div>
                <h3 className="text-3xl font-black text-white mb-5">{tabContent[activeTab].title}</h3>
                <p className="text-white/70 text-lg leading-relaxed mb-6">{tabContent[activeTab].text}</p>
                <div className="border-r-4 border-cyan-400 pr-5">
                  <p className="text-cyan-300 font-bold text-base italic">{tabContent[activeTab].highlight}</p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://readdy.ai/api/search-image?query=modern%20fashion%20atelier%20management%20software%20dashboard%20on%20laptop%20screen%20elegant%20workspace%20with%20fabric%20samples%20and%20design%20tools%20professional%20photography%20warm%20lighting%20creative%20studio%20atmosphere&width=700&height=500&seq=about-mission-img-002&orientation=landscape"
                  alt="رؤية DressnMore"
                  className="w-full h-80 object-cover object-top rounded-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 to-transparent rounded-3xl"></div>
                <div className="absolute bottom-6 right-6 glass rounded-2xl px-5 py-3">
                  <div className="text-cyan-300 text-sm font-bold">منذ 2019</div>
                  <div className="text-white text-xs">نبني المستقبل الرقمي للأتيليهات</div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== VALUES GRID ===== */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-5 py-2 mb-6">
              <i className="ri-star-line text-blue-600 text-sm"></i>
              <span className="text-blue-700 text-sm font-semibold">قيمنا الجوهرية</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              المبادئ التي
              <br />
              <span className="text-gradient">تحكم كل قرار</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">ليست مجرد كلمات على ورق — هي الأساس الذي نبني عليه كل يوم</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <div className="group border-gradient rounded-2xl p-7 card-hover cursor-default h-full">
                  <div className={`w-14 h-14 flex items-center justify-center bg-gradient-to-br ${v.color} rounded-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <i className={`${v.icon} text-white text-2xl`}></i>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">{v.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{v.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TEAM ===== */}
      <section id="team" className="py-28 bg-gradient-to-b from-slate-950 to-blue-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.4) 0%, transparent 60%)'}}></div>
        <div className="relative max-w-7xl mx-auto px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2.5 mb-6">
              <i className="ri-group-line text-cyan-400 text-sm"></i>
              <span className="text-cyan-300 text-sm font-semibold">فريق العمل</span>
            </div>
            <h2 className="text-5xl font-black text-white mb-4">
              العقول التي تقف
              <br />
              <span className="shimmer-text">وراء DressnMore</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">فريق متنوع من الخبراء والمبدعين يعملون بشغف لتقديم أفضل تجربة لعملائنا</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {teamMembers.map((member, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="team-card group relative rounded-3xl overflow-hidden cursor-default h-96">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/95 via-blue-950/40 to-transparent"></div>
                  <div className="team-overlay absolute inset-0 bg-blue-950/80 flex items-center justify-center p-8">
                    <div className="text-center">
                      <p className="text-white/80 text-sm leading-relaxed mb-5">{member.bio}</p>
                      <div className="flex justify-center gap-3">
                        <a href={member.social.linkedin} rel="nofollow" className="w-9 h-9 flex items-center justify-center glass rounded-xl hover:bg-blue-500/40 transition-all duration-300 cursor-pointer">
                          <i className="ri-linkedin-fill text-white text-sm"></i>
                        </a>
                        <a href={member.social.twitter} rel="nofollow" className="w-9 h-9 flex items-center justify-center glass rounded-xl hover:bg-blue-500/40 transition-all duration-300 cursor-pointer">
                          <i className="ri-twitter-x-line text-white text-sm"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-gradient-to-l from-blue-900 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      {member.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 left-0 p-6">
                    <h3 className="text-white text-xl font-black">{member.name}</h3>
                    <p className="text-cyan-300 text-sm font-medium">{member.role}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.5} className="text-center mt-14">
            <div className="glass rounded-3xl p-8 max-w-2xl mx-auto">
              <div className="w-14 h-14 flex items-center justify-center bg-blue-500/20 rounded-2xl mx-auto mb-4">
                <i className="ri-user-add-line text-cyan-400 text-2xl"></i>
              </div>
              <h3 className="text-white text-2xl font-black mb-3">انضم إلى فريقنا</h3>
              <p className="text-white/60 text-sm mb-5 leading-relaxed">نبحث دائماً عن المواهب المتميزة التي تشاركنا شغفنا بالتقنية وقطاع الأزياء. هل أنت منهم؟</p>
              <a href="mailto:careers@dressnmore.com"
                className="inline-flex items-center gap-2 bg-gradient-to-l from-blue-900 to-blue-500 text-white px-7 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 whitespace-nowrap cursor-pointer">
                <i className="ri-mail-send-line"></i>
                أرسل سيرتك الذاتية
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== TIMELINE ===== */}
      <section id="timeline" className="py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{backgroundImage:'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)'}}></div>
        <div className="relative max-w-5xl mx-auto px-8">
          <AnimatedSection className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-5 py-2 mb-6">
              <i className="ri-history-line text-blue-600 text-sm"></i>
              <span className="text-blue-700 text-sm font-semibold">رحلتنا عبر الزمن</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              من فكرة إلى
              <br />
              <span className="text-gradient">منصة رائدة</span>
            </h2>
            <p className="text-gray-500 text-lg">6 سنوات من العمل الدؤوب والنمو المستمر</p>
          </AnimatedSection>

          <div className="relative timeline-line">
            {milestones.map((m, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className={`flex items-center gap-8 mb-12 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block bg-gradient-to-l from-blue-900 to-blue-500 text-white text-sm font-black px-4 py-1.5 rounded-full mb-3`}>
                      {m.year}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{m.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{m.desc}</p>
                  </div>
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl shadow-xl shadow-blue-200">
                      <i className={`${m.icon} text-white text-2xl`}></i>
                    </div>
                  </div>
                  <div className="flex-1"></div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRESS ===== */}
      <section className="py-20 bg-gradient-to-b from-blue-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.4) 0%, transparent 60%)'}}></div>
        <div className="relative max-w-6xl mx-auto px-8">
          <AnimatedSection className="text-center mb-14">
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2.5 mb-6">
              <i className="ri-newspaper-line text-cyan-400 text-sm"></i>
              <span className="text-cyan-300 text-sm font-semibold">في الإعلام</span>
            </div>
            <h2 className="text-4xl font-black text-white mb-3">
              ما يقوله الإعلام
              <br />
              <span className="shimmer-text">عن DressnMore</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pressItems.map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="press-card glass rounded-2xl p-7 cursor-default">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-500/20 rounded-xl">
                      <i className={`${item.logo} text-cyan-400 text-xl`}></i>
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{item.name}</div>
                      <div className="text-white/40 text-xs">{item.year}</div>
                    </div>
                  </div>
                  <div className="border-r-2 border-cyan-400/50 pr-4">
                    <p className="text-white/70 text-sm leading-relaxed italic">&ldquo;{item.quote}&rdquo;</p>
                  </div>
                  <div className="flex gap-1 mt-4">
                    {[1,2,3,4,5].map(s => (
                      <i key={s} className="ri-star-fill text-amber-400 text-xs"></i>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq-about" className="py-28 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-5 py-2 mb-6">
              <i className="ri-question-answer-line text-blue-600 text-sm"></i>
              <span className="text-blue-700 text-sm font-semibold">أسئلة شائعة</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              أسئلة تخطر
              <br />
              <span className="text-gradient">على بالك</span>
            </h2>
            <p className="text-gray-500 text-lg">إجابات صريحة وواضحة على أكثر الأسئلة شيوعاً</p>
          </AnimatedSection>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AnimatedSection key={i} delay={i * 0.05}>
                <div
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${openFaq === i ? 'border-blue-200 shadow-lg shadow-blue-50' : 'border-gray-100 hover:border-blue-100 hover:shadow-md'}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="flex items-center justify-between px-6 py-5 bg-white">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 transition-all duration-300 ${openFaq === i ? 'bg-blue-600' : 'bg-blue-50'}`}>
                        <span className={`text-sm font-black transition-colors duration-300 ${openFaq === i ? 'text-white' : 'text-blue-600'}`}>{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <h4 className={`font-bold text-base transition-colors duration-300 ${openFaq === i ? 'text-blue-700' : 'text-gray-800'}`}>{faq.q}</h4>
                    </div>
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-300 ${openFaq === i ? 'bg-blue-600 rotate-180' : 'bg-gray-100'}`}>
                      <i className={`ri-arrow-down-s-line text-lg transition-colors duration-300 ${openFaq === i ? 'text-white' : 'text-gray-500'}`}></i>
                    </div>
                  </div>
                  <div style={{ maxHeight: openFaq === i ? '200px' : '0px', opacity: openFaq === i ? 1 : 0, transition: 'max-height 0.4s ease, opacity 0.3s ease', overflow: 'hidden' }}>
                    <div className="px-6 pb-6 pt-0">
                      <div className="border-r-2 border-blue-100 pr-4">
                        <p className="text-gray-500 leading-relaxed text-sm">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-28 bg-gradient-to-b from-blue-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.5) 0%, transparent 60%)'}}></div>
        <div className="relative max-w-4xl mx-auto px-8 text-center">
          <AnimatedSection>
            <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-500 rounded-3xl mx-auto mb-8 shadow-2xl shadow-blue-500/40 float">
              <i className="ri-scissors-cut-line text-white text-4xl"></i>
            </div>
            <h2 className="text-5xl font-black text-white mb-5 leading-tight">
              مستعد لتحويل أتيليهك
              <br />
              <span className="shimmer-text">إلى مشروع رقمي ناجح؟</span>
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              انضم إلى أكثر من 500 أتيليه يثقون بـ DressnMore. ابدأ تجربتك المجانية لمدة 30 يوماً — بدون بطاقة ائتمانية.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button onClick={() => navigate('/')}
                className="bg-gradient-to-l from-blue-900 to-blue-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 whitespace-nowrap cursor-pointer">
                <i className="ri-rocket-line ml-2"></i>
                ابدأ تجربتك المجانية
              </button>
              <a href="https://wa.me/201070205189" target="_blank" rel="noopener noreferrer"
                className="glass text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/15 transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center gap-2">
                <i className="ri-whatsapp-line text-green-400"></i>
                تواصل عبر واتساب
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-950 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 to-blue-500">
                <i className="ri-scissors-cut-line text-white"></i>
              </div>
              <span className="text-white font-black text-xl">DressnMore</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-white/40 text-sm">
              <button onClick={() => navigate('/')} className="hover:text-white transition-colors duration-300 cursor-pointer whitespace-nowrap">الرئيسية</button>
              <button onClick={() => navigate('/about')} className="hover:text-white transition-colors duration-300 cursor-pointer whitespace-nowrap text-white/70">من نحن</button>
              <button onClick={() => scrollTo('team')} className="hover:text-white transition-colors duration-300 cursor-pointer whitespace-nowrap">الفريق</button>
              <button onClick={() => scrollTo('timeline')} className="hover:text-white transition-colors duration-300 cursor-pointer whitespace-nowrap">رحلتنا</button>
              <button onClick={() => navigate('/login')} className="hover:text-white transition-colors duration-300 cursor-pointer whitespace-nowrap">تسجيل الدخول</button>
            </div>
            <div className="text-white/30 text-sm">© 2025 DressnMore. جميع الحقوق محفوظة</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

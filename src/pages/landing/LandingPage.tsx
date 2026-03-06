import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';

const useInView = (threshold = 0.15) => {
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
        transform: inView ? 'translateY(0px)' : 'translateY(50px)',
        transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

const Counter = ({ end, suffix = '' }: { end: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);
  return <span ref={ref}>{count}{suffix}</span>;
};

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [msgLen, setMsgLen] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: 'ri-archive-2-line', title: 'إدارة المخزون الذكية', desc: 'تتبع الأقمشة والإكسسوارات والمنتجات الجاهزة مع تنبيهات فورية عند نفاد المخزون وتقارير تفصيلية لكل صنف', color: 'from-cyan-500 to-blue-600' },
    { icon: 'ri-user-heart-line', title: 'إدارة العملاء والطلبات', desc: 'سجل شامل لكل عميل مع تاريخ طلباته ومقاساته وتفضيلاته ومتابعة حالة كل طلب لحظة بلحظة', color: 'from-blue-500 to-indigo-600' },
    { icon: 'ri-file-list-3-line', title: 'فواتير البيع والتفصيل والإيجار', desc: 'إصدار فواتير احترافية بأنواعها الثلاثة مع خيارات دفع متعددة وتتبع المدفوعات والمستحقات', color: 'from-indigo-500 to-violet-600' },
    { icon: 'ri-bar-chart-box-line', title: 'تقارير وتحليلات متقدمة', desc: 'لوحة تحكم ذكية بمؤشرات الأداء الرئيسية وتقارير المبيعات والأرباح والمخزون بصرياً', color: 'from-sky-500 to-blue-600' },
    { icon: 'ri-building-4-line', title: 'إدارة الفروع والمصنع والورشة', desc: 'تنسيق سلس بين جميع الفروع مع نقل المخزون وتوزيع المهام وتتبع الإنتاج في الوقت الفعلي', color: 'from-blue-600 to-cyan-500' },
    { icon: 'ri-wallet-3-line', title: 'محاسبة شاملة ودقيقة', desc: 'نظام محاسبي متكامل لتتبع الإيرادات والمصروفات والأرباح مع تقارير مالية احترافية', color: 'from-teal-500 to-blue-500' },
  ];

  useEffect(() => {
    const interval = setInterval(() => setActiveFeature(p => (p + 1) % features.length), 3500);
    return () => clearInterval(interval);
  }, [features.length]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const msg = data.get('message') as string;
    if (msg && msg.length > 500) return;
    setFormStatus('sending');
    try {
      const res = await fetch('https://readdy.ai/api/form/d6lgctp4a3uojp5fgbhg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
      });
      if (res.ok) { setFormStatus('success'); form.reset(); setMsgLen(0); }
      else setFormStatus('error');
    } catch { setFormStatus('error'); }
  };

  const modules = [
    { icon: 'ri-truck-line', label: 'الموردون' },
    { icon: 'ri-group-line', label: 'العملاء' },
    { icon: 'ri-team-line', label: 'الموظفون' },
    { icon: 'ri-archive-line', label: 'المخزون' },
    { icon: 'ri-receipt-line', label: 'الفواتير' },
    { icon: 'ri-scissors-cut-line', label: 'التفصيل' },
    { icon: 'ri-home-gear-line', label: 'الإيجار' },
    { icon: 'ri-calculator-line', label: 'المحاسبة' },
    { icon: 'ri-exchange-line', label: 'نقل المخزون' },
    { icon: 'ri-building-line', label: 'الفروع' },
    { icon: 'ri-tools-line', label: 'الورشة' },
    { icon: 'ri-bar-chart-2-line', label: 'التقارير' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir="rtl">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.8);opacity:0} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes gradient-x { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes slide-up { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        .float { animation: float 4s ease-in-out infinite; }
        .pulse-ring::after { content:''; position:absolute; inset:0; border-radius:50%; border:2px solid currentColor; animation: pulse-ring 2s ease-out infinite; }
        .shimmer-text { background: linear-gradient(90deg, #1e40af, #0ea5e9, #1e40af); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
        .gradient-animate { background-size: 200% 200%; animation: gradient-x 4s ease infinite; }
        .blob { animation: blob 8s ease-in-out infinite; }
        .slide-up { animation: slide-up 0.6s ease forwards; }
        .glass { background: rgba(255,255,255,0.08); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.15); }
        .glass-dark { background: rgba(15,23,42,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .card-hover { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .card-hover:hover { transform: translateY(-8px) scale(1.02); }
        .glow-blue { box-shadow: 0 0 40px rgba(59,130,246,0.3); }
        .glow-blue:hover { box-shadow: 0 0 60px rgba(59,130,246,0.5); }
        .text-gradient { background: linear-gradient(135deg, #1e3a8a, #0ea5e9, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .border-gradient { border: 1px solid transparent; background: linear-gradient(white,white) padding-box, linear-gradient(135deg,#3b82f6,#0ea5e9) border-box; }
        .module-card:hover .module-icon { transform: scale(1.2) rotate(10deg); }
        .module-icon { transition: transform 0.3s ease; }
        .hero-bg { background: radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(14,165,233,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(30,64,175,0.05) 0%, transparent 60%); }
        .section-divider { background: linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent); height: 1px; }
        .feature-tab.active { background: linear-gradient(135deg, #1e40af, #0ea5e9); color: white; box-shadow: 0 8px 25px rgba(59,130,246,0.4); }
        .number-badge { background: linear-gradient(135deg, #1e3a8a, #0ea5e9); }
      `}</style>

      {/* ===== NAVBAR ===== */}
      <nav className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-blue-100/50' : 'bg-transparent'}`}>
        <div className="mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('hero')}>
              <div className="w-10 h-10 flex items-center justify-center rounded-xl overflow-hidden bg-white shadow-lg ring-1 ring-white/20">
                <img src="/dressnmore-logo.jpg" alt="DressnMore" className="w-full h-full object-cover" />
              </div>
              <span className={`text-2xl font-black tracking-tight ${isScrolled ? 'text-gradient' : 'text-white'}`}>DressnMore</span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {[['hero','الرئيسية'],['features','المميزات'],['modules','الوحدات'],['stats','الإحصائيات'],['contact','تواصل معنا']].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${isScrolled ? 'text-gray-600 hover:text-blue-700 hover:bg-blue-50' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className={`hidden sm:inline text-sm font-medium transition-all duration-300 whitespace-nowrap ${isScrolled ? 'text-gray-600 hover:text-blue-700' : 'text-white/80 hover:text-white'}`}>
                تسجيل الدخول
              </Link>
              <button onClick={() => scrollTo('contact')}
                className="bg-gradient-to-l from-blue-900 to-blue-500 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 whitespace-nowrap cursor-pointer">
                ابدأ مجاناً
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=luxurious%20high-end%20fashion%20atelier%20interior%20with%20elegant%20fabric%20rolls%20silk%20textiles%20golden%20lighting%20dramatic%20shadows%20professional%20tailoring%20workshop%20with%20beautiful%20dresses%20on%20mannequins%20warm%20ambient%20light%20sophisticated%20atmosphere%20dark%20moody%20cinematic%20photography&width=1920&height=1080&seq=hero-bg-v3-001&orientation=landscape"
            alt="خلفية"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-blue-950/95 via-blue-950/80 to-blue-950/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-transparent to-blue-950/40"></div>
        </div>

        {/* Animated blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 blob" style={{filter:'blur(60px)'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/10 blob" style={{filter:'blur(50px)',animationDelay:'3s'}}></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)',backgroundSize:'60px 60px'}}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div className="slide-up">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" style={{animation:'pulse 1.5s ease-in-out infinite'}}></div>
                <span className="text-cyan-300 text-sm font-medium">نظام إدارة الجيل القادم</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6 text-white">
                أدِر أتيليهك
                <br />
                <span className="shimmer-text">بذكاء وفخامة</span>
                <br />
                <span className="text-white/90">لا مثيل له</span>
              </h1>

              <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-lg">
                منصة متكاملة تجمع الموردين، العملاء، المخزون، الفواتير، المحاسبة، والتقارير في نظام واحد سهل وقوي — صُمِّم خصيصاً لأتيليهات التفصيل والأزياء الراقية.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <button onClick={() => scrollTo('contact')}
                  className="group relative bg-gradient-to-l from-blue-900 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 whitespace-nowrap cursor-pointer">
                  <span className="relative z-10">ابدأ تجربتك المجانية</span>
                  <div className="absolute inset-0 bg-gradient-to-l from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button onClick={() => scrollTo('features')}
                  className="glass text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/15 transition-all duration-300 whitespace-nowrap cursor-pointer">
                  <i className="ri-play-circle-line ml-2"></i>
                  شاهد كيف يعمل
                </button>
              </div>

              {/* Mini stats */}
              <div className="flex gap-8">
                {[['500+','أتيليه'],['98%','رضا العملاء'],['50%','توفير الوقت']].map(([num, label]) => (
                  <div key={label}>
                    <div className="text-2xl font-black text-white">{num}</div>
                    <div className="text-white/50 text-sm">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Dashboard mockup */}
            <div className="relative float hidden lg:block">
              <div className="relative">
                {/* Glow */}
                <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-3xl scale-110"></div>
                <div className="relative glass rounded-3xl overflow-hidden glow-blue">
                  <img
                    src="https://readdy.ai/api/search-image?query=modern%20elegant%20software%20dashboard%20UI%20design%20with%20dark%20navy%20blue%20background%20showing%20sales%20charts%20inventory%20graphs%20order%20management%20cards%20with%20glowing%20blue%20accents%20data%20visualization%20beautiful%20professional%20SaaS%20interface%20Arabic%20RTL%20layout&width=700&height=500&seq=hero-dash-v3-002&orientation=landscape"
                    alt="لوحة تحكم DressnMore"
                    className="w-full h-auto object-cover"
                  />
                  {/* Overlay badges */}
                  <div className="absolute top-4 left-4 glass rounded-xl px-3 py-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white text-xs font-medium">مباشر الآن</span>
                  </div>
                  <div className="absolute bottom-4 right-4 glass rounded-xl px-3 py-2">
                    <div className="text-cyan-300 text-xs font-bold">+24% هذا الشهر</div>
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute -right-6 top-1/3 glass-dark rounded-2xl p-4 shadow-2xl" style={{animation:'float 3s ease-in-out infinite',animationDelay:'0.5s'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded-xl">
                      <i className="ri-shopping-bag-line text-blue-400 text-lg"></i>
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">طلب جديد</div>
                      <div className="text-white/50 text-xs">فستان سهرة - سارة أحمد</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-6 bottom-1/3 glass-dark rounded-2xl p-4 shadow-2xl" style={{animation:'float 3.5s ease-in-out infinite',animationDelay:'1s'}}>
                  <div className="text-white/60 text-xs mb-1">إيرادات اليوم</div>
                  <div className="text-2xl font-black text-white">12,450 <span className="text-sm text-cyan-400">ر.س</span></div>
                  <div className="text-green-400 text-xs mt-1">↑ 18% عن أمس</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer" onClick={() => scrollTo('features')}>
          <span className="text-white/40 text-xs">اكتشف المزيد</span>
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" style={{animation:'float 1.5s ease-in-out infinite'}}></div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES INTERACTIVE ===== */}
      <section id="features" className="py-28 bg-white hero-bg">
        <div className="max-w-7xl mx-auto px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-5 py-2 mb-6">
              <i className="ri-star-line text-blue-600 text-sm"></i>
              <span className="text-blue-700 text-sm font-semibold">لماذا DressnMore؟</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              كل ما يحتاجه أتيليهك
              <br />
              <span className="text-gradient">في مكان واحد</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">ست وحدات متكاملة تغطي كل جانب من جوانب إدارة أتيليهك باحترافية تامة</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Tabs */}
            <AnimatedSection className="space-y-3">
              {features.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  className={`w-full text-right p-5 rounded-2xl transition-all duration-400 cursor-pointer feature-tab ${activeFeature === i ? 'active' : 'bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 ${activeFeature === i ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                      <i className={`${f.icon} text-2xl ${activeFeature === i ? 'text-white' : 'text-blue-600'}`}></i>
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold text-lg ${activeFeature === i ? 'text-white' : 'text-gray-800'}`}>{f.title}</div>
                      {activeFeature === i && <div className="text-white/80 text-sm mt-1 leading-relaxed">{f.desc}</div>}
                    </div>
                    <i className={`ri-arrow-left-s-line text-xl ${activeFeature === i ? 'text-white' : 'text-gray-400'}`}></i>
                  </div>
                </button>
              ))}
            </AnimatedSection>

            {/* Visual */}
            <AnimatedSection delay={0.2} className="sticky top-24">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl glow-blue">
                <img
                  src={[
                    'https://readdy.ai/api/search-image?query=inventory%20management%20software%20interface%20showing%20fabric%20rolls%20stock%20levels%20categories%20with%20beautiful%20charts%20and%20data%20visualization%20dark%20navy%20blue%20elegant%20UI%20professional%20atelier%20system%20modern%20design&width=700&height=550&seq=feat-inv-v3-010&orientation=landscape',
                    'https://readdy.ai/api/search-image?query=customer%20relationship%20management%20CRM%20interface%20showing%20client%20profiles%20orders%20history%20measurements%20elegant%20dark%20blue%20UI%20with%20beautiful%20cards%20and%20timeline%20professional%20fashion%20atelier%20software&width=700&height=550&seq=feat-crm-v3-011&orientation=landscape',
                    'https://readdy.ai/api/search-image?query=professional%20invoice%20billing%20system%20interface%20showing%20elegant%20invoice%20templates%20payment%20tracking%20dark%20navy%20blue%20UI%20with%20beautiful%20typography%20and%20data%20tables%20fashion%20atelier%20management&width=700&height=550&seq=feat-inv2-v3-012&orientation=landscape',
                    'https://readdy.ai/api/search-image?query=analytics%20dashboard%20with%20beautiful%20charts%20graphs%20KPI%20cards%20revenue%20trends%20dark%20navy%20blue%20elegant%20UI%20data%20visualization%20professional%20business%20intelligence%20fashion%20atelier%20reporting&width=700&height=550&seq=feat-rep-v3-013&orientation=landscape',
                    'https://readdy.ai/api/search-image?query=multi-branch%20management%20system%20interface%20showing%20branch%20locations%20inventory%20transfer%20workflow%20dark%20navy%20blue%20elegant%20UI%20professional%20fashion%20atelier%20management%20software&width=700&height=550&seq=feat-branch-v3-014&orientation=landscape',
                    'https://readdy.ai/api/search-image?query=accounting%20finance%20management%20interface%20showing%20income%20expenses%20profit%20loss%20charts%20dark%20navy%20blue%20elegant%20UI%20professional%20financial%20dashboard%20fashion%20atelier%20software&width=700&height=550&seq=feat-acc-v3-015&orientation=landscape',
                  ][activeFeature]}
                  alt={features[activeFeature].title}
                  className="w-full h-96 object-cover object-top transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 right-0 left-0 p-6">
                  <div className={`inline-flex items-center gap-2 bg-gradient-to-l ${features[activeFeature].color} rounded-full px-4 py-2 mb-3`}>
                    <i className={`${features[activeFeature].icon} text-white text-sm`}></i>
                    <span className="text-white text-sm font-bold">{features[activeFeature].title}</span>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">{features[activeFeature].desc}</p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <div className="section-divider mx-16"></div>

      {/* ===== MODULES GRID ===== */}
      <section id="modules" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-5 py-2 mb-6">
              <i className="ri-apps-line text-blue-600 text-sm"></i>
              <span className="text-blue-700 text-sm font-semibold">وحدات النظام</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              12 وحدة متكاملة
              <br />
              <span className="text-gradient">تغطي كل شيء</span>
            </h2>
            <p className="text-gray-500 text-lg">من الموردين إلى التقارير — كل ما تحتاجه في نظام واحد</p>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {modules.map((m, i) => (
              <AnimatedSection key={i} delay={i * 0.05}>
                <div className="module-card border-gradient rounded-2xl p-6 text-center cursor-pointer card-hover group">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl group-hover:from-blue-600 group-hover:to-cyan-500 transition-all duration-300">
                    <i className={`${m.icon} module-icon text-3xl text-blue-600 group-hover:text-white transition-colors duration-300`}></i>
                  </div>
                  <div className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">{m.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SHOWCASE ===== */}
      <section className="py-28 bg-gradient-to-b from-blue-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 25% 25%, rgba(59,130,246,0.4) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(14,165,233,0.3) 0%, transparent 50%)'}}></div>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)',backgroundSize:'40px 40px'}}></div>

        <div className="relative max-w-7xl mx-auto px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">
              واجهة تبهر الأنظار
              <br />
              <span className="shimmer-text">وتسهّل العمل</span>
            </h2>
            <p className="text-white/60 text-lg">مصممة بعناية لتكون سهلة وسريعة وجميلة في آنٍ واحد</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { img: 'https://readdy.ai/api/search-image?query=beautiful%20dark%20dashboard%20showing%20sales%20orders%20list%20with%20status%20badges%20customer%20names%20amounts%20elegant%20navy%20blue%20UI%20with%20glowing%20accents%20professional%20fashion%20atelier%20management%20software%20modern%20design&width=500&height=400&seq=showcase-orders-v3-020&orientation=landscape', title: 'إدارة الطلبات', desc: 'متابعة كل طلب من البداية للتسليم', span: 'md:col-span-2' },
              { img: 'https://readdy.ai/api/search-image?query=elegant%20dark%20inventory%20stock%20management%20interface%20showing%20fabric%20categories%20with%20beautiful%20icons%20and%20quantities%20navy%20blue%20glowing%20UI%20professional%20atelier%20system%20compact%20view&width=400&height=400&seq=showcase-stock-v3-021&orientation=squarish', title: 'المخزون الذكي', desc: 'تنبيهات فورية ومتابعة دقيقة', span: '' },
              { img: 'https://readdy.ai/api/search-image?query=professional%20dark%20invoice%20creation%20interface%20showing%20elegant%20invoice%20template%20with%20items%20prices%20totals%20navy%20blue%20UI%20beautiful%20typography%20professional%20fashion%20atelier%20billing%20system&width=400&height=400&seq=showcase-bill-v3-022&orientation=squarish', title: 'الفواتير الاحترافية', desc: 'إصدار فواتير بضغطة واحدة', span: '' },
              { img: 'https://readdy.ai/api/search-image?query=stunning%20analytics%20dashboard%20dark%20navy%20blue%20showing%20revenue%20charts%20profit%20graphs%20KPI%20cards%20with%20glowing%20blue%20accents%20beautiful%20data%20visualization%20professional%20fashion%20atelier%20reporting%20system&width=500&height=400&seq=showcase-analytics-v3-023&orientation=landscape', title: 'تقارير وتحليلات', desc: 'قرارات مدروسة بناءً على بيانات حقيقية', span: 'md:col-span-2' },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.1} className={item.span}>
                <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-64 card-hover">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/30 to-transparent"></div>
                  <div className="absolute bottom-0 right-0 left-0 p-5">
                    <h3 className="text-white font-bold text-lg">{item.title}</h3>
                    <p className="text-white/60 text-sm">{item.desc}</p>
                  </div>
                  <div className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center glass rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <i className="ri-zoom-in-line text-white text-sm"></i>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section id="stats" className="py-28 bg-white hero-bg">
        <div className="max-w-7xl mx-auto px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              أرقام تتحدث
              <br />
              <span className="text-gradient">عن نفسها</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[
              { end: 500, suffix: '+', label: 'أتيليه يثق بنا', icon: 'ri-store-2-line', color: 'from-blue-600 to-cyan-500' },
              { end: 98, suffix: '%', label: 'رضا العملاء', icon: 'ri-heart-line', color: 'from-cyan-500 to-blue-600' },
              { end: 50, suffix: '%', label: 'توفير في الوقت', icon: 'ri-time-line', color: 'from-blue-700 to-blue-500' },
              { end: 30, suffix: ' يوم', label: 'تجربة مجانية', icon: 'ri-gift-line', color: 'from-sky-500 to-blue-600' },
            ].map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="border-gradient rounded-3xl p-8 text-center card-hover cursor-default">
                  <div className={`w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${s.color} rounded-2xl shadow-lg`}>
                    <i className={`${s.icon} text-white text-2xl`}></i>
                  </div>
                  <div className="text-5xl font-black text-gray-900 mb-2">
                    <Counter end={s.end} suffix={s.suffix} />
                  </div>
                  <div className="text-gray-500 font-medium">{s.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Strengths */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'ri-speed-line', title: 'سرعة استثنائية', desc: 'نظام خفيف وسريع الاستجابة يوفر ساعات من العمل اليومي ويرفع إنتاجية فريقك بشكل ملحوظ' },
              { icon: 'ri-shield-check-line', title: 'أمان وحماية تامة', desc: 'تشفير عالي المستوى ونسخ احتياطي تلقائي يومي لحماية بيانات أتيليهك من أي خطر' },
              { icon: 'ri-smartphone-line', title: 'يعمل على كل الأجهزة', desc: 'استخدم النظام من الكمبيوتر أو التابلت أو الهاتف بنفس الكفاءة والسهولة في أي وقت' },
              { icon: 'ri-customer-service-2-line', title: 'دعم فني 24/7', desc: 'فريق دعم متخصص متاح على مدار الساعة لمساعدتك وحل أي مشكلة في أسرع وقت ممكن' },
              { icon: 'ri-refresh-line', title: 'تحديثات مستمرة', desc: 'نضيف ميزات جديدة باستمرار بناءً على احتياجات عملائنا دون أي تكلفة إضافية' },
              { icon: 'ri-money-dollar-circle-line', title: 'أسعار تنافسية', desc: 'باقات مرنة تناسب جميع أحجام الأتيليهات بأسعار عادلة مع تجربة مجانية 30 يوماً' },
            ].map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <div className="group bg-white rounded-2xl p-7 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 card-hover cursor-default">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-50 group-hover:bg-blue-600 rounded-xl mb-5 transition-colors duration-300">
                    <i className={`${s.icon} text-2xl text-blue-600 group-hover:text-white transition-colors duration-300`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">{s.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <AnimatedSection>
            <div className="relative rounded-3xl overflow-hidden">
              <img
                src="https://readdy.ai/api/search-image?query=elegant%20luxury%20fashion%20atelier%20showroom%20with%20beautiful%20dresses%20on%20display%20golden%20lighting%20sophisticated%20interior%20design%20high-end%20boutique%20atmosphere%20professional%20photography%20wide%20angle&width=1400&height=500&seq=cta-banner-v3-030&orientation=landscape"
                alt="أتيليه فاخر"
                className="w-full h-80 object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-blue-950/95 via-blue-950/70 to-transparent"></div>
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-12 w-full">
                  <div className="max-w-xl mr-auto">
                    <h2 className="text-4xl font-black text-white mb-4 leading-tight">
                      حوّل أتيليهك إلى
                      <br />
                      <span className="shimmer-text">مشروع رقمي ناجح</span>
                    </h2>
                    <p className="text-white/70 mb-6">ابدأ تجربتك المجانية لمدة 30 يوماً — بدون بطاقة ائتمانية</p>
                    <button onClick={() => scrollTo('contact')}
                      className="bg-white text-blue-900 px-8 py-3.5 rounded-2xl font-black hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-xl whitespace-nowrap cursor-pointer">
                      ابدأ الآن مجاناً
                      <i className="ri-arrow-left-line mr-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="py-28 bg-gradient-to-b from-blue-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.5) 0%, transparent 50%)'}}></div>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)',backgroundSize:'40px 40px'}}></div>

        <div className="relative max-w-6xl mx-auto px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-6">
              <i className="ri-message-3-line text-cyan-400 text-sm"></i>
              <span className="text-cyan-300 text-sm font-semibold">تواصل معنا</span>
            </div>
            <h2 className="text-5xl font-black text-white mb-4">
              هل أنت مستعد للانطلاق؟
              <br />
              <span className="shimmer-text">نحن هنا لمساعدتك</span>
            </h2>
            <p className="text-white/60 text-lg">تواصل معنا الآن وسيرد عليك فريقنا خلال ساعات</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Info */}
            <AnimatedSection className="lg:col-span-2 space-y-6">
              {[
                { icon: 'ri-phone-line', title: 'اتصل بنا', val: '+966 50 000 0000' },
                { icon: 'ri-mail-line', title: 'البريد الإلكتروني', val: 'info@dressnmore.com' },
                { icon: 'ri-map-pin-line', title: 'الموقع', val: 'الرياض، المملكة العربية السعودية' },
                { icon: 'ri-time-line', title: 'ساعات العمل', val: 'الأحد - الخميس، 9ص - 6م' },
              ].map((item, i) => (
                <div key={i} className="glass rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-500/20 rounded-xl flex-shrink-0">
                    <i className={`${item.icon} text-blue-400 text-xl`}></i>
                  </div>
                  <div>
                    <div className="text-white/50 text-xs mb-1">{item.title}</div>
                    <div className="text-white font-semibold text-sm">{item.val}</div>
                  </div>
                </div>
              ))}

              <div className="glass rounded-2xl p-5">
                <div className="text-white/50 text-xs mb-3">تابعنا على</div>
                <div className="flex gap-3">
                  {[['ri-facebook-fill','#'],['ri-instagram-line','#'],['ri-twitter-x-line','#'],['ri-linkedin-fill','#']].map(([icon, href], i) => (
                    <a key={i} href={href} rel="nofollow" className="w-10 h-10 flex items-center justify-center glass rounded-xl hover:bg-blue-500/30 transition-all duration-300 cursor-pointer">
                      <i className={`${icon} text-white/70 hover:text-white`}></i>
                    </a>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Form */}
            <AnimatedSection delay={0.2} className="lg:col-span-3">
              <div className="glass rounded-3xl p-8">
                {formStatus === 'success' ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 flex items-center justify-center bg-green-500/20 rounded-full mx-auto mb-6">
                      <i className="ri-check-line text-green-400 text-4xl"></i>
                    </div>
                    <h3 className="text-white text-2xl font-bold mb-3">تم الإرسال بنجاح!</h3>
                    <p className="text-white/60">سيتواصل معك فريقنا في أقرب وقت ممكن</p>
                    <button onClick={() => setFormStatus('idle')} className="mt-6 glass text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 whitespace-nowrap cursor-pointer">
                      إرسال رسالة أخرى
                    </button>
                  </div>
                ) : (
                  <form id="contact-form-main" data-readdy-form action="https://readdy.ai/api/form/d6lgctp4a3uojp5fgbhg" method="POST" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">الاسم الكامل</label>
                        <input type="text" name="name" required placeholder="أدخل اسمك"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400 transition-colors duration-300 text-sm" />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">البريد الإلكتروني</label>
                        <input type="email" name="email" required placeholder="example@email.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400 transition-colors duration-300 text-sm" />
                      </div>
                    </div>
                    <div className="mb-5">
                      <label className="block text-white/70 text-sm mb-2">رقم الهاتف</label>
                      <input type="tel" name="phone" required placeholder="+966 XX XXX XXXX"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400 transition-colors duration-300 text-sm" />
                    </div>
                    <div className="mb-5">
                      <label className="block text-white/70 text-sm mb-2">اسم الأتيليه</label>
                      <input type="text" name="atelier_name" placeholder="اسم أتيليهك"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400 transition-colors duration-300 text-sm" />
                    </div>
                    <div className="mb-6">
                      <label className="block text-white/70 text-sm mb-2">رسالتك <span className="text-white/30">({msgLen}/500)</span></label>
                      <textarea name="message" rows={4} required maxLength={500}
                        onChange={e => setMsgLen(e.target.value.length)}
                        placeholder="كيف يمكننا مساعدتك؟"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400 transition-colors duration-300 resize-none text-sm"></textarea>
                    </div>
                    {formStatus === 'error' && (
                      <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                        حدث خطأ أثناء الإرسال. الرجاء المحاولة مرة أخرى.
                      </div>
                    )}
                    <button type="submit" disabled={formStatus === 'sending'}
                      className="w-full bg-gradient-to-l from-blue-900 to-blue-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 whitespace-nowrap cursor-pointer">
                      {formStatus === 'sending' ? (
                        <span className="flex items-center justify-center gap-2">
                          <i className="ri-loader-4-line animate-spin"></i>
                          جاري الإرسال...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <i className="ri-send-plane-line"></i>
                          أرسل رسالتك الآن
                        </span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-950 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl overflow-hidden bg-white">
                <img src="/dressnmore-logo.jpg" alt="DressnMore" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-black text-xl">DressnMore</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-white/40 text-sm">
              {[['features','المميزات'],['modules','الوحدات'],['stats','نقاط القوة'],['contact','تواصل معنا']].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)} className="hover:text-white transition-colors duration-300 cursor-pointer whitespace-nowrap">{label}</button>
              ))}
            </div>
            <div className="text-white/30 text-sm">© 2025 DressnMore. جميع الحقوق محفوظة</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

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

const supportAgents = [
  { name: 'أسامة', avatar: 'ri-user-smile-line', color: 'from-blue-900 to-blue-600', status: 'متاح الآن' },
  { name: 'محمد', avatar: 'ri-user-3-line', color: 'from-blue-800 to-cyan-600', status: 'متاح الآن' },
  { name: 'عبدالله', avatar: 'ri-user-4-line', color: 'from-blue-700 to-cyan-500', status: 'متاح الآن' },
  { name: 'جمال', avatar: 'ri-user-6-line', color: 'from-cyan-700 to-blue-600', status: 'متاح الآن' },
];

type ChatMessage = {
  id: number;
  from: 'agent' | 'user';
  text: string;
  time: string;
  image?: string;
};

const quickReplies = [
  'ما هي مميزات النظام؟',
  'كيف أبدأ التجربة المجانية؟',
  'ما هي أسعار الباقات؟',
  'هل يدعم أكثر من فرع؟',
  'كيف أتواصل مع الدعم؟',
];

const systemKnowledge: Record<string, { text: string; image?: string }> = {
  مميزات: {
    text: 'نظام DressnMore يتضمن 6 وحدات رئيسية:\n\n📦 إدارة المخزون الذكية\n👥 إدارة العملاء والطلبات\n🧾 فواتير البيع والتفصيل والإيجار\n📊 تقارير وتحليلات متقدمة\n🏢 إدارة الفروع والمصنع والورشة\n💰 محاسبة شاملة ودقيقة',
    image: 'https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/482a24bff8ccd07c9bbb37c4908e873a.png',
  },
  تجربة: {
    text: 'يمكنك البدء بتجربة مجانية لمدة 30 يوماً دون الحاجة لبطاقة ائتمانية! 🎉\n\nفقط تواصل معنا عبر نموذج التواصل أو واتساب وسنفعّل حسابك فوراً.',
  },
  سعر: {
    text: 'لدينا باقات مرنة تناسب جميع أحجام الأتليهات:\n\n🥉 الباقة الأساسية — للأتلييه الصغير\n🥈 الباقة المتوسطة — للأتلييه المتوسط\n🥇 الباقة المتقدمة — للسلاسل والفروع المتعددة\n\nللحصول على عرض سعر مخصص، تواصل معنا مباشرة عبر واتساب: 00201070205189',
  },
  فرع: {
    text: 'نعم! النظام يدعم إدارة فروع متعددة من لوحة تحكم واحدة 🏢\n\nيمكنك:\n• متابعة مخزون كل فرع\n• نقل المخزون بين الفروع\n• تقارير مجمّعة أو منفصلة لكل فرع\n• توزيع المهام على الورش والمصانع',
    image: 'https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/4834854d4f47bf1db0a317f231132518.png',
  },
  تواصل: {
    text: 'يمكنك التواصل معنا عبر:\n\n📱 واتساب: 00201070205189\n📧 البريد: info@dressnmore.com\n📞 الهاتف: +966 50 000 0000\n\nفريق الدعم متاح الأحد - الخميس من 9 ص إلى 6 م، وللطوارئ على مدار الساعة.',
  },
  مخزون: {
    text: 'وحدة إدارة المخزون تتيح لك:\n\n✅ تتبع الأقمشة والإكسسوارات\n✅ تنبيهات فورية عند نفاد المخزون\n✅ تقارير تفصيلية لكل صنف\n✅ إدارة الموردين والمشتريات\n✅ باركود وQR code لكل منتج',
    image: 'https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/6c27cc7796a645a89f615ca4cf7a14be.png',
  },
  فاتور: {
    text: 'نظام الفواتير يدعم 3 أنواع:\n\n🛍️ فواتير البيع — للمنتجات الجاهزة\n✂️ فواتير التفصيل — للطلبات المخصصة\n👗 فواتير الإيجار — لتأجير الأزياء\n\nجميع الفواتير احترافية وقابلة للطباعة والإرسال.',
    image: 'https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/f44f7f55d012272bf67908e7230bef30.png',
  },
  محاسب: {
    text: 'الوحدة المحاسبية تشمل:\n\n💰 تتبع الإيرادات والمصروفات\n📈 تقارير الأرباح والخسائر\n💳 إدارة المدفوعات والمستحقات\n📊 ميزانية عمومية دقيقة\n🔄 تسوية الحسابات تلقائيًا',
    image: 'https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/7539631401d90b49d2e87f43a7bc1fbe.png',
  },
};

function getAutoReply(text: string): { text: string; image?: string } {
  const lower = text.toLowerCase();
  for (const key of Object.keys(systemKnowledge)) {
    if (lower.includes(key)) return systemKnowledge[key];
  }
  if (lower.includes('مرحب') || lower.includes('هلا') || lower.includes('السلام')) {
    return { text: 'أهلاً وسهلاً! 😊 كيف يمكنني مساعدتك اليوم؟\n\nيمكنني إخبارك عن مميزات النظام، الأسعار، التجربة المجانية، أو أي استفسار آخر.' };
  }
  if (lower.includes('شكر')) {
    return { text: 'العفو! 🙏 يسعدنا دائماً خدمتك. هل هناك شيء آخر يمكنني مساعدتك به؟' };
  }
  return {
    text: 'شكراً على تواصلك! 😊\n\nللحصول على إجابة أدق، يمكنك:\n• اختيار أحد الأسئلة السريعة أدناه\n• أو التواصل مباشرة على واتساب: 00201070205189\n\nفريقنا سعيد بمساعدتك في أي وقت.',
  };
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [msgLen, setMsgLen] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showWhatsAppTooltip, setShowWhatsAppTooltip] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const getNow = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const startChat = () => {
    setChatStarted(true);
    const agent = supportAgents[Math.floor(Math.random() * supportAgents.length)];
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages([
        {
          id: 1,
          from: 'agent',
          text: `مرحباً! أنا ${agent.name} من فريق دعم DressnMore 👋\n\nيسعدني مساعدتك اليوم. كيف يمكنني خدمتك؟`,
          time: getNow(),
        },
      ]);
    }, 1200);
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now(), from: 'user', text: text.trim(), time: getNow() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);
    setTimeout(() => {
      const reply = getAutoReply(text);
      setIsTyping(false);
      setChatMessages(prev => [...prev, { id: Date.now() + 1, from: 'agent', text: reply.text, time: getNow(), image: reply.image }]);
    }, 1000 + Math.random() * 800);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(chatInput);
  };

  const toggleChat = () => {
    if (showChat) {
      setShowChat(false);
      setTimeout(() => {
        setChatStarted(false);
        setChatMessages([]);
        setChatInput('');
        setIsTyping(false);
      }, 300);
    } else {
      setShowChat(true);
    }
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
        body: new URLSearchParams(data as any).toString(),
      });
      if (res.ok) { setFormStatus('success'); form.reset(); setMsgLen(0); }
      else setFormStatus('error');
    } catch { setFormStatus('error'); }
  };

  const features = [
    { icon: 'ri-archive-2-line', title: 'إدارة المخزون الذكية', desc: 'تتبع الأقمشة والإكسسوارات والمنتجات الجاهزة مع تنبيهات فورية عند نفاد المخزون وتقارير تفصيلية لكل صنف', color: 'from-cyan-500 to-blue-600', img: 'https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/6c27cc7796a645a89f615ca4cf7a14be.png' },
    { icon: 'ri-user-heart-line', title: 'إدارة العملاء والطلبات', desc: 'سجل شامل لكل عميل مع تاريخ طلباته ومقاساته وتفضيلاته ومتابعة حالة كل طلب لحظة بلحظة', color: 'from-blue-500 to-indigo-600', img: 'https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/4834854d4f47bf1db0a317f231132518.png' },
    { icon: 'ri-file-list-3-line', title: 'فواتير البيع والتفصيل والإيجار', desc: 'إصدار فواتير احترافية بأنواعها الثلاثة مع خيارات دفع متعددة وتتبع المدفوعات والمستحقات', color: 'from-indigo-500 to-violet-600', img: 'https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/f44f7f55d012272bf67908e7230bef30.png' },
    { icon: 'ri-bar-chart-box-line', title: 'تقارير وتحليلات متقدمة', desc: 'لوحة تحكم ذكية بمؤشرات الأداء الرئيسية وتقارير المبيعات والأرباح والمخزون بصرياً', color: 'from-sky-500 to-blue-600', img: 'https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/482a24bff8ccd07c9bbb37c4908e873a.png' },
    { icon: 'ri-building-4-line', title: 'إدارة الفروع والمصنع والورشة', desc: 'تنسيق سلس بين جميع الفروع مع نقل المخزون وتوزيع المهام وتتبع الإنتاج في الوقت الفعلي', color: 'from-blue-600 to-cyan-500', img: 'https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/4834854d4f47bf1db0a317f231132518.png' },
    { icon: 'ri-wallet-3-line', title: 'محاسبة شاملة ودقيقة', desc: 'نظام محاسبي متكامل لتتبع الإيرادات والمصروفات والأرباح مع تقارير مالية احترافية', color: 'from-teal-500 to-blue-500', img: 'https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/7539631401d90b49d2e87f43a7bc1fbe.png' },
  ];

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

  const faqs = [
    { q: 'هل يمكنني تجربة النظام قبل الشراء؟', a: 'نعم! نوفر تجربة مجانية كاملة لمدة 30 يوماً بدون الحاجة لبطاقة ائتمانية. ستتمكن من الوصول إلى جميع الميزات خلال فترة التجربة.' },
    { q: 'هل النظام مناسب لأتيليه صغير؟', a: 'بالتأكيد! صممنا DressnMore ليناسب جميع أحجام الأتيليهات، من الأتيليه الصغير ذو الموظف الواحد حتى السلاسل الكبيرة متعددة الفروع. لدينا باقات مرنة تناسب كل حجم.' },
    { q: 'هل بياناتي آمنة على النظام؟', a: 'أمان بياناتك أولويتنا القصوى. نستخدم تشفيراً من الدرجة المصرفية، ونقوم بنسخ احتياطي تلقائي يومي لجميع البيانات على خوادم آمنة ومتعددة.' },
    { q: 'هل يمكن استخدام النظام على الهاتف المحمول؟', a: 'نعم، النظام متوافق تماماً مع جميع الأجهزة — الكمبيوتر، التابلت، والهاتف الذكي. يمكنك إدارة أتيليهك من أي مكان وفي أي وقت.' },
    { q: 'كم يستغرق تدريب الفريق على النظام؟', a: 'صممنا النظام ليكون بسيطاً وسهل الاستخدام. معظم المستخدمين يتقنون النظام خلال يوم إلى يومين. كما نوفر فيديوهات تدريبية ودعماً مباشراً من فريقنا.' },
    { q: 'هل يدعم النظام أكثر من فرع؟', a: 'نعم، يدعم النظام إدارة فروع متعددة من لوحة تحكم واحدة. يمكنك متابعة المخزون، الطلبات، والتقارير لكل فرع بشكل منفصل أو مجمّع.' },
    { q: 'ما هي طرق الدفع المتاحة للاشتراك؟', a: 'نقبل جميع بطاقات الائتمان والخصم الرئيسية (Visa, Mastercard)، بالإضافة إلى التحويل البنكي وبعض محافظ الدفع الإلكتروني المتاحة في منطقتك.' },
    { q: 'هل يمكنني إلغاء الاشتراك في أي وقت؟', a: 'نعم، يمكنك إلغاء اشتراكك في أي وقت دون أي رسوم إضافية أو التزامات. بياناتك ستبقى متاحة لك لمدة 30 يوماً بعد الإلغاء لتتمكن من تصديرها.' },
  ];

  const currentAgent = supportAgents[0];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir="rtl">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.8);opacity:0} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes gradient-x { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes slide-up { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-green { 0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.7)} 50%{box-shadow:0 0 0 15px rgba(37,211,102,0)} }
        @keyframes chat-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .float { animation: float 4s ease-in-out infinite; }
        .shimmer-text { background: linear-gradient(90deg, #1e40af, #0ea5e9, #1e40af); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 3s linear infinite; }
        .gradient-animate { background-size: 200% 200%; animation: gradient-x 4s ease infinite; }
        .slide-up { animation: slide-up 0.6s ease forwards; }
        .glass { background: rgba(255,255,255,0.08); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.15); }
        .glass-dark { background: rgba(15,23,42,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .card-hover { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .card-hover:hover { transform: translateY(-8px) scale(1.02); }
        .glow-blue { box-shadow: 0 0 40px rgba(59,130,246,0.3); }
        .text-gradient { background: linear-gradient(135deg, #1e3a8a, #0ea5e9, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .border-gradient { border: 1px solid transparent; background: linear-gradient(white,white) padding-box, linear-gradient(135deg,#3b82f6,#0ea5e9) border-box; }
        .module-card:hover .module-icon { transform: scale(1.2) rotate(10deg); }
        .module-icon { transition: transform 0.3s ease; }
        .hero-bg { background: radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(14,165,233,0.06) 0%, transparent 50%); }
        .section-divider { background: linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent); height: 1px; }
        .feat-card { position: relative; overflow: hidden; border-radius: 24px; cursor: pointer; }
        .feat-card img { transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94); }
        .feat-card:hover img { transform: scale(1.08); }
        .feat-card .feat-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,20,50,0.92) 0%, rgba(10,20,50,0.5) 50%, rgba(10,20,50,0.15) 100%); transition: background 0.4s ease; }
        .feat-card:hover .feat-overlay { background: linear-gradient(to top, rgba(10,20,50,0.97) 0%, rgba(10,20,50,0.65) 55%, rgba(10,20,50,0.25) 100%); }
        .feat-card .feat-desc { max-height: 0; overflow: hidden; transition: max-height 0.5s ease, opacity 0.4s ease; opacity: 0; }
        .feat-card:hover .feat-desc { max-height: 80px; opacity: 1; }
        .feat-card .feat-icon-wrap { transition: transform 0.4s ease; }
        .feat-card:hover .feat-icon-wrap { transform: scale(1.15); }
        .whatsapp-btn { animation: pulse-green 2s infinite; }
        .whatsapp-btn:hover { animation: none; }
        .chat-msg { animation: chat-in 0.3s ease forwards; }
      `}</style>

      {/* ===== NAVBAR ===== */}
      <nav className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-blue-100/50' : 'bg-transparent'}`}>
        <div className="mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('hero')}>
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 to-blue-500 shadow-lg">
                <i className="ri-scissors-cut-line text-white text-xl"></i>
              </div>
              <span className={`text-2xl font-black tracking-tight ${isScrolled ? 'text-gradient' : 'text-white'}`}>DressnMore</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {[['hero','الرئيسية'],['features','المميزات'],['modules','الوحدات'],['stats','الإحصائيات'],['faq','الأسئلة الشائعة'],['contact','تواصل معنا']].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${isScrolled ? 'text-gray-600 hover:text-blue-700 hover:bg-blue-50' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                  {label}
                </button>
              ))}
              <button onClick={() => navigate('/about')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${isScrolled ? 'text-gray-600 hover:text-blue-700 hover:bg-blue-50' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                من نحن
              </button>
              <button onClick={() => navigate('/terms')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${isScrolled ? 'text-gray-600 hover:text-blue-700 hover:bg-blue-50' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                شروط الخدمة
              </button>
              <button onClick={() => navigate('/privacy')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${isScrolled ? 'text-gray-600 hover:text-blue-700 hover:bg-blue-50' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                سياسة الخصوصية
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/login')}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${isScrolled ? 'text-blue-700 hover:bg-blue-50' : 'text-white hover:bg-white/10'}`}>
                <i className="ri-login-circle-line ml-1"></i>
                تسجيل الدخول
              </button>
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
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=luxurious%20high-end%20fashion%20atelier%20interior%20with%20elegant%20fabric%20rolls%20silk%20textiles%20golden%20lighting%20dramatic%20shadows%20professional%20tailoring%20workshop%20with%20beautiful%20dresses%20on%20mannequins%20warm%20ambient%20light%20sophisticated%20atmosphere%20dark%20moody%20cinematic%20photography&width=1920&height=1080&seq=hero-bg-v3-001&orientation=landscape"
            alt="خلفية"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-blue-950/95 via-blue-950/80 to-blue-950/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-transparent to-blue-950/40"></div>
        </div>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)',backgroundSize:'60px 60px'}}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
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
              <div className="flex gap-8">
                {[['500+','أتيليه'],['98%','رضا العملاء'],['50%','توفير الوقت']].map(([num, label]) => (
                  <div key={label}>
                    <div className="text-2xl font-black text-white">{num}</div>
                    <div className="text-white/50 text-sm">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative float hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-3xl scale-110"></div>
                <div className="relative glass rounded-3xl overflow-hidden glow-blue">
                  <img
                    src="https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/482a24bff8ccd07c9bbb37c4908e873a.png"
                    alt="لوحة تحكم DressnMore"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute top-4 left-4 glass rounded-xl px-3 py-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white text-xs font-medium">مباشر الآن</span>
                  </div>
                  <div className="absolute bottom-4 right-4 glass rounded-xl px-3 py-2">
                    <div className="text-cyan-300 text-xs font-bold">+24% هذا الشهر</div>
                  </div>
                </div>
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

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer" onClick={() => scrollTo('features')}>
          <span className="text-white/40 text-xs">اكتشف المزيد</span>
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" style={{animation:'float 1.5s ease-in-out infinite'}}></div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES — BENTO DESIGN ===== */}
      <section id="features" className="py-28 bg-gradient-to-b from-slate-950 to-blue-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 15% 40%, rgba(59,130,246,0.5) 0%, transparent 45%), radial-gradient(circle at 85% 70%, rgba(14,165,233,0.4) 0%, transparent 45%)'}}></div>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.07) 1px,transparent 1px)',backgroundSize:'50px 50px'}}></div>

        <div className="relative max-w-7xl mx-auto px-8">
          <AnimatedSection className="text-center mb-20">
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2.5 mb-7">
              <i className="ri-star-fill text-cyan-400 text-sm"></i>
              <span className="text-cyan-300 text-sm font-semibold tracking-wide">لماذا DressnMore؟</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
              كل ما تحتاجه لإدارة
              <br />
              <span className="shimmer-text">أتيليهك باحترافية</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
              ست وحدات متكاملة مصممة خصيصاً لأتيليهات التفصيل والأزياء الراقية
            </p>
          </AnimatedSection>

          {/* Row 1: 3 equal cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {[features[0], features[1], features[2]].map((feat, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="feat-card h-80 w-full">
                  <img src={feat.img} alt={feat.title} className="w-full h-full object-cover object-top" />
                  <div className="feat-overlay"></div>
                  <div className="absolute top-4 right-4">
                    <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                      <span className="text-white/80 text-xs font-medium">الوحدة {['الأولى','الثانية','الثالثة'][i]}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 left-0 p-6">
                    <div className={`feat-icon-wrap w-12 h-12 flex items-center justify-center bg-gradient-to-br ${feat.color} rounded-xl mb-3 shadow-lg`}>
                      <i className={`${feat.icon} text-white text-xl`}></i>
                    </div>
                    <h3 className="text-white text-lg font-black mb-1">{feat.title}</h3>
                    <div className="feat-desc">
                      <p className="text-white/70 text-xs leading-relaxed">{feat.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-0.5 w-6 bg-cyan-400 rounded-full"></div>
                      <span className="text-cyan-400 text-xs font-semibold">اكتشف المزيد</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Row 2: wide + narrow */}
          <div className="grid grid-cols-12 gap-5 mb-5">
            <AnimatedSection className="col-span-12 lg:col-span-7" delay={0.3}>
              <div className="feat-card h-72 w-full">
                <img src={features[3].img} alt={features[3].title} className="w-full h-full object-cover object-top" />
                <div className="feat-overlay"></div>
                <div className="absolute inset-0 flex items-end p-7">
                  <div className="flex items-end gap-5 w-full">
                    <div className={`feat-icon-wrap w-14 h-14 flex items-center justify-center bg-gradient-to-br ${features[3].color} rounded-2xl flex-shrink-0 shadow-lg`}>
                      <i className={`${features[3].icon} text-white text-2xl`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 mb-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                        <span className="text-white/80 text-xs font-medium">الوحدة الرابعة</span>
                      </div>
                      <h3 className="text-white text-2xl font-black mb-1">{features[3].title}</h3>
                      <div className="feat-desc">
                        <p className="text-white/65 text-sm leading-relaxed">{features[3].desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection className="col-span-12 lg:col-span-5" delay={0.35}>
              <div className="feat-card h-72 w-full">
                <img src={features[4].img} alt={features[4].title} className="w-full h-full object-cover object-top" />
                <div className="feat-overlay"></div>
                <div className="absolute top-4 right-4">
                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    <span className="text-white/80 text-xs font-medium">الوحدة الخامسة</span>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 left-0 p-6">
                  <div className={`feat-icon-wrap w-12 h-12 flex items-center justify-center bg-gradient-to-br ${features[4].color} rounded-xl mb-3 shadow-lg`}>
                    <i className={`${features[4].icon} text-white text-xl`}></i>
                  </div>
                  <h3 className="text-white text-xl font-black mb-1">{features[4].title}</h3>
                  <div className="feat-desc">
                    <p className="text-white/65 text-xs leading-relaxed">{features[4].desc}</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Row 3: full width */}
          <AnimatedSection delay={0.4}>
            <div className="feat-card h-64 w-full">
              <img src={features[5].img} alt={features[5].title} className="w-full h-full object-cover object-top" />
              <div className="feat-overlay"></div>
              <div className="absolute inset-0 flex items-center justify-between px-10">
                <div className="flex items-center gap-6">
                  <div className={`feat-icon-wrap w-16 h-16 flex items-center justify-center bg-gradient-to-br ${features[5].color} rounded-2xl shadow-xl`}>
                    <i className={`${features[5].icon} text-white text-3xl`}></i>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 mb-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                      <span className="text-white/80 text-xs font-medium">الوحدة السادسة</span>
                    </div>
                    <h3 className="text-white text-3xl font-black mb-2">{features[5].title}</h3>
                    <div className="feat-desc">
                      <p className="text-white/65 text-sm leading-relaxed max-w-lg">{features[5].desc}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-white/40 text-xs mb-1">دقة المحاسبة</div>
                    <div className="text-white text-2xl font-black">99.9%</div>
                  </div>
                  <div className="w-px h-12 bg-white/20"></div>
                  <div className="text-right">
                    <div className="text-white/40 text-xs mb-1">تقارير يومية</div>
                    <div className="text-white text-2xl font-black">24/7</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.45} className="text-center mt-14">
            <button onClick={() => scrollTo('contact')}
              className="inline-flex items-center gap-3 bg-gradient-to-l from-blue-900 to-blue-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 whitespace-nowrap cursor-pointer">
              <i className="ri-rocket-line text-xl"></i>
              ابدأ تجربتك المجانية الآن
            </button>
          </AnimatedSection>
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
              { img: 'https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/4834854d4f47bf1db0a317f231132518.png', title: 'إدارة الطلبات', desc: 'متابعة كل طلب من البداية حتى التسليم بدقة تامة', span: 'md:col-span-2' },
              { img: 'https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/f44f7f55d012272bf67908e7230bef30.png', title: 'قائمة الفواتير', desc: 'عرض وإدارة جميع الفواتير في مكان واحد', span: '' },
              { img: 'https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/6c27cc7796a645a89f615ca4cf7a14be.png', title: 'إدارة المنتجات والمخزون', desc: 'تنبيهات فورية ومتابعة دقيقة لكل صنف', span: '' },
              { img: 'https://static.readdy.ai/image/dd76bd9e94ab1e595fa3cdea807c4d5b/f44f7f55d012272bf67908e7230bef30.png', title: 'فواتير البيع والتفصيل والإيجار', desc: 'إصدار فواتير احترافية بأنواعها الثلاثة بضغطة واحدة', span: 'md:col-span-2' },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.1} className={item.span}>
                <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-64 card-hover">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/30 to-transparent"></div>
                  <div className="absolute bottom-0 right-0 left-0 p-5">
                    <h3 className="text-white font-bold text-lg">{item.title}</h3>
                    <p className="text-white/60 text-sm">{item.desc}</p>
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
              { end: 500, suffix: '+', label: 'أتيليه يثق بنا', icon: 'ri-store-2-line' },
              { end: 98, suffix: '%', label: 'رضا العملاء', icon: 'ri-heart-line' },
              { end: 50, suffix: '%', label: 'توفير في الوقت', icon: 'ri-time-line' },
              { end: 30, suffix: ' يوم', label: 'تجربة مجانية', icon: 'ri-gift-line' },
            ].map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 card-hover cursor-default">
                  <div className="w-14 h-14 flex items-center justify-center bg-blue-50 group-hover:bg-blue-600 rounded-2xl mb-5 transition-colors duration-300">
                    <i className={`${s.icon} text-2xl text-blue-600 group-hover:text-white transition-colors duration-300`}></i>
                  </div>
                  <div className="text-5xl font-black text-gray-900 mb-2">
                    <Counter end={s.end} suffix={s.suffix} />
                  </div>
                  <div className="text-gray-500 font-medium">{s.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'ri-speed-line', title: 'سرعة استثنائية', desc: 'نظام خفيف وسريع الاستجابة يوفر ساعات من العمل اليومي ويرفع إنتاجية فريقك بشكل ملحوظ' },
              { icon: 'ri-shield-check-line', title: 'أمان وحماية تامة', desc: 'تشفير عالي المستوى ونسخ احتياطي تلقائي يومي لحماية بيانات أتيليهك من أي خطر' },
              { icon: 'ri-smartphone-line', title: 'يعمل على كل الأجهزة', desc: 'استخدم النظام من الكمبيوتر أو التابلت أو الهاتف الذكي بنفس الكفاءة والسهولة في أي وقت' },
              { icon: 'ri-customer-service-2-line', title: 'دعم فني 24/7', desc: 'فريق دعم متخصص متاح على مدار الساعة لمساعدتك وحل أي مشكلة في أسرع وقت ممكن' },
              { icon: 'ri-refresh-line', title: 'تحديثات مستمرة', desc: 'نضيف ميزات جديدة باستمرار بناءً على احتياجات عملائنا دون أي تكلفة إضافية' },
              { icon: 'ri-money-dollar-circle-line', title: 'أسعار تنافسية', desc: 'باقات مرنة تناسب جميع أحجام الأتيليهات بأسعار عادلة مع تجربة مجانية 30 يوماً' },
            ].map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.08}>
                <div className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 card-hover cursor-default">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-50 group-hover:bg-blue-600 rounded-xl mb-4 transition-colors duration-300">
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

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-28 bg-white hero-bg">
        <div className="max-w-4xl mx-auto px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-5 py-2 mb-6">
              <i className="ri-question-answer-line text-blue-600 text-sm"></i>
              <span className="text-blue-700 text-sm font-semibold">الأسئلة الشائعة</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              كل ما تريد معرفته
              <br />
              <span className="text-gradient">في مكان واحد</span>
            </h2>
            <p className="text-gray-500 text-lg">إجابات واضحة على أكثر الأسئلة التي يطرحها عملاؤنا</p>
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

          <AnimatedSection delay={0.4} className="text-center mt-14">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-3xl p-10">
              <div className="w-16 h-16 flex items-center justify-center bg-blue-600 rounded-2xl mx-auto mb-5 shadow-lg shadow-blue-200">
                <i className="ri-customer-service-2-line text-white text-3xl"></i>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">لم تجد إجابة لسؤالك؟</h3>
              <p className="text-gray-500 mb-6">فريق الدعم لدينا متاح على مدار الساعة للإجابة على جميع استفساراتك</p>
              <button onClick={() => scrollTo('contact')}
                className="inline-flex items-center gap-2 bg-gradient-to-l from-blue-900 to-blue-500 text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-xl hover:shadow-blue-200 hover:scale-105 transition-all duration-300 whitespace-nowrap cursor-pointer">
                <i className="ri-message-3-line"></i>
                تواصل مع فريق الدعم
              </button>
            </div>
          </AnimatedSection>
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
                    <h2 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
                      حوّل أتيليهك إلى
                      <br />
                      <span className="shimmer-text">مشروع رقمي ناجح</span>
                    </h2>
                    <p className="text-gray-500 mb-6">ابدأ تجربتك المجانية لمدة 30 يوماً — بدون بطاقة ائتمانية</p>
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
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2.5 mb-6">
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
                    <div className="mb-6">
                      <label className="block text-white/70 text-sm mb-2">رقم الهاتف</label>
                      <input type="tel" name="phone" required placeholder="+966 XX XXX XXXX"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400 transition-colors duration-300 text-sm" />
                    </div>
                    <div className="mb-6">
                      <label className="block text-white/70 text-sm mb-2">اسم الأتيليه</label>
                      <input type="text" name="atelier_name" placeholder="اسم أتيليهك"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400 transition-colors duration-300 text-sm" />
                    </div>
                    <div className="mb-6">
                      <label className="block text-white/70 text-sm mb-2">رسالتك <span className="text-white/30">({msgLen}/500)</span></label>
                      <textarea name="message" rows={4} required maxLength={500}
                        onChange={e => setMsgLen(e.target.value.length)}
                        placeholder="كيف يمكنني مساعدتك؟"
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
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 to-blue-500">
                <i className="ri-scissors-cut-line text-white"></i>
              </div>
              <span className="text-white font-black text-xl">DressnMore</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-white/40 text-sm">
              {[['features','المميزات'],['modules','الوحدات'],['stats','نقاط القوة'],['faq','الأسئلة الشائعة'],['contact','تواصل معنا']].map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)} className="hover:text-white transition-colors duration-300 cursor-pointer whitespace-nowrap">{label}</button>
              ))}
              <button onClick={() => navigate('/about')} className="hover:text-white transition-colors duration-300 cursor-pointer whitespace-nowrap">من نحن</button>
              <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors duration-300 cursor-pointer whitespace-nowrap">شروط الخدمة</button>
              <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors duration-300 cursor-pointer whitespace-nowrap">سياسة الخصوصية</button>
            </div>
            <div className="text-white/30 text-sm">© 2025 DressnMore. جميع الحقوق محفوظة</div>
          </div>
        </div>
      </footer>

      {/* ===== FLOATING BUTTONS ===== */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-3">
        {/* Chat Button — فوق */}
        <button
          onClick={toggleChat}
          className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-500 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer"
          style={{boxShadow:'0 4px 20px rgba(30,58,138,0.6)'}}
        >
          <i className={`${showChat ? 'ri-close-line' : 'ri-message-3-line'} text-white text-2xl`}></i>
        </button>
        {/* WhatsApp Button — تحت */}
        <div className="relative">
          {showWhatsAppTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap shadow-xl">
              تواصل عبر واتساب
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
          <a
            href="https://wa.me/201070205189"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setShowWhatsAppTooltip(true)}
            onMouseLeave={() => setShowWhatsAppTooltip(false)}
            className="whatsapp-btn flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-2xl hover:scale-110 hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] transition-all duration-300 cursor-pointer"
          >
            <i className="ri-whatsapp-line text-white text-2xl"></i>
          </a>
        </div>
      </div>

      {/* ===== CHAT WINDOW ===== */}
      {showChat && (
        <div className="fixed bottom-28 left-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{height:'460px',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
          <div className="bg-gradient-to-r from-blue-900 to-blue-600 p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full">
              <i className={`${currentAgent.avatar} text-white text-xl`}></i>
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-sm mb-1">فريق دعم DressnMore</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></div>
                <span className="text-white/80 text-xs">متاح الآن</span>
              </div>
            </div>
            <button onClick={() => setShowChat(false)} className="w-7 h-7 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors cursor-pointer">
              <i className="ri-close-line text-white text-sm"></i>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-blue-50/30">
            {!chatStarted ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-500 rounded-full shadow-lg">
                  <i className="ri-customer-service-2-line text-white text-2xl"></i>
                </div>
                <div>
                  <p className="text-gray-800 font-bold text-sm mb-1">مرحباً بك في DressnMore</p>
                  <p className="text-gray-500 text-xs leading-relaxed">فريق الدعم جاهز للإجابة على جميع استفساراتك</p>
                </div>
                <button
                  onClick={startChat}
                  className="bg-gradient-to-r from-blue-900 to-blue-500 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap"
                >
                  ابدأ المحادثة
                </button>
              </div>
            ) : (
              <>
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`chat-msg flex ${msg.from === 'agent' ? 'justify-start' : 'justify-end'}`}>
                    <div className="max-w-[85%]">
                      {msg.from === 'agent' && (
                        <div className="flex items-end gap-2">
                          <div className="w-6 h-6 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-500 rounded-full flex-shrink-0">
                            <i className={`${currentAgent.avatar} text-white text-xs`}></i>
                          </div>
                          <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm border border-blue-100">
                            <p className="text-gray-800 text-xs leading-relaxed whitespace-pre-line">{msg.text}</p>
                            {msg.image && (
                              <img src={msg.image} alt="صورة" className="w-full rounded-lg mt-2 object-cover" style={{height:'100px'}} />
                            )}
                            <span className="text-gray-400 text-xs mt-1 block">{msg.time}</span>
                          </div>
                        </div>
                      )}
                      {msg.from === 'user' && (
                        <div className="bg-gradient-to-r from-blue-900 to-blue-600 rounded-2xl rounded-br-sm px-3 py-2">
                          <p className="text-white text-xs leading-relaxed whitespace-pre-line">{msg.text}</p>
                          <span className="text-blue-200/70 text-xs mt-1 block">{msg.time}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-end gap-2">
                      <div className="w-6 h-6 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-500 rounded-full">
                        <i className={`${currentAgent.avatar} text-white text-xs`}></i>
                      </div>
                      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-blue-100">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" style={{animation:'bounce 1s infinite'}}></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" style={{animation:'bounce 1s infinite',animationDelay:'0.2s'}}></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" style={{animation:'bounce 1s infinite',animationDelay:'0.4s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {chatMessages.length <= 1 && !isTyping && (
                  <div className="flex flex-wrap gap-1.5 justify-start">
                    {quickReplies.map((q, i) => (
                      <button key={i} onClick={() => sendMessage(q)}
                        className="text-xs px-3 py-1.5 rounded-full border border-blue-200 bg-white text-blue-800 hover:bg-blue-700 hover:border-blue-700 hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap">
                        {q}
                      </button>
                    ))}
                  </div>
                )}
                <div ref={chatEndRef}></div>
              </>
            )}
          </div>
          {chatStarted && (
            <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-blue-100 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="اكتب رسالتك..."
                className="flex-1 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button type="submit"
                className="w-9 h-9 flex items-center justify-center bg-gradient-to-r from-blue-900 to-blue-500 rounded-full hover:scale-110 transition-all duration-200 cursor-pointer flex-shrink-0">
                <i className="ri-send-plane-fill text-white text-sm"></i>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

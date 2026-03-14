import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function PrivacyPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('intro');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      
      const sections = document.querySelectorAll('section[id]');
      let currentSection = 'intro';
      
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).clientHeight;
        if (window.scrollY >= sectionTop - 200 && window.scrollY < sectionTop + sectionHeight - 200) {
          currentSection = section.getAttribute('id') || 'intro';
        }
      });
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const sections = [
    { id: 'intro', title: 'المقدمة', icon: 'ri-shield-check-line' },
    { id: 'data-collection', title: 'البيانات المجمعة', icon: 'ri-database-2-line' },
    { id: 'data-usage', title: 'استخدام البيانات', icon: 'ri-settings-3-line' },
    { id: 'data-sharing', title: 'مشاركة البيانات', icon: 'ri-share-line' },
    { id: 'cookies', title: 'ملفات الارتباط', icon: 'ri-file-list-3-line' },
    { id: 'user-rights', title: 'حقوق المستخدم', icon: 'ri-user-settings-line' },
    { id: 'data-security', title: 'أمان البيانات', icon: 'ri-lock-password-line' },
    { id: 'data-retention', title: 'الاحتفاظ بالبيانات', icon: 'ri-time-line' },
    { id: 'data-transfer', title: 'نقل البيانات', icon: 'ri-global-line' },
    { id: 'children', title: 'سياسة الأطفال', icon: 'ri-parent-line' },
    { id: 'contact', title: 'التواصل', icon: 'ri-customer-service-2-line' },
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
        @keyframes slide-in { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        .float { animation: float 3s ease-in-out infinite; }
        .slide-in { animation: slide-in 0.6s ease forwards; }
        .nav-link { transition: all 0.3s ease; }
        .nav-link.active { background: linear-gradient(to left, #1e3a8a, #3b82f6); color: white; }
        .section-content { scroll-margin-top: 120px; }
      `}</style>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-blue-950 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)',backgroundSize:'40px 40px'}}></div>
        
        {/* Animated blobs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full" style={{filter:'blur(80px)',animation:'float 8s ease-in-out infinite'}}></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-400/20 rounded-full" style={{filter:'blur(70px)',animation:'float 6s ease-in-out infinite',animationDelay:'2s'}}></div>

        {/* Top Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer float" onClick={() => navigate('/')}>
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 to-blue-500 shadow-lg">
                <i className="ri-scissors-cut-line text-white text-xl"></i>
              </div>
              <span className={`text-2xl font-black tracking-tight transition-colors ${isScrolled ? 'text-slate-900' : 'text-white'}`}>DressnMore</span>
            </div>
            <button
              onClick={() => navigate('/')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer whitespace-nowrap ${isScrolled ? 'bg-gradient-to-l from-blue-900 to-blue-500 text-white hover:shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <i className="ri-home-4-line ml-2"></i>
              العودة للرئيسية
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full mb-6 border border-white/20">
              <i className="ri-shield-check-line text-cyan-400 text-xl"></i>
              <span className="text-white/90 text-sm font-medium">حماية خصوصيتك أولويتنا</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              سياسة الخصوصية
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8 leading-relaxed">
              نحن في DressnMore نلتزم بحماية خصوصيتك وبياناتك الشخصية. هذه السياسة توضح كيفية جمع واستخدام وحماية معلوماتك.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <i className="ri-calendar-line"></i>
                <span>آخر تحديث: 15 يناير 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-time-line"></i>
                <span>وقت القراءة: 12 دقيقة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex gap-12">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-32">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                  <i className="ri-list-check text-blue-600"></i>
                  المحتويات
                </h3>
                <nav className="space-y-2">
                  {sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`nav-link w-full text-right px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 cursor-pointer whitespace-nowrap ${
                        activeSection === section.id
                          ? 'active shadow-lg'
                          : 'text-slate-600 hover:bg-white hover:shadow-md'
                      }`}
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      <div className="w-8 h-8 flex items-center justify-center">
                        <i className={`${section.icon} text-lg`}></i>
                      </div>
                      <span>{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div className="prose prose-lg max-w-none">
              
              {/* Section 1: Introduction */}
              <section id="intro" className="section-content mb-16 slide-in">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-500 rounded-xl flex-shrink-0">
                      <i className="ri-shield-check-line text-white text-2xl"></i>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-4">المقدمة والتزامنا بالخصوصية</h2>
                      <p className="text-slate-700 leading-relaxed mb-4">
                        مرحباً بك في DressnMore. نحن نقدّر ثقتك بنا ونلتزم بحماية خصوصيتك وبياناتك الشخصية. تم إعداد سياسة الخصوصية هذه لمساعدتك على فهم كيفية جمعنا واستخدامنا ومشاركتنا وحماية معلوماتك الشخصية عند استخدامك لمنصة DressnMore.
                      </p>
                      <p className="text-slate-700 leading-relaxed mb-4">
                        نحن نؤمن بأن الشفافية هي أساس الثقة، ولذلك نوضح في هذه السياسة جميع جوانب معالجة البيانات بطريقة واضحة ومفصلة. باستخدامك لخدماتنا، فإنك توافق على جمع واستخدام المعلومات وفقاً لهذه السياسة.
                      </p>
                      <div className="bg-white rounded-xl p-5 border-r-4 border-blue-600 mt-6">
                        <p className="text-sm text-slate-600 font-medium">
                          <i className="ri-information-line text-blue-600 ml-2"></i>
                          نلتزم بالامتثال الكامل لقوانين حماية البيانات المحلية والدولية، بما في ذلك اللائحة العامة لحماية البيانات (GDPR) وقانون حماية البيانات الشخصية في المملكة العربية السعودية.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Data Collection */}
              <section id="data-collection" className="section-content mb-16 slide-in" style={{animationDelay:'0.1s'}}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex-shrink-0">
                    <i className="ri-database-2-line text-white text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">البيانات التي نجمعها</h2>
                    <p className="text-slate-600">نجمع أنواعاً مختلفة من البيانات لتقديم خدماتنا وتحسينها</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <i className="ri-user-line text-emerald-600"></i>
                      البيانات الشخصية
                    </h3>
                    <p className="text-slate-700 mb-4">عند التسجيل أو استخدام خدماتنا، قد نجمع المعلومات التالية:</p>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-emerald-600 mt-1"></i>
                        <span><strong>معلومات الحساب:</strong> الاسم الكامل، البريد الإلكتروني، رقم الهاتف، كلمة المرور المشفرة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-emerald-600 mt-1"></i>
                        <span><strong>معلومات الأتيليه:</strong> اسم الأتيليه، العنوان، الموقع الجغرافي، ساعات العمل، الخدمات المقدمة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-emerald-600 mt-1"></i>
                        <span><strong>معلومات الدفع:</strong> تفاصيل بطاقة الائتمان (مشفرة)، سجل المعاملات، الفواتير</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-emerald-600 mt-1"></i>
                        <span><strong>معلومات العملاء:</strong> أسماء العملاء، أرقام الهواتف، المقاسات، تفضيلات التصميم</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <i className="ri-computer-line text-blue-600"></i>
                      البيانات التقنية
                    </h3>
                    <p className="text-slate-700 mb-4">نجمع تلقائياً معلومات تقنية عند استخدامك للمنصة:</p>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-blue-600 mt-1"></i>
                        <span><strong>معلومات الجهاز:</strong> نوع الجهاز، نظام التشغيل، المتصفح، دقة الشاشة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-blue-600 mt-1"></i>
                        <span><strong>معلومات الاتصال:</strong> عنوان IP، الموقع الجغرافي التقريبي، مزود خدمة الإنترنت</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-blue-600 mt-1"></i>
                        <span><strong>ملفات السجل:</strong> تواريخ وأوقات الوصول، الصفحات المعروضة، مدة الجلسة</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <i className="ri-bar-chart-line text-purple-600"></i>
                      بيانات الاستخدام
                    </h3>
                    <p className="text-slate-700 mb-4">نجمع معلومات حول كيفية تفاعلك مع المنصة:</p>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-purple-600 mt-1"></i>
                        <span>الميزات والخدمات التي تستخدمها بشكل متكرر</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-purple-600 mt-1"></i>
                        <span>عدد الطلبات والمواعيد المجدولة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-purple-600 mt-1"></i>
                        <span>التفاعلات مع الإشعارات والرسائل</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-purple-600 mt-1"></i>
                        <span>التقييمات والمراجعات التي تقدمها</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 3: Data Usage */}
              <section id="data-usage" className="section-content mb-16 slide-in" style={{animationDelay:'0.2s'}}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex-shrink-0">
                    <i className="ri-settings-3-line text-white text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">كيفية استخدام البيانات</h2>
                    <p className="text-slate-600">نستخدم بياناتك لتقديم وتحسين خدماتنا بالطرق التالية</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 rounded-lg mb-4">
                      <i className="ri-service-line text-white text-xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">تقديم الخدمات</h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-orange-600 mt-0.5"></i>
                        <span>إنشاء وإدارة حسابك</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-orange-600 mt-0.5"></i>
                        <span>معالجة الطلبات والمواعيد</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-orange-600 mt-0.5"></i>
                        <span>إرسال الإشعارات والتحديثات</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-orange-600 mt-0.5"></i>
                        <span>تقديم الدعم الفني</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-500 rounded-lg mb-4">
                      <i className="ri-line-chart-line text-white text-xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">تحسين الخدمات</h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-blue-600 mt-0.5"></i>
                        <span>تحليل أنماط الاستخدام</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-blue-600 mt-0.5"></i>
                        <span>تطوير ميزات جديدة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-blue-600 mt-0.5"></i>
                        <span>تخصيص تجربة المستخدم</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-blue-600 mt-0.5"></i>
                        <span>إصلاح الأخطاء والمشاكل</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg mb-4">
                      <i className="ri-shield-check-line text-white text-xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">الأمان والحماية</h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-emerald-600 mt-0.5"></i>
                        <span>منع الاحتيال والأنشطة المشبوهة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-emerald-600 mt-0.5"></i>
                        <span>حماية أمان المنصة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-emerald-600 mt-0.5"></i>
                        <span>التحقق من الهوية</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-emerald-600 mt-0.5"></i>
                        <span>الامتثال للقوانين</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg mb-4">
                      <i className="ri-mail-send-line text-white text-xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">التواصل والتسويق</h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-purple-600 mt-0.5"></i>
                        <span>إرسال العروض والتحديثات</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-purple-600 mt-0.5"></i>
                        <span>النشرات الإخبارية</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-purple-600 mt-0.5"></i>
                        <span>استطلاعات الرأي</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-purple-600 mt-0.5"></i>
                        <span>الإعلانات المخصصة</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-5 border-r-4 border-amber-500 mt-6">
                  <p className="text-sm text-slate-700 font-medium">
                    <i className="ri-information-line text-amber-600 ml-2"></i>
                    يمكنك إلغاء الاشتراك في الرسائل التسويقية في أي وقت من خلال إعدادات حسابك أو الرابط الموجود في أسفل كل رسالة بريد إلكتروني.
                  </p>
                </div>
              </section>

              {/* Section 4: Data Sharing */}
              <section id="data-sharing" className="section-content mb-16 slide-in" style={{animationDelay:'0.3s'}}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex-shrink-0">
                    <i className="ri-share-line text-white text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">مشاركة البيانات مع أطراف ثالثة</h2>
                    <p className="text-slate-600">نحن لا نبيع بياناتك الشخصية، لكن قد نشاركها في الحالات التالية</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <i className="ri-building-line text-cyan-600"></i>
                      مقدمو الخدمات
                    </h3>
                    <p className="text-slate-700 mb-4">نشارك البيانات مع شركاء موثوقين يساعدوننا في تشغيل المنصة:</p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <i className="ri-bank-card-line text-2xl text-cyan-600 mb-2"></i>
                        <p className="font-bold text-slate-900 text-sm mb-1">معالجة الدفع</p>
                        <p className="text-xs text-slate-600">Stripe, PayPal</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <i className="ri-cloud-line text-2xl text-cyan-600 mb-2"></i>
                        <p className="font-bold text-slate-900 text-sm mb-1">الاستضافة السحابية</p>
                        <p className="text-xs text-slate-600">AWS, Google Cloud</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <i className="ri-bar-chart-box-line text-2xl text-cyan-600 mb-2"></i>
                        <p className="font-bold text-slate-900 text-sm mb-1">التحليلات</p>
                        <p className="text-xs text-slate-600">Google Analytics</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <i className="ri-scales-3-line text-blue-600"></i>
                      الالتزامات القانونية
                    </h3>
                    <p className="text-slate-700">قد نكشف عن معلوماتك إذا كان ذلك مطلوباً بموجب القانون أو لحماية حقوقنا وحقوق الآخرين، بما في ذلك:</p>
                    <ul className="mt-4 space-y-2 text-slate-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-blue-600 mt-1"></i>
                        <span>الامتثال لأوامر المحكمة أو الإجراءات القانونية</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-blue-600 mt-1"></i>
                        <span>حماية حقوق وممتلكات DressnMore</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-blue-600 mt-1"></i>
                        <span>منع الاحتيال أو الأنشطة غير القانونية</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-blue-600 mt-1"></i>
                        <span>حماية سلامة المستخدمين والجمهور</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <i className="ri-exchange-line text-emerald-600"></i>
                      عمليات الدمج والاستحواذ
                    </h3>
                    <p className="text-slate-700">في حالة اندماج أو استحواذ أو بيع أصول الشركة، قد يتم نقل بياناتك إلى الكيان الجديد. سنخطرك بأي تغيير في ملكية أو استخدام معلوماتك الشخصية.</p>
                  </div>
                </div>
              </section>

              {/* Section 5: Cookies */}
              <section id="cookies" className="section-content mb-16 slide-in" style={{animationDelay:'0.4s'}}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex-shrink-0">
                    <i className="ri-file-list-3-line text-white text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">ملفات تعريف الارتباط (Cookies)</h2>
                    <p className="text-slate-600">نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200 mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">ما هي ملفات تعريف الارتباط؟</h3>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة موقعنا. تساعدنا هذه الملفات على تذكر تفضيلاتك وتحسين تجربتك وتحليل كيفية استخدام المنصة.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-emerald-100 rounded-lg">
                        <i className="ri-checkbox-circle-line text-emerald-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">ملفات ضرورية</h3>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">مطلوبة لتشغيل المنصة بشكل صحيح:</p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-emerald-600 mt-0.5"></i>
                        <span>تسجيل الدخول والمصادقة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-emerald-600 mt-0.5"></i>
                        <span>إدارة الجلسات</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-emerald-600 mt-0.5"></i>
                        <span>الأمان والحماية</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
                        <i className="ri-settings-3-line text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">ملفات وظيفية</h3>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">تحسن تجربتك على المنصة:</p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-blue-600 mt-0.5"></i>
                        <span>تذكر تفضيلات اللغة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-blue-600 mt-0.5"></i>
                        <span>حفظ الإعدادات</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-blue-600 mt-0.5"></i>
                        <span>تخصيص الواجهة</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-purple-100 rounded-lg">
                        <i className="ri-bar-chart-line text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">ملفات تحليلية</h3>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">تساعدنا على فهم كيفية استخدام المنصة:</p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-purple-600 mt-0.5"></i>
                        <span>عدد الزوار والصفحات</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-purple-600 mt-0.5"></i>
                        <span>مصادر الزيارات</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-purple-600 mt-0.5"></i>
                        <span>سلوك المستخدمين</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-orange-100 rounded-lg">
                        <i className="ri-advertisement-line text-orange-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">ملفات تسويقية</h3>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">تستخدم لعرض إعلانات مخصصة:</p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-orange-600 mt-0.5"></i>
                        <span>تتبع الإعلانات</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-orange-600 mt-0.5"></i>
                        <span>إعادة الاستهداف</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-orange-600 mt-0.5"></i>
                        <span>قياس فعالية الحملات</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-5 border-r-4 border-blue-600 mt-6">
                  <p className="text-sm text-slate-700 font-medium">
                    <i className="ri-settings-3-line text-blue-600 ml-2"></i>
                    يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك. لاحظ أن تعطيل بعض الملفات قد يؤثر على وظائف المنصة.
                  </p>
                </div>
              </section>

              {/* Section 6: User Rights */}
              <section id="user-rights" className="section-content mb-16 slide-in" style={{animationDelay:'0.5s'}}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex-shrink-0">
                    <i className="ri-user-settings-line text-white text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">حقوق المستخدم</h2>
                    <p className="text-slate-600">لديك حقوق كاملة في التحكم ببياناتك الشخصية</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4">
                      <i className="ri-eye-line text-white text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">حق الوصول</h3>
                    <p className="text-sm text-slate-700">يمكنك طلب نسخة من جميع البيانات الشخصية التي نحتفظ بها عنك في أي وقت.</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-500 rounded-xl mb-4">
                      <i className="ri-edit-line text-white text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">حق التصحيح</h3>
                    <p className="text-sm text-slate-700">يمكنك تحديث أو تصحيح أي معلومات غير دقيقة أو غير كاملة في حسابك.</p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-600 rounded-xl mb-4">
                      <i className="ri-delete-bin-line text-white text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">حق الحذف</h3>
                    <p className="text-sm text-slate-700">يمكنك طلب حذف بياناتك الشخصية، مع مراعاة الالتزامات القانونية.</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mb-4">
                      <i className="ri-download-line text-white text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">حق النقل</h3>
                    <p className="text-sm text-slate-700">يمكنك الحصول على بياناتك بصيغة قابلة للقراءة ونقلها إلى خدمة أخرى.</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl mb-4">
                      <i className="ri-pause-circle-line text-white text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">حق التقييد</h3>
                    <p className="text-sm text-slate-700">يمكنك طلب تقييد معالجة بياناتك في ظروف معينة.</p>
                  </div>

                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl mb-4">
                      <i className="ri-close-circle-line text-white text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">حق الاعتراض</h3>
                    <p className="text-sm text-slate-700">يمكنك الاعتراض على معالجة بياناتك لأغراض تسويقية أو أخرى.</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200 mt-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <i className="ri-question-line text-indigo-600"></i>
                    كيفية ممارسة حقوقك
                  </h3>
                  <p className="text-slate-700 mb-4">لممارسة أي من هذه الحقوق، يمكنك:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <i className="ri-mail-line text-indigo-600 text-xl mt-1"></i>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">إرسال بريد إلكتروني</p>
                        <p className="text-sm text-slate-600">privacy@dressnmore.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-settings-3-line text-indigo-600 text-xl mt-1"></i>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">من خلال إعدادات الحساب</p>
                        <p className="text-sm text-slate-600">قسم الخصوصية والأمان</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-4">سنرد على طلبك خلال 30 يوماً من تاريخ الاستلام.</p>
                </div>
              </section>

              {/* Section 7: Data Security */}
              <section id="data-security" className="section-content mb-16 slide-in" style={{animationDelay:'0.6s'}}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex-shrink-0">
                    <i className="ri-lock-password-line text-white text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">أمان البيانات وإجراءات الحماية</h2>
                    <p className="text-slate-600">نتخذ تدابير أمنية صارمة لحماية بياناتك</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 border border-red-200 mb-6">
                  <p className="text-slate-700 leading-relaxed">
                    أمان بياناتك هو أولويتنا القصوى. نستخدم أحدث التقنيات والممارسات الأمنية لحماية معلوماتك الشخصية من الوصول غير المصرح به أو الكشف أو التعديل أو الإتلاف.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-lg">
                        <i className="ri-shield-keyhole-line text-red-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">التشفير</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-red-600 mt-1"></i>
                        <span>تشفير SSL/TLS لجميع البيانات المنقولة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-red-600 mt-1"></i>
                        <span>تشفير AES-256 للبيانات المخزنة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-red-600 mt-1"></i>
                        <span>تشفير كلمات المرور باستخدام bcrypt</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
                        <i className="ri-shield-check-line text-blue-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">التحكم في الوصول</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-blue-600 mt-1"></i>
                        <span>مصادقة ثنائية العامل (2FA)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-blue-600 mt-1"></i>
                        <span>صلاحيات وصول محدودة للموظفين</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-blue-600 mt-1"></i>
                        <span>مراقبة وتسجيل جميع عمليات الوصول</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-emerald-100 rounded-lg">
                        <i className="ri-server-line text-emerald-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">البنية التحتية</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-emerald-600 mt-1"></i>
                        <span>خوادم آمنة في مراكز بيانات معتمدة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-emerald-600 mt-1"></i>
                        <span>جدران حماية متقدمة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-emerald-600 mt-1"></i>
                        <span>نسخ احتياطي يومي للبيانات</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-purple-100 rounded-lg">
                        <i className="ri-search-eye-line text-purple-600 text-xl"></i>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">المراقبة والاختبار</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-purple-600 mt-1"></i>
                        <span>مراقبة أمنية على مدار الساعة</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-purple-600 mt-1"></i>
                        <span>اختبارات اختراق دورية</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-purple-600 mt-1"></i>
                        <span>تحديثات أمنية منتظمة</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-5 border-r-4 border-red-600 mt-6">
                  <p className="text-sm text-slate-700 font-medium mb-2">
                    <i className="ri-alert-line text-red-600 ml-2"></i>
                    <strong>في حالة حدوث خرق أمني:</strong>
                  </p>
                  <p className="text-sm text-slate-600">
                    سنخطرك فوراً وفقاً للقوانين المعمول بها، وسنتخذ جميع الإجراءات اللازمة للحد من الأضرار وحماية بياناتك.
                  </p>
                </div>
              </section>

              {/* Section 8: Data Retention */}
              <section id="data-retention" className="section-content mb-16 slide-in" style={{animationDelay:'0.7s'}}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex-shrink-0">
                    <i className="ri-time-line text-white text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">الاحتفاظ بالبيانات ومدته</h2>
                    <p className="text-slate-600">نحتفظ ببياناتك فقط للمدة اللازمة لتحقيق الأغراض المحددة</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">فترات الاحتفاظ</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 flex items-center justify-center bg-teal-100 rounded-lg flex-shrink-0">
                          <i className="ri-user-line text-teal-600 text-xl"></i>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 mb-1">بيانات الحساب النشط</p>
                          <p className="text-sm text-slate-600">نحتفظ ببياناتك طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمات.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg flex-shrink-0">
                          <i className="ri-file-list-line text-blue-600 text-xl"></i>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 mb-1">سجلات المعاملات</p>
                          <p className="text-sm text-slate-600">نحتفظ بسجلات المعاملات المالية لمدة 7 سنوات وفقاً للمتطلبات القانونية.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 flex items-center justify-center bg-orange-100 rounded-lg flex-shrink-0">
                          <i className="ri-delete-bin-line text-orange-600 text-xl"></i>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 mb-1">الحسابات المحذوفة</p>
                          <p className="text-sm text-slate-600">بعد حذف حسابك، نحتفظ ببعض البيانات لمدة 90 يوماً للسماح باستعادة الحساب، ثم يتم حذفها نهائياً.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 flex items-center justify-center bg-purple-100 rounded-lg flex-shrink-0">
                          <i className="ri-bar-chart-line text-purple-600 text-xl"></i>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 mb-1">البيانات التحليلية</p>
                          <p className="text-sm text-slate-600">نحتفظ بالبيانات التحليلية المجهولة لمدة 26 شهراً لأغراض التحليل والتحسين.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <i className="ri-recycle-line text-teal-600"></i>
                      الحذف الآمن
                    </h3>
                    <p className="text-slate-700 mb-4">عند انتهاء فترة الاحتفاظ، نقوم بحذف بياناتك بشكل آمن باستخدام:</p>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-teal-600 mt-1"></i>
                        <span>الحذف الآمن من جميع الأنظمة والنسخ الاحتياطية</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-teal-600 mt-1"></i>
                        <span>الكتابة فوق البيانات لمنع الاسترداد</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-checkbox-circle-fill text-teal-600 mt-1"></i>
                        <span>توثيق عملية الحذف للامتثال القانوني</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 9: Data Transfer */}
              <section id="data-transfer" className="section-content mb-16 slide-in" style={{animationDelay:'0.8s'}}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex-shrink-0">
                    <i className="ri-global-line text-white text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">نقل البيانات عبر الحدود</h2>
                    <p className="text-slate-600">معلومات حول نقل بياناتك خارج بلدك</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl p-8 border border-violet-200">
                  <p className="text-slate-700 leading-relaxed mb-6">
                    قد يتم نقل بياناتك ومعالجتها في دول أخرى غير بلد إقامتك. نتخذ جميع الإجراءات اللازمة لضمان حماية بياناتك وفقاً لهذه السياسة والقوانين المعمول بها.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <i className="ri-shield-check-line text-violet-600"></i>
                        الضمانات المطبقة
                      </h3>
                      <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                          <i className="ri-checkbox-circle-fill text-violet-600 mt-1"></i>
                          <span>البنود التعاقدية القياسية المعتمدة</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <i className="ri-checkbox-circle-fill text-violet-600 mt-1"></i>
                          <span>شهادات الامتثال الدولية</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <i className="ri-checkbox-circle-fill text-violet-600 mt-1"></i>
                          <span>تقييمات الأمان الدورية</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white rounded-xl p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <i className="ri-map-pin-line text-violet-600"></i>
                        مواقع الخوادم
                      </h3>
                      <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                          <i className="ri-checkbox-circle-fill text-violet-600 mt-1"></i>
                          <span>الخوادم الرئيسية في الاتحاد الأوروبي</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <i className="ri-checkbox-circle-fill text-violet-600 mt-1"></i>
                          <span>خوادم احتياطية في الولايات المتحدة</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <i className="ri-checkbox-circle-fill text-violet-600 mt-1"></i>
                          <span>شبكة توصيل محتوى عالمية</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 10: Children */}
              <section id="children" className="section-content mb-16 slide-in" style={{animationDelay:'0.9s'}}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex-shrink-0">
                    <i className="ri-parent-line text-white text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">سياسة الأطفال</h2>
                    <p className="text-slate-600">حماية خصوصية الأطفال على منصتنا</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 border border-pink-200">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center bg-pink-100 rounded-xl flex-shrink-0">
                      <i className="ri-information-line text-pink-600 text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">الحد الأدنى للسن</h3>
                      <p className="text-slate-700 leading-relaxed mb-4">
                        خدماتنا مخصصة للأشخاص الذين تبلغ أعمارهم 18 عاماً أو أكثر. نحن لا نجمع عن قصد معلومات شخصية من الأطفال دون سن 18 عاماً.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <i className="ri-shield-user-line text-pink-600"></i>
                      إذا كنت ولي أمر
                    </h3>
                    <p className="text-slate-700 mb-4">إذا علمت أن طفلك قد قدم معلومات شخصية لنا دون موافقتك:</p>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-pink-600 mt-1"></i>
                        <span>اتصل بنا فوراً على privacy@dressnmore.com</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-pink-600 mt-1"></i>
                        <span>سنقوم بحذف المعلومات في أقرب وقت ممكن</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ri-arrow-left-s-line text-pink-600 mt-1"></i>
                        <span>سنتخذ خطوات لمنع الوصول المستقبلي</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-pink-100 rounded-xl p-5 border-r-4 border-pink-600">
                    <p className="text-sm text-slate-700 font-medium">
                      <i className="ri-alert-line text-pink-600 ml-2"></i>
                      نحن ملتزمون بحماية خصوصية الأطفال ونتخذ هذه المسألة على محمل الجد. إذا اكتشفنا أننا جمعنا معلومات من طفل دون موافقة الوالدين، سنحذف هذه المعلومات فوراً.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 11: Contact */}
              <section id="contact" className="section-content mb-16 slide-in" style={{animationDelay:'1s'}}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-500 rounded-xl flex-shrink-0">
                    <i className="ri-customer-service-2-line text-white text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">التواصل بشأن الخصوصية</h2>
                    <p className="text-slate-600">نحن هنا للإجابة على أسئلتك واستفساراتك</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200">
                  <p className="text-slate-700 leading-relaxed mb-8">
                    إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية هذه أو ممارساتنا المتعلقة بالبيانات، يرجى التواصل معنا:
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
                          <i className="ri-mail-line text-blue-600 text-xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">البريد الإلكتروني</h3>
                      </div>
                      <p className="text-slate-600 text-sm mb-2">للاستفسارات العامة:</p>
                      <p className="text-blue-600 font-medium">support@dressnmore.com</p>
                      <p className="text-slate-600 text-sm mt-3 mb-2">لشؤون الخصوصية:</p>
                      <p className="text-blue-600 font-medium">privacy@dressnmore.com</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-emerald-100 rounded-lg">
                          <i className="ri-phone-line text-emerald-600 text-xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">الهاتف</h3>
                      </div>
                      <p className="text-slate-600 text-sm mb-2">خدمة العملاء:</p>
                      <p className="text-emerald-600 font-medium text-lg">+966 50 123 4567</p>
                      <p className="text-slate-500 text-xs mt-2">الأحد - الخميس: 9 صباحاً - 6 مساءً</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-purple-100 rounded-lg">
                          <i className="ri-map-pin-line text-purple-600 text-xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">العنوان البريدي</h3>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        شركة DressnMore للتقنية<br />
                        طريق الملك فهد، حي العليا<br />
                        الرياض 12211<br />
                        المملكة العربية السعودية
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-orange-100 rounded-lg">
                          <i className="ri-time-line text-orange-600 text-xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">وقت الاستجابة</h3>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed mb-3">
                        نسعى للرد على جميع الاستفسارات خلال:
                      </p>
                      <div className="space-y-2 text-sm">
                        <p className="text-slate-600"><span className="font-bold text-slate-900">24 ساعة</span> للاستفسارات العاجلة</p>
                        <p className="text-slate-600"><span className="font-bold text-slate-900">3 أيام عمل</span> للطلبات العامة</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-100 rounded-xl p-6 mt-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <i className="ri-shield-user-line text-blue-600"></i>
                      مسؤول حماية البيانات
                    </h3>
                    <p className="text-slate-700 text-sm mb-3">
                      قمنا بتعيين مسؤول حماية بيانات (DPO) للإشراف على امتثالنا لقوانين حماية البيانات. يمكنك التواصل مع مسؤول حماية البيانات مباشرة:
                    </p>
                    <p className="text-blue-600 font-medium">dpo@dressnmore.com</p>
                  </div>
                </div>
              </section>

              {/* Final Note */}
              <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 text-white text-center">
                <i className="ri-shield-check-line text-5xl mb-4 opacity-80"></i>
                <h3 className="text-2xl font-black mb-3">شكراً لثقتك بنا</h3>
                <p className="text-white/80 leading-relaxed max-w-2xl mx-auto">
                  نحن ملتزمون بحماية خصوصيتك وبياناتك الشخصية. إذا كان لديك أي أسئلة أو مخاوف، لا تتردد في التواصل معنا.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:shadow-xl transition-all duration-300 cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-home-4-line ml-2"></i>
                    العودة للرئيسية
                  </button>
                  <button
                    onClick={() => scrollToSection('intro')}
                    className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/20 transition-all duration-300 cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-arrow-up-line ml-2"></i>
                    العودة للأعلى
                  </button>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function TermsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('intro');

  const sections = [
    { id: 'intro', title: 'المقدمة وقبول الشروط' },
    { id: 'service', title: 'تعريف الخدمة ونطاقها' },
    { id: 'account', title: 'شروط الاشتراك والحساب' },
    { id: 'usage', title: 'الاستخدام المقبول والمحظور' },
    { id: 'ip', title: 'الملكية الفكرية وحقوق النشر' },
    { id: 'payment', title: 'سياسة الدفع والاسترداد' },
    { id: 'disclaimer', title: 'إخلاء المسؤولية وحدود الضمان' },
    { id: 'termination', title: 'إنهاء الخدمة والتعليق' },
    { id: 'law', title: 'القانون الحاكم والاختصاص القضائي' },
    { id: 'changes', title: 'التعديلات على الشروط' },
    { id: 'contact', title: 'التواصل والشكاوى' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
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
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 to-blue-500 shadow-lg">
              <i className="ri-scissors-cut-line text-white text-xl"></i>
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">DressnMore</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-all duration-300 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-home-line ml-2"></i>
            العودة للرئيسية
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)',backgroundSize:'50px 50px'}}></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <i className="ri-file-text-line text-cyan-400"></i>
            <span className="text-white/90 text-sm font-medium">الشروط والأحكام</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            شروط الخدمة
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
            يُرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام منصة DressnMore. استخدامك للمنصة يعني موافقتك الكاملة على جميع البنود الواردة أدناه.
          </p>
          <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
            <i className="ri-calendar-line"></i>
            <span>آخر تحديث: 15 يناير 2025</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex gap-12">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-32">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <i className="ri-list-check text-blue-600"></i>
                  المحتويات
                </h3>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-right px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer whitespace-nowrap ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 md:p-12 space-y-12">
                
                {/* Section 1: Introduction */}
                <section id="intro" className="scroll-mt-32">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-100 flex-shrink-0">
                      <i className="ri-information-line text-blue-600 text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">المقدمة وقبول الشروط</h2>
                      <div className="h-1 w-20 bg-gradient-to-l from-blue-600 to-cyan-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                    <p className="text-base">
                      مرحباً بك في منصة <strong className="text-slate-900">DressnMore</strong>، المنصة الرائدة في مجال إدارة الأتيليهات ومحلات الخياطة في المملكة العربية السعودية ودول الخليج العربي. نحن نقدم حلولاً تقنية متكاملة تساعد أصحاب الأتيليهات على إدارة أعمالهم بكفاءة عالية، من تتبع الطلبات وإدارة العملاء إلى الفوترة والتقارير المالية.
                    </p>
                    <p className="text-base">
                      باستخدامك لمنصة DressnMore، سواء من خلال الموقع الإلكتروني أو تطبيقات الهاتف المحمول أو أي واجهة أخرى نوفرها، فإنك توافق على الالتزام بجميع الشروط والأحكام الواردة في هذه الوثيقة. إذا كنت لا توافق على أي من هذه الشروط، يُرجى عدم استخدام خدماتنا.
                    </p>
                    <p className="text-base">
                      هذه الشروط تشكل اتفاقية قانونية ملزمة بينك وبين شركة DressnMore (المشار إليها فيما يلي بـ "نحن" أو "الشركة" أو "المنصة"). نحتفظ بالحق في تعديل هذه الشروط في أي وقت، وسيتم إشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة.
                    </p>
                    <div className="bg-blue-50 border-r-4 border-blue-600 p-5 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 flex items-start gap-2">
                        <i className="ri-alert-line text-lg mt-0.5 flex-shrink-0"></i>
                        <span><strong>تنبيه مهم:</strong> استمرارك في استخدام المنصة بعد نشر أي تعديلات يعني موافقتك الضمنية على الشروط المعدلة. يُنصح بمراجعة هذه الصفحة بشكل دوري للاطلاع على أي تحديثات.</span>
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 2: Service Definition */}
                <section id="service" className="scroll-mt-32">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-cyan-100 flex-shrink-0">
                      <i className="ri-service-line text-cyan-600 text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">تعريف الخدمة ونطاقها</h2>
                      <div className="h-1 w-20 bg-gradient-to-l from-cyan-600 to-blue-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                    <p className="text-base">
                      منصة DressnMore هي نظام إدارة شامل مصمم خصيصاً لتلبية احتياجات أصحاب الأتيليهات ومحلات الخياطة. تشمل خدماتنا على سبيل المثال لا الحصر:
                    </p>
                    <ul className="space-y-3 mr-6">
                      <li className="flex items-start gap-3">
                        <i className="ri-checkbox-circle-fill text-blue-600 text-lg mt-1 flex-shrink-0"></i>
                        <span><strong>إدارة الطلبات:</strong> تتبع جميع طلبات الخياطة من لحظة الاستلام حتى التسليم، مع إمكانية تحديد حالة كل طلب (قيد التنفيذ، جاهز للتسليم، مُسلّم، إلخ).</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="ri-checkbox-circle-fill text-blue-600 text-lg mt-1 flex-shrink-0"></i>
                        <span><strong>إدارة العملاء:</strong> قاعدة بيانات متكاملة لحفظ معلومات العملاء، تاريخ طلباتهم، مقاساتهم، وتفضيلاتهم الخاصة.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="ri-checkbox-circle-fill text-blue-600 text-lg mt-1 flex-shrink-0"></i>
                        <span><strong>الفوترة والمدفوعات:</strong> إصدار فواتير احترافية، تتبع المدفوعات، إدارة الديون المستحقة، وإنشاء تقارير مالية تفصيلية.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="ri-checkbox-circle-fill text-blue-600 text-lg mt-1 flex-shrink-0"></i>
                        <span><strong>إدارة المخزون:</strong> متابعة الأقمشة والمواد الخام، تنبيهات عند انخفاض المخزون، وتقارير استهلاك المواد.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="ri-checkbox-circle-fill text-blue-600 text-lg mt-1 flex-shrink-0"></i>
                        <span><strong>التقارير والإحصائيات:</strong> لوحة تحكم شاملة تعرض أداء الأتيليه، الإيرادات، أكثر الخدمات طلباً، وتحليلات متقدمة لدعم اتخاذ القرارات.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="ri-checkbox-circle-fill text-blue-600 text-lg mt-1 flex-shrink-0"></i>
                        <span><strong>التنبيهات والإشعارات:</strong> تذكيرات تلقائية للعملاء عبر الرسائل النصية أو البريد الإلكتروني عند اقتراب موعد استلام الطلب.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="ri-checkbox-circle-fill text-blue-600 text-lg mt-1 flex-shrink-0"></i>
                        <span><strong>إدارة الموظفين:</strong> تحديد صلاحيات مختلفة للموظفين، تتبع أدائهم، وإدارة المهام الموكلة لكل فرد.</span>
                      </li>
                    </ul>
                    <p className="text-base">
                      نحن نسعى باستمرار لتطوير وتحسين خدماتنا، وقد نضيف ميزات جديدة أو نعدل الميزات الحالية دون إشعار مسبق. كما نحتفظ بالحق في إيقاف أي ميزة مؤقتاً أو بشكل دائم إذا رأينا ذلك ضرورياً لأسباب تقنية أو تجارية.
                    </p>
                    <p className="text-base">
                      المنصة متاحة على مدار الساعة طوال أيام الأسبوع، ولكننا لا نضمن عدم حدوث انقطاعات مؤقتة للخدمة بسبب الصيانة الدورية أو الطارئة، أو بسبب ظروف خارجة عن إرادتنا مثل مشاكل الإنترنت أو الخوادم.
                    </p>
                  </div>
                </section>

                {/* Section 3: Account Terms */}
                <section id="account" className="scroll-mt-32">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-purple-100 flex-shrink-0">
                      <i className="ri-user-settings-line text-purple-600 text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">شروط الاشتراك والحساب</h2>
                      <div className="h-1 w-20 bg-gradient-to-l from-purple-600 to-pink-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                    <p className="text-base">
                      للاستفادة من خدمات DressnMore، يجب عليك إنشاء حساب على المنصة. عند التسجيل، يجب عليك:
                    </p>
                    <ul className="space-y-3 mr-6">
                      <li className="flex items-start gap-3">
                        <i className="ri-arrow-left-s-line text-slate-400 text-lg mt-1 flex-shrink-0"></i>
                        <span>تقديم معلومات دقيقة وكاملة وحديثة عن أتيليهك، بما في ذلك الاسم التجاري، العنوان، رقم السجل التجاري (إن وُجد)، ومعلومات الاتصال.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="ri-arrow-left-s-line text-slate-400 text-lg mt-1 flex-shrink-0"></i>
                        <span>اختيار كلمة مرور قوية وآمنة، والحفاظ على سريتها. أنت المسؤول الوحيد عن جميع الأنشطة التي تتم من خلال حسابك.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="ri-arrow-left-s-line text-slate-400 text-lg mt-1 flex-shrink-0"></i>
                        <span>إبلاغنا فوراً في حال اكتشاف أي استخدام غير مصرح به لحسابك أو أي خرق أمني.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="ri-arrow-left-s-line text-slate-400 text-lg mt-1 flex-shrink-0"></i>
                        <span>تحديث معلومات حسابك بانتظام للتأكد من دقتها، خاصة معلومات الفوترة والاتصال.</span>
                      </li>
                    </ul>
                    <p className="text-base">
                      يجب أن يكون عمرك 18 عاماً على الأقل لإنشاء حساب واستخدام خدماتنا. إذا كنت تمثل شركة أو مؤسسة، فيجب أن تكون مخولاً قانونياً بالتصرف نيابة عنها.
                    </p>
                    <p className="text-base">
                      نحن نقدم عدة خطط اشتراك تناسب احتياجات مختلفة، من الخطة الأساسية المجانية إلى الخطط المدفوعة التي توفر ميزات متقدمة. يمكنك الترقية أو التخفيض من خطتك في أي وقت من خلال لوحة التحكم. عند الترقية، سيتم احتساب الرسوم بشكل تناسبي للفترة المتبقية من دورة الفوترة الحالية.
                    </p>
                    <div className="bg-amber-50 border-r-4 border-amber-500 p-5 rounded-lg">
                      <p className="text-sm font-medium text-amber-900 flex items-start gap-2">
                        <i className="ri-error-warning-line text-lg mt-0.5 flex-shrink-0"></i>
                        <span><strong>تحذير:</strong> لا يُسمح بإنشاء أكثر من حساب واحد لنفس الأتيليه دون موافقة مسبقة منا. أي محاولة للتلاعب أو إساءة استخدام النظام قد تؤدي إلى تعليق أو إلغاء حسابك دون استرداد أي رسوم مدفوعة.</span>
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 4: Acceptable Use */}
                <section id="usage" className="scroll-mt-32">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-100 flex-shrink-0">
                      <i className="ri-shield-check-line text-red-600 text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">الاستخدام المقبول والمحظور</h2>
                      <div className="h-1 w-20 bg-gradient-to-l from-red-600 to-orange-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                    <p className="text-base">
                      عند استخدامك لمنصة DressnMore، فإنك توافق على الالتزام بالسلوكيات التالية:
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                        <i className="ri-check-double-line"></i>
                        الاستخدامات المقبولة:
                      </h3>
                      <ul className="space-y-2 mr-6">
                        <li className="flex items-start gap-2 text-sm text-green-800">
                          <i className="ri-check-line text-green-600 mt-0.5 flex-shrink-0"></i>
                          <span>استخدام المنصة لإدارة أعمال أتيليهك بشكل قانوني ومشروع.</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-green-800">
                          <i className="ri-check-line text-green-600 mt-0.5 flex-shrink-0"></i>
                          <span>حفظ بيانات عملائك بشكل آمن ومسؤول وفقاً لقوانين حماية البيانات.</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-green-800">
                          <i className="ri-check-line text-green-600 mt-0.5 flex-shrink-0"></i>
                          <span>التواصل معنا بشكل محترم ومهني عند الحاجة للدعم الفني.</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-green-800">
                          <i className="ri-check-line text-green-600 mt-0.5 flex-shrink-0"></i>
                          <span>الإبلاغ عن أي أخطاء أو مشاكل تقنية تواجهها لمساعدتنا على تحسين الخدمة.</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center gap-2">
                        <i className="ri-close-circle-line"></i>
                        الاستخدامات المحظورة:
                      </h3>
                      <ul className="space-y-2 mr-6">
                        <li className="flex items-start gap-2 text-sm text-red-800">
                          <i className="ri-close-line text-red-600 mt-0.5 flex-shrink-0"></i>
                          <span>محاولة اختراق المنصة أو الوصول غير المصرح به إلى أنظمتنا أو بيانات مستخدمين آخرين.</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-red-800">
                          <i className="ri-close-line text-red-600 mt-0.5 flex-shrink-0"></i>
                          <span>استخدام المنصة لأغراض غير قانونية أو احتيالية، بما في ذلك غسيل الأموال أو التهرب الضريبي.</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-red-800">
                          <i className="ri-close-line text-red-600 mt-0.5 flex-shrink-0"></i>
                          <span>نسخ أو تقليد أو إعادة هندسة أي جزء من المنصة أو محاولة استخراج الكود المصدري.</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-red-800">
                          <i className="ri-close-line text-red-600 mt-0.5 flex-shrink-0"></i>
                          <span>إرسال رسائل غير مرغوب فيها (spam) أو محتوى ضار عبر المنصة.</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-red-800">
                          <i className="ri-close-line text-red-600 mt-0.5 flex-shrink-0"></i>
                          <span>مشاركة حسابك مع أطراف ثالثة غير مصرح لهم أو بيع بيانات الدخول الخاصة بك.</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-red-800">
                          <i className="ri-close-line text-red-600 mt-0.5 flex-shrink-0"></i>
                          <span>استخدام برامج آلية (bots) أو سكريبتات للتفاعل مع المنصة دون موافقة خطية منا.</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-red-800">
                          <i className="ri-close-line text-red-600 mt-0.5 flex-shrink-0"></i>
                          <span>تحميل أو نشر محتوى يحتوي على فيروسات أو برمجيات خبيثة أو أي كود ضار.</span>
                        </li>
                      </ul>
                    </div>
                    <p className="text-base">
                      أي انتهاك لهذه السياسات قد يؤدي إلى تعليق فوري لحسابك، وفي الحالات الخطيرة، قد نتخذ إجراءات قانونية ضدك. نحن نراقب استخدام المنصة بشكل دوري للتأكد من الامتثال لهذه الشروط.
                    </p>
                  </div>
                </section>

                {/* Section 5: Intellectual Property */}
                <section id="ip" className="scroll-mt-32">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-100 flex-shrink-0">
                      <i className="ri-copyright-line text-indigo-600 text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">الملكية الفكرية وحقوق النشر</h2>
                      <div className="h-1 w-20 bg-gradient-to-l from-indigo-600 to-purple-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                    <p className="text-base">
                      جميع الحقوق الفكرية المتعلقة بمنصة DressnMore، بما في ذلك على سبيل المثال لا الحصر: التصميم، الشعار، الكود البرمجي، قواعد البيانات، النصوص، الرسومات، الأيقونات، والواجهات، هي ملك حصري لشركة DressnMore أو مرخصة لها بشكل قانوني.
                    </p>
                    <p className="text-base">
                      عند استخدامك للمنصة، نمنحك ترخيصاً محدوداً وغير حصري وغير قابل للتحويل لاستخدام الخدمة لأغراض إدارة أتيليهك فقط. هذا الترخيص لا يمنحك أي حقوق ملكية في المنصة أو محتواها.
                    </p>
                    <p className="text-base">
                      <strong>بياناتك الخاصة:</strong> أنت تحتفظ بجميع الحقوق في البيانات التي تدخلها إلى المنصة، بما في ذلك معلومات عملائك وطلباتك وفواتيرك. نحن لا ندّعي أي ملكية لهذه البيانات، ولكننا نحتاج إلى ترخيص محدود لمعالجة هذه البيانات وتخزينها وعرضها لك من خلال المنصة.
                    </p>
                    <p className="text-base">
                      يُحظر عليك:
                    </p>
                    <ul className="space-y-2 mr-6">
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-forbid-line text-red-500 mt-0.5 flex-shrink-0"></i>
                        <span>نسخ أو تعديل أو توزيع أي جزء من المنصة دون إذن كتابي صريح منا.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-forbid-line text-red-500 mt-0.5 flex-shrink-0"></i>
                        <span>إزالة أو تعديل أي إشعارات حقوق نشر أو علامات تجارية موجودة على المنصة.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-forbid-line text-red-500 mt-0.5 flex-shrink-0"></i>
                        <span>استخدام اسم "DressnMore" أو شعارنا أو أي علامة تجارية أخرى خاصة بنا دون موافقة مسبقة.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-forbid-line text-red-500 mt-0.5 flex-shrink-0"></i>
                        <span>إنشاء منتجات أو خدمات منافسة بناءً على معرفتك بمنصتنا.</span>
                      </li>
                    </ul>
                    <p className="text-base">
                      إذا كنت تعتقد أن محتوى على منصتنا ينتهك حقوق الملكية الفكرية الخاصة بك، يُرجى التواصل معنا فوراً مع تقديم دليل على ملكيتك، وسنتخذ الإجراءات المناسبة.
                    </p>
                  </div>
                </section>

                {/* Section 6: Payment Policy */}
                <section id="payment" className="scroll-mt-32">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-100 flex-shrink-0">
                      <i className="ri-money-dollar-circle-line text-emerald-600 text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">سياسة الدفع والاسترداد</h2>
                      <div className="h-1 w-20 bg-gradient-to-l from-emerald-600 to-teal-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                    <p className="text-base">
                      نحن نقدم خطط اشتراك شهرية وسنوية، ويتم احتساب الرسوم بالريال السعودي. جميع الأسعار المعروضة على الموقع شاملة لضريبة القيمة المضافة (15%) وفقاً للأنظمة السعودية.
                    </p>
                    <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">طرق الدفع المقبولة:</h3>
                    <ul className="space-y-2 mr-6">
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-bank-card-line text-emerald-600 mt-0.5 flex-shrink-0"></i>
                        <span>بطاقات الائتمان والخصم (Visa, Mastercard, Mada)</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-bank-card-line text-emerald-600 mt-0.5 flex-shrink-0"></i>
                        <span>Apple Pay و Google Pay</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-bank-card-line text-emerald-600 mt-0.5 flex-shrink-0"></i>
                        <span>التحويل البنكي (للاشتراكات السنوية فقط)</span>
                      </li>
                    </ul>
                    <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">دورة الفوترة:</h3>
                    <p className="text-base">
                      يتم تجديد اشتراكك تلقائياً في نهاية كل دورة فوترة (شهرية أو سنوية) ما لم تقم بإلغاء الاشتراك قبل تاريخ التجديد بـ 48 ساعة على الأقل. سيتم إرسال إشعار تذكيري لك قبل 7 أيام من موعد التجديد.
                    </p>
                    <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">سياسة الاسترداد:</h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100 flex-shrink-0">
                            <span className="text-emerald-700 font-bold text-sm">1</span>
                          </div>
                          <div>
                            <strong className="text-slate-900">فترة التجربة المجانية:</strong>
                            <p className="text-sm text-slate-600 mt-1">نقدم فترة تجربة مجانية لمدة 14 يوماً لجميع الخطط المدفوعة. يمكنك إلغاء اشتراكك في أي وقت خلال هذه الفترة دون أي رسوم.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100 flex-shrink-0">
                            <span className="text-emerald-700 font-bold text-sm">2</span>
                          </div>
                          <div>
                            <strong className="text-slate-900">الاسترداد خلال 30 يوماً:</strong>
                            <p className="text-sm text-slate-600 mt-1">إذا لم تكن راضياً عن الخدمة، يمكنك طلب استرداد كامل المبلغ خلال 30 يوماً من تاريخ الدفع الأول (بعد انتهاء فترة التجربة المجانية).</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100 flex-shrink-0">
                            <span className="text-emerald-700 font-bold text-sm">3</span>
                          </div>
                          <div>
                            <strong className="text-slate-900">بعد 30 يوماً:</strong>
                            <p className="text-sm text-slate-600 mt-1">لا يمكن استرداد الرسوم بعد مرور 30 يوماً، ولكن يمكنك إلغاء اشتراكك في أي وقت لمنع التجديد التلقائي.</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100 flex-shrink-0">
                            <span className="text-emerald-700 font-bold text-sm">4</span>
                          </div>
                          <div>
                            <strong className="text-slate-900">الاشتراكات السنوية:</strong>
                            <p className="text-sm text-slate-600 mt-1">يتم احتساب الاسترداد بشكل تناسبي بناءً على الأشهر المتبقية، مع خصم 20% كرسوم إدارية.</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <p className="text-base">
                      لطلب استرداد، يُرجى التواصل مع فريق الدعم عبر البريد الإلكتروني مع ذكر رقم الفاتورة وسبب الطلب. سيتم معالجة طلبات الاسترداد خلال 5-7 أيام عمل.
                    </p>
                  </div>
                </section>

                {/* Section 7: Disclaimer */}
                <section id="disclaimer" className="scroll-mt-32">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-orange-100 flex-shrink-0">
                      <i className="ri-alert-line text-orange-600 text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">إخلاء المسؤولية وحدود الضمان</h2>
                      <div className="h-1 w-20 bg-gradient-to-l from-orange-600 to-red-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                    <p className="text-base">
                      نحن نبذل قصارى جهدنا لتوفير خدمة موثوقة وعالية الجودة، ولكن يُقدم استخدام منصة DressnMore "كما هو" و"حسب التوفر" دون أي ضمانات صريحة أو ضمنية من أي نوع.
                    </p>
                    <div className="bg-orange-50 border-r-4 border-orange-500 p-5 rounded-lg">
                      <h3 className="text-lg font-bold text-orange-900 mb-3">نحن لا نضمن:</h3>
                      <ul className="space-y-2 mr-6">
                        <li className="flex items-start gap-2 text-sm text-orange-800">
                          <i className="ri-close-circle-line text-orange-600 mt-0.5 flex-shrink-0"></i>
                          <span>أن الخدمة ستكون متاحة دون انقطاع أو خالية من الأخطاء في جميع الأوقات.</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-orange-800">
                          <i className="ri-close-circle-line text-orange-600 mt-0.5 flex-shrink-0"></i>
                          <span>أن جميع الأخطاء أو العيوب سيتم إصلاحها فوراً.</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-orange-800">
                          <i className="ri-close-circle-line text-orange-600 mt-0.5 flex-shrink-0"></i>
                          <span>أن المنصة ستلبي جميع متطلباتك أو توقعاتك الخاصة.</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-orange-800">
                          <i className="ri-close-circle-line text-orange-600 mt-0.5 flex-shrink-0"></i>
                          <span>دقة أو اكتمال أو موثوقية أي محتوى أو معلومات متاحة عبر المنصة.</span>
                        </li>
                      </ul>
                    </div>
                    <p className="text-base">
                      <strong>حدود المسؤولية:</strong> في أقصى حد يسمح به القانون، لن تكون شركة DressnMore أو مديروها أو موظفوها أو شركاؤها مسؤولين عن:
                    </p>
                    <ul className="space-y-2 mr-6">
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-subtract-line text-slate-400 mt-0.5 flex-shrink-0"></i>
                        <span>أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو عقابية.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-subtract-line text-slate-400 mt-0.5 flex-shrink-0"></i>
                        <span>فقدان الأرباح أو الإيرادات أو البيانات أو الاستخدام أو الشهرة.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-subtract-line text-slate-400 mt-0.5 flex-shrink-0"></i>
                        <span>تكلفة الحصول على سلع أو خدمات بديلة.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-subtract-line text-slate-400 mt-0.5 flex-shrink-0"></i>
                        <span>أي أضرار ناتجة عن استخدامك أو عدم قدرتك على استخدام المنصة.</span>
                      </li>
                    </ul>
                    <p className="text-base">
                      في جميع الأحوال، لن تتجاوز مسؤوليتنا الإجمالية تجاهك المبلغ الذي دفعته لنا خلال الـ 12 شهراً السابقة للحادثة التي أدت إلى المطالبة.
                    </p>
                    <p className="text-base">
                      <strong>مسؤوليتك:</strong> أنت المسؤول الوحيد عن:
                    </p>
                    <ul className="space-y-2 mr-6">
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-user-line text-blue-600 mt-0.5 flex-shrink-0"></i>
                        <span>دقة البيانات التي تدخلها إلى المنصة.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-user-line text-blue-600 mt-0.5 flex-shrink-0"></i>
                        <span>الامتثال لجميع القوانين واللوائح المحلية المتعلقة بعملك.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-user-line text-blue-600 mt-0.5 flex-shrink-0"></i>
                        <span>عمل نسخ احتياطية منتظمة لبياناتك المهمة.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-user-line text-blue-600 mt-0.5 flex-shrink-0"></i>
                        <span>أمان حسابك وكلمة المرور الخاصة بك.</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Section 8: Termination */}
                <section id="termination" className="scroll-mt-32">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-rose-100 flex-shrink-0">
                      <i className="ri-logout-box-line text-rose-600 text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">إنهاء الخدمة والتعليق</h2>
                      <div className="h-1 w-20 bg-gradient-to-l from-rose-600 to-pink-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                    <p className="text-base">
                      يمكنك إنهاء حسابك في أي وقت من خلال لوحة التحكم أو بالتواصل مع فريق الدعم. عند إنهاء حسابك:
                    </p>
                    <ul className="space-y-2 mr-6">
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-arrow-left-s-line text-slate-400 mt-0.5 flex-shrink-0"></i>
                        <span>سيتم إيقاف وصولك إلى المنصة فوراً.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-arrow-left-s-line text-slate-400 mt-0.5 flex-shrink-0"></i>
                        <span>لن يتم تجديد اشتراكك تلقائياً.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-arrow-left-s-line text-slate-400 mt-0.5 flex-shrink-0"></i>
                        <span>ستتمكن من تصدير بياناتك خلال 30 يوماً من تاريخ الإنهاء.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-arrow-left-s-line text-slate-400 mt-0.5 flex-shrink-0"></i>
                        <span>بعد 30 يوماً، سيتم حذف جميع بياناتك بشكل دائم من خوادمنا.</span>
                      </li>
                    </ul>
                    <p className="text-base">
                      <strong>حقنا في التعليق أو الإنهاء:</strong> نحتفظ بالحق في تعليق أو إنهاء حسابك فوراً ودون إشعار مسبق في الحالات التالية:
                    </p>
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-rose-200 flex-shrink-0">
                            <i className="ri-close-line text-rose-700 text-sm"></i>
                          </div>
                          <span className="text-sm text-rose-900">انتهاك أي من شروط الخدمة أو سياسات الاستخدام المقبول.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-rose-200 flex-shrink-0">
                            <i className="ri-close-line text-rose-700 text-sm"></i>
                          </div>
                          <span className="text-sm text-rose-900">عدم سداد الرسوم المستحقة خلال 15 يوماً من تاريخ الاستحقاق.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-rose-200 flex-shrink-0">
                            <i className="ri-close-line text-rose-700 text-sm"></i>
                          </div>
                          <span className="text-sm text-rose-900">محاولة اختراق أو إساءة استخدام المنصة.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-rose-200 flex-shrink-0">
                            <i className="ri-close-line text-rose-700 text-sm"></i>
                          </div>
                          <span className="text-sm text-rose-900">تقديم معلومات كاذبة أو مضللة عند التسجيل.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-rose-200 flex-shrink-0">
                            <i className="ri-close-line text-rose-700 text-sm"></i>
                          </div>
                          <span className="text-sm text-rose-900">استخدام المنصة لأنشطة غير قانونية أو احتيالية.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-rose-200 flex-shrink-0">
                            <i className="ri-close-line text-rose-700 text-sm"></i>
                          </div>
                          <span className="text-sm text-rose-900">عدم النشاط لمدة تزيد عن 12 شهراً متواصلة.</span>
                        </li>
                      </ul>
                    </div>
                    <p className="text-base">
                      في حالة التعليق، سنحاول التواصل معك لحل المشكلة. إذا لم يتم حل المشكلة خلال 30 يوماً، قد يتم إنهاء حسابك بشكل دائم.
                    </p>
                    <p className="text-base">
                      <strong>ملاحظة:</strong> إنهاء الحساب لا يعفيك من أي التزامات مالية مستحقة قبل تاريخ الإنهاء.
                    </p>
                  </div>
                </section>

                {/* Section 9: Governing Law */}
                <section id="law" className="scroll-mt-32">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 flex-shrink-0">
                      <i className="ri-scales-3-line text-slate-600 text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">القانون الحاكم والاختصاص القضائي</h2>
                      <div className="h-1 w-20 bg-gradient-to-l from-slate-600 to-slate-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                    <p className="text-base">
                      تخضع هذه الشروط والأحكام وتُفسر وفقاً لأنظمة المملكة العربية السعودية، دون الإخلال بقواعد تنازع القوانين.
                    </p>
                    <p className="text-base">
                      أي نزاع أو خلاف ينشأ عن أو يتعلق بهذه الشروط أو استخدامك للمنصة سيخضع للاختصاص الحصري للمحاكم المختصة في مدينة الرياض، المملكة العربية السعودية.
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                      <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <i className="ri-gavel-line text-slate-600"></i>
                        حل النزاعات:
                      </h3>
                      <p className="text-sm text-slate-700 mb-3">
                        نحن نشجع على حل أي نزاعات بشكل ودي قبل اللجوء إلى الإجراءات القانونية. إذا كان لديك أي شكوى أو نزاع:
                      </p>
                      <ol className="space-y-2 mr-6">
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 flex-shrink-0">
                            <span className="text-slate-700 font-bold text-xs">1</span>
                          </div>
                          <span className="text-sm text-slate-700">تواصل مع فريق الدعم الفني عبر البريد الإلكتروني أو الهاتف.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 flex-shrink-0">
                            <span className="text-slate-700 font-bold text-xs">2</span>
                          </div>
                          <span className="text-sm text-slate-700">سنحاول حل المشكلة خلال 14 يوم عمل من تاريخ استلام شكواك.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 flex-shrink-0">
                            <span className="text-slate-700 font-bold text-xs">3</span>
                          </div>
                          <span className="text-sm text-slate-700">إذا لم يتم التوصل إلى حل، يمكن اللجوء إلى الوساطة أو التحكيم قبل رفع دعوى قضائية.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 flex-shrink-0">
                            <span className="text-slate-700 font-bold text-xs">4</span>
                          </div>
                          <span className="text-sm text-slate-700">كملاذ أخير، يمكن رفع النزاع إلى المحاكم المختصة في الرياض.</span>
                        </li>
                      </ol>
                    </div>
                    <p className="text-base">
                      نحن ملتزمون بالامتثال الكامل لجميع الأنظمة واللوائح السعودية، بما في ذلك نظام التجارة الإلكترونية، نظام حماية البيانات الشخصية، ونظام مكافحة الجرائم المعلوماتية.
                    </p>
                  </div>
                </section>

                {/* Section 10: Changes to Terms */}
                <section id="changes" className="scroll-mt-32">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-teal-100 flex-shrink-0">
                      <i className="ri-refresh-line text-teal-600 text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">التعديلات على الشروط</h2>
                      <div className="h-1 w-20 bg-gradient-to-l from-teal-600 to-cyan-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                    <p className="text-base">
                      نحتفظ بالحق في تعديل أو تحديث هذه الشروط والأحكام في أي وقت وفقاً لتقديرنا الخاص. قد تكون التعديلات ضرورية لأسباب متعددة، منها:
                    </p>
                    <ul className="space-y-2 mr-6">
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-arrow-right-s-line text-teal-600 mt-0.5 flex-shrink-0"></i>
                        <span>تحسين وتطوير خدماتنا وإضافة ميزات جديدة.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-arrow-right-s-line text-teal-600 mt-0.5 flex-shrink-0"></i>
                        <span>الامتثال للتغييرات في القوانين والأنظمة المحلية أو الدولية.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-arrow-right-s-line text-teal-600 mt-0.5 flex-shrink-0"></i>
                        <span>معالجة مخاوف أمنية أو تقنية.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <i className="ri-arrow-right-s-line text-teal-600 mt-0.5 flex-shrink-0"></i>
                        <span>توضيح أو تحسين صياغة الشروط الحالية.</span>
                      </li>
                    </ul>
                    <div className="bg-teal-50 border-r-4 border-teal-600 p-5 rounded-lg">
                      <h3 className="text-base font-bold text-teal-900 mb-2 flex items-center gap-2">
                        <i className="ri-notification-line"></i>
                        كيف سنُعلمك بالتعديلات:
                      </h3>
                      <ul className="space-y-2 mr-6">
                        <li className="flex items-start gap-2 text-sm text-teal-800">
                          <i className="ri-mail-line text-teal-600 mt-0.5 flex-shrink-0"></i>
                          <span><strong>التعديلات الجوهرية:</strong> سنرسل إشعاراً عبر البريد الإلكتروني قبل 30 يوماً على الأقل من دخول التعديلات حيز التنفيذ.</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-teal-800">
                          <i className="ri-notification-badge-line text-teal-600 mt-0.5 flex-shrink-0"></i>
                          <span><strong>التعديلات البسيطة:</strong> سيتم نشر إشعار على لوحة التحكم الخاصة بك عند تسجيل الدخول.</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-teal-800">
                          <i className="ri-calendar-check-line text-teal-600 mt-0.5 flex-shrink-0"></i>
                          <span><strong>تاريخ التحديث:</strong> سيتم تحديث تاريخ "آخر تحديث" في أعلى هذه الصفحة.</span>
                        </li>
                      </ul>
                    </div>
                    <p className="text-base">
                      <strong>موافقتك على التعديلات:</strong> استمرارك في استخدام المنصة بعد دخول التعديلات حيز التنفيذ يعني موافقتك الضمنية على الشروط المعدلة. إذا كنت لا توافق على التعديلات، يجب عليك التوقف عن استخدام المنصة وإنهاء حسابك.
                    </p>
                    <p className="text-base">
                      نوصي بشدة بمراجعة هذه الصفحة بشكل دوري (على الأقل مرة كل 3 أشهر) للبقاء على اطلاع بأي تغييرات. يمكنك أيضاً الاشتراك في قائمتنا البريدية لتلقي إشعارات فورية عند أي تحديثات مهمة.
                    </p>
                  </div>
                </section>

                {/* Section 11: Contact */}
                <section id="contact" className="scroll-mt-32">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-100 flex-shrink-0">
                      <i className="ri-customer-service-2-line text-blue-600 text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">التواصل والشكاوى</h2>
                      <div className="h-1 w-20 bg-gradient-to-l from-blue-600 to-cyan-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                    <p className="text-base">
                      إذا كان لديك أي أسئلة أو استفسارات أو شكاوى بخصوص هذه الشروط والأحكام أو خدماتنا بشكل عام، نحن هنا لمساعدتك. يمكنك التواصل معنا عبر القنوات التالية:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600">
                            <i className="ri-mail-line text-white text-lg"></i>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">البريد الإلكتروني</h4>
                            <p className="text-xs text-slate-600">للاستفسارات العامة</p>
                          </div>
                        </div>
                        <a href="mailto:support@dressnmore.sa" className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors cursor-pointer">
                          support@dressnmore.sa
                        </a>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-600">
                            <i className="ri-phone-line text-white text-lg"></i>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">الهاتف</h4>
                            <p className="text-xs text-slate-600">الدعم الفني المباشر</p>
                          </div>
                        </div>
                        <a href="tel:+966501234567" className="text-emerald-600 font-medium text-sm hover:text-emerald-700 transition-colors cursor-pointer" dir="ltr">
                          +966 50 123 4567
                        </a>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-600">
                            <i className="ri-whatsapp-line text-white text-lg"></i>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">واتساب</h4>
                            <p className="text-xs text-slate-600">تواصل سريع</p>
                          </div>
                        </div>
                        <a href="https://wa.me/966501234567" className="text-purple-600 font-medium text-sm hover:text-purple-700 transition-colors cursor-pointer" dir="ltr">
                          +966 50 123 4567
                        </a>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-orange-600">
                            <i className="ri-map-pin-line text-white text-lg"></i>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">العنوان</h4>
                            <p className="text-xs text-slate-600">مقرنا الرئيسي</p>
                          </div>
                        </div>
                        <p className="text-orange-600 font-medium text-sm">
                          الرياض، حي الملقا، المملكة العربية السعودية
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <i className="ri-time-line text-slate-600"></i>
                        ساعات العمل:
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3">
                          <i className="ri-calendar-line text-blue-600"></i>
                          <span className="text-sm text-slate-700"><strong>الأحد - الخميس:</strong> 9:00 ص - 6:00 م</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <i className="ri-calendar-line text-blue-600"></i>
                          <span className="text-sm text-slate-700"><strong>الجمعة - السبت:</strong> مغلق</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-3">
                        * الدعم الفني عبر البريد الإلكتروني متاح على مدار الساعة، وسنرد على استفساراتك خلال 24 ساعة عمل.
                      </p>
                    </div>
                    <p className="text-base">
                      نحن نقدّر ملاحظاتك وشكاواك، ونسعى دائماً لتحسين خدماتنا بناءً على تجاربكم. جميع الشكاوى سيتم التعامل معها بسرية تامة واحترافية عالية.
                    </p>
                  </div>
                </section>

              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 bg-gradient-to-br from-blue-900 via-slate-900 to-blue-900 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 30% 50%, rgba(59,130,246,0.5) 0%, transparent 50%)'}}></div>
              <div className="relative">
                <h3 className="text-3xl font-black text-white mb-4">هل لديك أسئلة أخرى؟</h3>
                <p className="text-white/70 mb-6 max-w-2xl mx-auto">
                  فريقنا جاهز لمساعدتك في أي استفسار. تواصل معنا الآن وسنكون سعداء بخدمتك.
                </p>
                <button
                  onClick={() => navigate('/#contact')}
                  className="px-8 py-4 bg-white text-blue-900 rounded-xl font-bold text-base hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
                >
                  <i className="ri-customer-service-2-line text-xl"></i>
                  تواصل معنا
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 to-blue-500">
              <i className="ri-scissors-cut-line text-white text-xl"></i>
            </div>
            <span className="text-2xl font-black tracking-tight">DressnMore</span>
          </div>
          <p className="text-white/60 text-sm mb-4">
            منصة إدارة الأتيليهات الأولى في المملكة العربية السعودية
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-white/50">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors cursor-pointer whitespace-nowrap">
              الرئيسية
            </button>
            <span>•</span>
            <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors cursor-pointer whitespace-nowrap">
              شروط الخدمة
            </button>
            <span>•</span>
            <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors cursor-pointer whitespace-nowrap">
              سياسة الخصوصية
            </button>
          </div>
          <p className="text-white/40 text-xs mt-6">
            © 2025 DressnMore. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router";
import { Play, CheckCircle2 } from "lucide-react";

const LandingPage = () => {
  const scrollToSection = (id: string) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,hsl(220_25%_98%)_0%,hsl(220_20%_96%)_50%,hsl(220_15%_94%)_100%)] flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/60 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white border border-border/60 shadow-md ring-1 ring-slate-200/60 flex items-center justify-center overflow-hidden">
              <img
                src="/dressnmore-logo.jpg"
                alt="dressnmore logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Dressnmore ERP
              </span>
              <span className="text-[11px] text-muted-foreground">
                منصة إدارة كاملة للقطاع الخدمي والتجزئة
              </span>
            </div>
          </div>

          {/* Center nav */}
          <nav className="hidden md:flex items-center gap-6 text-[13px] text-muted-foreground">
            <button
              type="button"
              onClick={() => scrollToSection("hero")}
              className="font-semibold text-foreground"
            >
              الرئيسية
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className="hover:text-foreground"
            >
              المميزات
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("pricing")}
              className="hover:text-foreground"
            >
              الأسعار
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("testimonial")}
              className="hover:text-foreground"
            >
              آراء العملاء
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("footer")}
              className="hover:text-foreground"
            >
              عن النظام
            </button>
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3 text-[13px]">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="rounded-full px-4">
                تسجيل الدخول
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="sm"
                className="rounded-lg px-5 font-medium shadow-md"
              >
                جرّب الآن
              </Button>
            </Link>
          </div>

          <div className="md:hidden">
            <Link to="/login">
              <Button size="sm" className="rounded-lg px-4 font-medium">
                دخول
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero + باقي الأقسام */}
      <main className="flex-1 px-4 py-10 md:py-14">
        <div className="max-w-6xl w-full mx-auto space-y-14 md:space-y-20">
          {/* Hero section – مطابق أكثر لتصميم Biccas مع الشخص والكارد */}
          <section id="hero" className="space-y-6" dir="rtl">
            {/* سطر الشارة وزري CTA */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-border/60 px-3 py-1 text-[11px] text-muted-foreground shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-main-gold" />
                <span>لوحة تحكم واحدة لكل الفروع والورشة والخزنة</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] md:text-xs text-muted-foreground">
                <Button
                  variant="ghost"
                  className="rounded-full px-4 py-2 text-sm flex items-center gap-2 text-foreground"
                >
                  <Play className="h-4 w-4 fill-foreground/15 text-foreground" />
                  مشاهدة عرض سريع
                </Button>
                <Link to="/login">
                  <Button className="rounded-full px-6 py-2.5 bg-main-gold text-white hover:bg-main-gold/90 text-sm">
                    ابدأ الفترة التجريبية
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-10 lg:flex-row-reverse items-center">
              {/* Illustration: الشخص + الكريدت كارد + بطاقات صغيرة للأرقام */}
              <div className="relative h-72 md:h-80 w-full max-w-sm lg:max-w-md">
                {/* البطاقة الخلفية الخضراء مع الشخص */}
                <div className="absolute inset-0 rounded-[32px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] border border-border/70 flex items-center justify-center overflow-hidden">
                  <div className="rounded-[28px] bg-main-gold/90 w-[88%] h-[88%] flex items-end justify-center overflow-hidden">
                    <img
                      src="/Frame46.png"
                      alt="مشرف يستخدم لوحة التحكم"
                      className="h-full w-auto object-contain"
                    />
                  </div>
                </div>

                {/* بطاقة عائمة لقيمة الطلب */}
                <div className="absolute top-6 left-4 md:left-8 rounded-2xl bg-white shadow-[0_16px_35px_rgba(15,23,42,0.22)] border border-border/70 px-3 py-2 text-[10px] min-w-[120px]">
                  <p className="text-muted-foreground mb-1">قيمة الطلب الحالي</p>
                  <p className="text-sm font-semibold text-foreground">
                    450 ر.س
                  </p>
                  <span className="inline-flex mt-1 rounded-full bg-main-gold/10 text-main-gold px-2 py-0.5">
                    إرسال للتجهيز
                  </span>
                </div>

                {/* بطاقة عائمة لإجمالي الدخل */}
                <div className="absolute bottom-6 left-6 rounded-2xl bg-white shadow-[0_16px_35px_rgba(15,23,42,0.2)] border border-border/70 px-3 py-2 text-[10px] min-w-[120px]">
                  <p className="text-muted-foreground mb-1">إجمالي الدخل اليوم</p>
                  <p className="text-sm font-semibold text-foreground">
                    24,500 ر.س
                  </p>
                </div>

                {/* بطاقة الكريدت كارد الداكنة */}
                <div className="absolute top-10 -right-4 md:right-4 rotate-6 rounded-2xl shadow-[0_20px_40px_rgba(15,23,42,0.45)] overflow-hidden">
                  <img
                    src="/Frame45.png"
                    alt="كرت عمليات Dressnmore"
                    className="h-32 w-28 md:h-36 md:w-32 object-contain"
                  />
                </div>
              </div>

              {/* Text block */}
              <div className="space-y-5 max-w-xl w-full">
                <h1 className="text-3xl md:text-4xl lg:text-[2.7rem] font-bold tracking-tight text-foreground leading-snug">
                  <span className="block">نساعدك على تنظيم</span>
                  <span className="block text-main-gold">
                    وزيادة إنتاجية فريقك
                  </span>
                  <span className="block">في Dressnmore كل يوم</span>
                </h1>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  اجمع المبيعات، الخزنة، المخزون، العملاء والموردين في نظام ERP
                  واحد مصمم خصيصاً لتدفق عمل Dressnmore، مع أرقام مباشرة من كل
                  فرع وورشة.
                </p>
                <div className="flex flex-wrap gap-3 text-[11px] md:text-xs">
                  <div className="inline-flex items-center rounded-full bg-white/90 border border-border/60 px-3 py-1 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-main-gold mr-1" />
                    <span>تقارير مالية وتشغيلية لحظية</span>
                  </div>
                  <div className="inline-flex items-center rounded-full bg-white/90 border border-border/60 px-3 py-1 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-main-gold mr-1" />
                    <span>صلاحيات واضحة لكل دور في الفريق</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Logos row مثل "More than 25,000 teams use Collabs" */}
          <section className="space-y-4 text-center" dir="rtl">
            <div className="max-w-3xl mx-auto space-y-3">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">
                أكثر من 500 فريق يعتمدون على Dressnmore لإدارة عملياتهم اليومية
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] md:text-xs text-muted-foreground/80">
                <span className="uppercase tracking-[0.18em]">Retail Pro</span>
                <span className="uppercase tracking-[0.18em]">Service Hub</span>
                <span className="uppercase tracking-[0.18em]">Client Care</span>
                <span className="uppercase tracking-[0.18em]">Workshop X</span>
                <span className="uppercase tracking-[0.18em]">Branch Flow</span>
              </div>
            </div>
          </section>

  
          {/* Features section بشكل مقارب للصورة المُرسلة */}
          <section id="features" className="pt-10" dir="rtl">
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    المميزات التي تحصل عليها مع Dressnmore
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-md">
                    نوفر مجموعة من الخصائص التي تساعدك على زيادة كفاءة فريقك
                    وإدارة العمليات اليومية بسهولة ووضوح.
                  </p>
                </div>
                <Link to="/login">
                  <Button className="rounded-full px-5 bg-main-gold text-white hover:bg-main-gold/90 text-sm">
                    ابدأ الآن
                  </Button>
                </Link>
              </div>

              <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr),minmax(0,1.4fr)] items-start">
                {/* Left copy like "Our Features you can get" */}
                <div className="space-y-3 max-w-md">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">
                    أدوات عملية تغطي دورة العمل كاملة
                  </h3>
                  <p className="text-[12px] md:text-sm text-muted-foreground leading-relaxed">
                    من استقبال الطلب وحتى التسليم والتحصيل، جميع الخطوات موثّقة
                    داخل النظام مع صلاحيات واضحة لكل مستخدم، مما يقلل الأخطاء
                    اليدوية ويزيد الشفافية بين الإدارة والفروع.
                  </p>
                </div>

                {/* Three illustrated feature cards */}
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="bg-white/95 border border-border/70 shadow-[0_18px_40px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col">
                    <CardContent className="p-4 flex flex-col gap-4">
                      <div className="w-full rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center aspect-3/4">
                        <img
                          src="/Frame247.png"
                          alt="Collaboration teams"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          فرق العمل والتعاون
                        </h4>
                        <p className="text-[12px] text-muted-foreground">
                          تنظيم عمل الفروع، خدمة العملاء، والورشة في سير عمل
                          واحد مع تحديد صلاحيات لكل دور.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/95 border border-border/70 shadow-[0_18px_40px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col">
                    <CardContent className="p-4 flex flex-col gap-4">
                      <div className="w-full rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center aspect-3/4">
                        <img
                          src="/CloudStorage.png"
                          alt="Cloud storage"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          بيانات مركزية آمنة
                        </h4>
                        <p className="text-[12px] text-muted-foreground">
                          كل الفواتير، حركات الخزنة، وحركات المخزون محفوظة في
                          قاعدة بيانات موحدة مع نسخ احتياطي تلقائي.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/95 border border-border/70 shadow-[0_18px_40px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col">
                    <CardContent className="p-4 flex flex-col gap-4">
                      <div className="w-full rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center aspect-3/4">
                        <img
                          src="/DailyAnalytics.png"
                          alt="Daily analytics"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          تحليلات وتقارير يومية
                        </h4>
                        <p className="text-[12px] text-muted-foreground">
                          لوحات تحكم توضح أداء المبيعات، المصروفات، حركة
                          المخزون، ونشاط الفروع بشكل لحظي.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits section - ما الفوائد التي ستحصل عليها */}
          <section id="benefits" className="py-12 md:py-16" dir="rtl">
            <div className="max-w-6xl mx-auto px-4 grid gap-10 lg:grid-cols-2 items-center">
              {/* Text + bullets */}
              <div className="space-y-5">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  ما الفوائد التي ستحصل عليها مع Dressnmore؟
                </h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  مع Dressnmore تحصل على نظام موحّد يساعدك على متابعة الدخل،
                  المصروفات، وحركة الأموال بين الفروع والخزنة بسهولة ووضوح.
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-main-gold/10 flex items-center justify-center text-main-gold">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <span>استشارات وتشغيل مالي يساعدك على تنظيم مصاريفك اليومية.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-main-gold/10 flex items-center justify-center text-main-gold">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <span>متابعة لحظية لحركة الخزنة والمدفوعات في كل الفروع.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-main-gold/10 flex items-center justify-center text-main-gold">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <span>تقارير شهرية تساعدك على اتخاذ قرارات استثمارية أفضل.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-main-gold/10 flex items-center justify-center text-main-gold">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <span>تقليل الأخطاء اليدوية في تسجيل العمليات والتحويلات.</span>
                  </li>
                </ul>
              </div>

              {/* Image + floating cards */}
              <div className="relative">
                <div className="max-w-md mx-auto rounded-3xl overflow-hidden bg-slate-50 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
                  <img
                    src="/Rectangle48.png"
                    alt="إدارة الأموال من لوحة تحكم واحدة"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating badges */}
                <div className="absolute -top-4 left-4 md:-top-6 md:left-10 rounded-2xl bg-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] border border-border/70 px-3 py-2 text-[11px] flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-main-gold/10 text-main-gold text-xs">
                    ✓
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                      عمليات ناجحة
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      تحويلات مكتملة بدون تأخير
                    </span>
                  </div>
                </div>

                <div className="absolute -bottom-4 right-4 md:-bottom-6 md:right-10 rounded-2xl bg-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] border border-border/70 px-3 py-2 text-[11px] flex items-center gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground">
                      إجمالي الدخل اليوم
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      2,450 ر.س
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing section - ثلاث خطط مثل التصميم */}
          <section id="pricing" className="pt-8" dir="rtl">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                اختر الخطة المناسبة لعملك
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                خطط مرنة تناسب حجم مؤسستك، يمكنك البدء بالخطة الأساسية ثم الترقية
                في أي وقت.
              </p>
              <div className="inline-flex items-center gap-1 rounded-full bg-white/80 border border-border/70 p-1 text-[11px] md:text-xs">
                <button className="px-3 py-1.5 rounded-full bg-slate-900 text-slate-50 font-medium shadow-sm">
                  دفع شهري
                </button>
                <button className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground">
                  دفع سنوي (خصم 15٪)
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {/* Free / أساسي */}
              <Card className="bg-white/90 border border-border/70 shadow-sm">
                <CardContent className="p-5 space-y-3 text-right">
                  <div>
                    <p className="text-sm font-semibold text-foreground">أساسي</p>
                    <p className="text-xs text-muted-foreground">
                      لبداية التشغيل وتجربة النظام
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">0</span>
                    <span className="text-xs text-muted-foreground">ر.س / شهر</span>
                  </div>
                  <ul className="space-y-1.5 text-[12px] text-muted-foreground">
                    <li>• حتى 2 مستخدم</li>
                    <li>• إدارة أساسية للفواتير والمصروفات</li>
                    <li>• تقارير يومية مبسّطة</li>
                    <li>• دعم عبر البريد الإلكتروني</li>
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full mt-2 rounded-full text-main-gold border-main-gold/60"
                    asChild
                  >
                    <Link to="/login">ابدأ مجاناً</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Pro / الخطة الأكثر استخداماً */}
              <Card className="relative bg-main-gold/95 text-white shadow-[0_18px_40px_rgba(15,23,42,0.35)] border-0 scale-[1.02]">
                <CardContent className="p-6 space-y-3 text-right">
                  <div className="absolute -top-3 left-4 right-4 flex justify-center">
                    <span className="inline-flex items-center rounded-full bg-white/95 text-main-gold px-3 py-1 text-[10px] font-semibold shadow-sm border border-main-gold/30">
                      الأكثر استخداماً للفرق النشطة
                    </span>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm font-semibold">محترف (Pro)</p>
                    <p className="text-xs text-white/80">
                      تجربة كل إمكانيات Dressnmore في إدارة الفروع والموظفين
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">799</span>
                    <span className="text-xs text-white/80">ر.س / شهر</span>
                  </div>
                  <p className="text-[11px] text-main-gold/15">
                    وفّر حتى 15٪ مع الدفع السنوي
                  </p>
                  <ul className="space-y-1.5 text-[12px] text-white/90">
                    <li>• حتى 10 مستخدمين</li>
                    <li>• كل وحدات النظام (فواتير، خزنة، مخزون، عملاء، موردين)</li>
                    <li>• صلاحيات متقدمة وإدارة فروع</li>
                    <li>• تقارير تفصيلية يومية وشهرية</li>
                    <li>• دعم فني أولوية</li>
                  </ul>
                  <Button className="w-full mt-2 rounded-full bg-white text-main-gold hover:bg-slate-50 text-sm">
                    ترقية إلى Pro
                  </Button>
                </CardContent>
              </Card>

              {/* Business */}
              <Card className="bg-white/90 border border-border/70 shadow-sm">
                <CardContent className="p-5 space-y-3 text-right">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      أعمال (Business)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      للمؤسسات متعددة الفروع أو خطوط الإنتاج
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">ابتداءً من</span>
                  </div>
                  <ul className="space-y-1.5 text-[12px] text-muted-foreground">
                    <li>• عدد مستخدمين وفروع مخصص حسب الاتفاق</li>
                    <li>• مدير نجاح مخصص للمؤسسة</li>
                    <li>• تكامل مع أنظمة خارجية (SSO / API)</li>
                    <li>• إعداد تقارير خاصة وإستشارات تشغيلية</li>
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full mt-2 rounded-full text-foreground border-border/80"
                  >
                    تواصل معنا للخطة المخصصة
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Testimonial + demo section - مباشرة بعد التسعير */}
          <section id="testimonial" className="py-12 md:py-16 bg-slate-950" dir="rtl">
            <div className="max-w-6xl mx-auto px-4">
              <div className="rounded-3xl bg-slate-900/80 text-slate-50 shadow-[0_30px_80px_rgba(15,23,42,0.6)] border border-slate-800 px-6 py-8 md:px-10 md:py-10 grid gap-10 md:grid-cols-[minmax(0,1.1fr),minmax(0,1fr)] items-start">
                {/* Left: testimonial */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-2xl md:text-3xl font-bold leading-snug">
                      ماذا يقول شركاؤنا عن Dressnmore؟
                    </h2>
                    <p className="text-sm text-slate-300 max-w-md">
                      كل ما تحتاجه لإدارة الفواتير، الخزنة، المخزون والموظفين من
                      مكان واحد. ساعد النظام فرق التشغيل على تقليل الأخطاء
                      اليدوية وتحسين سرعة الإنجاز في الفروع والورشة.
                    </p>
                  </div>
                  <div className="relative pr-5 border-r-2 border-l-0 border-main-gold/70 space-y-3">
                    <span className="absolute -top-3 -right-1 text-main-gold text-4xl leading-none">
                      ”
                    </span>
                    <p className="text-sm text-slate-100">
                      منذ استخدام Dressnmore، أصبحت متابعة الفروع والورشة أسهل
                      بكثير، وتقارير الخزنة والعمليات تصلنا لحظيًا دون انتظار
                      ملفات إكسل أو جداول يدوية.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex -space-x-2 rtl:space-x-reverse">
                        <span className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700" />
                        <span className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700" />
                        <span className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700" />
                        <span className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">
                          ▶
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-100">
                          شريك نجاح من قطاع الأزياء
                        </span>
                        <span>مدير عمليات – شبكة فروع لخدمة العملاء</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: small contact/demo form */}
                <div className="space-y-4">
                  <Card className="bg-slate-950/60 border border-slate-700 shadow-[0_24px_60px_rgba(15,23,42,0.7)]">
                    <CardContent className="p-6 space-y-5">
                      <div className="space-y-1 text-right">
                        <h3 className="text-lg font-semibold">
                          اطلب عرض توضيحي للنظام
                        </h3>
                        <p className="text-[12px] text-slate-300">
                          اترك بريدك ورسالة مختصرة عن نشاطك، وسيتواصل معك فريقنا
                          لشرح يناسب طبيعة عملك.
                        </p>
                      </div>
                      <div className="space-y-3 text-[12px]">
                        <div className="space-y-1">
                          <label className="block text-slate-300">
                            البريد الإلكتروني
                          </label>
                          <input
                            type="email"
                            className="w-full h-9 rounded-md bg-white border border-slate-300 px-3 text-[12px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-main-gold focus:border-main-gold"
                            placeholder="you@example.com"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-slate-300">
                            نبذة عن نشاطك
                          </label>
                          <textarea
                            className="w-full rounded-md bg-white border border-slate-300 px-3 py-2 text-[12px] h-24 resize-none text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-main-gold focus:border-main-gold"
                            placeholder="مثال: شبكة فروع لخدمة العملاء، عدد الفروع، عدد الموظفين..."
                          />
                        </div>
                        <div className="space-y-1">
                          <Button className="w-full rounded-full bg-main-gold text-white hover:bg-main-gold/90 text-sm h-9">
                            طلب عرض توضيحي
                          </Button>
                          <p className="text-[11px] text-slate-400 text-center">
                            أو ابدأ نسخة تجريبية مجانية الآن
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer بلون داكن يغطي عرض الشاشة */}
      <footer id="footer" className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] md:text-xs text-slate-400">
          <span>
            للدعم الفني يرجى التواصل على{" "}
            <span className="text-main-gold font-semibold">
              00201070205189
            </span>
          </span>
          <span className="text-[10px] text-slate-500">
            تصميم وتطوير{" "}
            <a
              href="https://highleveltecknology.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-main-gold font-semibold"
            >
              High Level Technology
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;


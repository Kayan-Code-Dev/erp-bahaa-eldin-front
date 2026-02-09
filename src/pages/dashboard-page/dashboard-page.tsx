import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Filter,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/custom/DatePicker";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import { DepartmentsSelect } from "@/components/custom/departments-select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useGetDashboardOverviewQueryOptions } from "@/api/v2/dashboard/dashboard.hooks";
import { TDashboardOverviewParams } from "@/api/v2/dashboard/dashboard.types";
import { format } from "date-fns";

function DashboardPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TDashboardOverviewParams>({
    period: "month",
  });
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const queryParams = useMemo<TDashboardOverviewParams>(() => {
    const params: TDashboardOverviewParams = { ...filters };
    if (dateFrom) {
      params.date_from = format(dateFrom, "yyyy-MM-dd");
    }
    if (dateTo) {
      params.date_to = format(dateTo, "yyyy-MM-dd");
    }
    return params;
  }, [filters, dateFrom, dateTo]);

  const {
    data: dashboardData,
    isPending,
    isError,
    error,
  } = useQuery(useGetDashboardOverviewQueryOptions(queryParams));

  const handleFilterChange = (
    key: keyof TDashboardOverviewParams,
    value: any
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" || value === "" ? undefined : value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({ period: "month" });
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  return (
    <div className="flex-1" dir="rtl">
      {/* Header */}
      <div className="bg-[#907457] text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1 text-right">
            <h1 className="text-xl font-bold">لوحة التحكم</h1>
            <p className="text-xs text-white/80">
              نظرة عامة على أداء النظام خلال الفترة المحددة
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
            className="bg-white/10 hover:bg-white/20 border-white/30 text-white"
          >
            <Filter className="ml-2 h-4 w-4" />
            {showFilters ? "إخفاء الفلاتر" : "عرض الفلاتر"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>فلاتر لوحة التحكم</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-xs"
                >
                  إعادة التعيين
                </Button>
              </CardTitle>
              <CardDescription className="text-right">
                اختر الفترة والفرع والقسم لعرض بيانات مخصصة.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Period */}
                <div className="space-y-2">
                  <Label>الفترة</Label>
                  <Select
                    value={filters.period || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "period",
                        value === "all" ? undefined : value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="today">اليوم</SelectItem>
                      <SelectItem value="week">هذا الأسبوع</SelectItem>
                      <SelectItem value="month">هذا الشهر</SelectItem>
                      <SelectItem value="year">هذه السنة</SelectItem>
                      <SelectItem value="last_week">الأسبوع الماضي</SelectItem>
                      <SelectItem value="last_month">الشهر الماضي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date from */}
                <div className="space-y-2">
                  <Label>من تاريخ</Label>
                  <DatePicker
                    value={dateFrom}
                    onChange={setDateFrom}
                    placeholder="اختر تاريخ البداية"
                    allowPastDates
                    allowFutureDates={false}
                  />
                </div>

                {/* Date to */}
                <div className="space-y-2">
                  <Label>إلى تاريخ</Label>
                  <DatePicker
                    value={dateTo}
                    onChange={setDateTo}
                    placeholder="اختر تاريخ النهاية"
                    allowPastDates
                    allowFutureDates={false}
                    minDate={dateFrom}
                  />
                </div>

                {/* Branch */}
                <div className="space-y-2">
                  <Label>الفرع</Label>
                  <BranchesSelect
                    value={filters.branch_id ? String(filters.branch_id) : ""}
                    onChange={(value) =>
                      handleFilterChange(
                        "branch_id",
                        value ? Number(value) : undefined
                      )
                    }
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label>القسم</Label>
                  <DepartmentsSelect
                    value={
                      filters.department_id ? String(filters.department_id) : ""
                    }
                    onChange={(value) =>
                      handleFilterChange(
                        "department_id",
                        value ? Number(value) : undefined
                      )
                    }
                    placeholder="جميع الأقسام"
                    allowClear
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading skeleton */}
        {isPending && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-16 ml-auto" />
                  <Skeleton className="h-8 w-24 ml-auto" />
                  <Skeleton className="h-4 w-32 ml-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <Card>
            <CardContent className="py-6 text-center text-red-600">
              <p>حدث خطأ أثناء تحميل بيانات لوحة التحكم.</p>
              <p className="mt-1 text-xs text-red-500">{error?.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Only render rest when data available */}
        {!isPending && !isError && dashboardData && (
          <>
            {/* Main KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Orders */}
              <KpiCard
                icon={
                  <ShoppingBag className="h-6 w-6 text-[#fec53d]" aria-hidden />
                }
                iconBg="bg-[#fec53d]/10"
                borderColor="border-l-[#fec53d]"
                title="إجمالي الطلبات"
                value={dashboardData.sales?.order_count ?? 0}
                subtitle={
                  dashboardData.sales?.total_revenue
                    ? `إيرادات ${dashboardData.sales.total_revenue.toLocaleString()} ج.م`
                    : undefined
                }
              />

              {/* Revenue */}
              <KpiCard
                icon={
                  <DollarSign className="h-6 w-6 text-[#16c098]" aria-hidden />
                }
                iconBg="bg-[#16c098]/10"
                borderColor="border-l-[#16c098]"
                title="إجمالي الإيرادات"
                value={
                  dashboardData.sales?.total_revenue
                    ? `${(dashboardData.sales.total_revenue / 1000).toFixed(1)}K`
                    : "0"
                }
                suffix="ج.م"
                subtitle={
                  dashboardData.sales?.average_order_value
                    ? `متوسط الطلب ${dashboardData.sales.average_order_value.toLocaleString()} ج.م`
                    : undefined
                }
              />

              {/* New clients */}
              <KpiCard
                icon={<Users className="h-6 w-6 text-[#8280ff]" aria-hidden />}
                iconBg="bg-[#8280ff]/10"
                borderColor="border-l-[#8280ff]"
                title="العملاء الجدد"
                value={dashboardData.business?.clients?.new_clients ?? 0}
                subtitle={
                  dashboardData.business?.clients?.total_clients
                    ? `إجمالي العملاء ${dashboardData.business.clients.total_clients}`
                    : undefined
                }
                trend={
                  dashboardData.business?.clients?.growth_rate !== undefined
                    ? dashboardData.business.clients.growth_rate
                    : undefined
                }
              />

              {/* Inventory */}
              <KpiCard
                icon={
                  <Package className="h-6 w-6 text-[#ff6b6b]" aria-hidden />
                }
                iconBg="bg-[#ff6b6b]/10"
                borderColor="border-l-[#ff6b6b]"
                title="المنتجات المتاحة"
                value={dashboardData.inventory?.available ?? 0}
                subtitle={
                  dashboardData.inventory?.total_items
                    ? `إجمالي المنتجات ${dashboardData.inventory.total_items}`
                    : undefined
                }
              />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                icon={<Wallet className="h-5 w-5 text-[#4ecdc4]" aria-hidden />}
                iconBg="bg-[#4ecdc4]/10"
                borderColor="border-l-[#4ecdc4]"
                title="إجمالي المدفوعات"
                value={
                  dashboardData.payments?.total_payments
                    ? `${(dashboardData.payments.total_payments / 1000).toFixed(
                        1
                      )}K`
                    : "0"
                }
                suffix="ج.م"
                subtitle={
                  dashboardData.payments?.payment_count
                    ? `${dashboardData.payments.payment_count} عملية دفع`
                    : undefined
                }
              />

              <KpiCard
                icon={
                  <TrendingUp className="h-5 w-5 text-[#95e1d3]" aria-hidden />
                }
                iconBg="bg-[#95e1d3]/10"
                borderColor="border-l-[#95e1d3]"
                title="متوسط قيمة الطلب"
                value={
                  dashboardData.sales?.average_order_value
                    ? dashboardData.sales.average_order_value.toLocaleString()
                    : "0"
                }
                suffix="ج.م"
              />

              <KpiCard
                icon={
                  <Activity className="h-5 w-5 text-[#f38181]" aria-hidden />
                }
                iconBg="bg-[#f38181]/10"
                borderColor="border-l-[#f38181]"
                title="إجمالي النشاطات"
                value={dashboardData.activity?.total_activities ?? 0}
              />

              <KpiCard
                icon={
                  <BarChart3 className="h-5 w-5 text-[#aa96da]" aria-hidden />
                }
                iconBg="bg-[#aa96da]/10"
                borderColor="border-l-[#aa96da]"
                title="معدل استخدام المخزون"
                value={
                  dashboardData.inventory?.utilization_rate?.toFixed(1) ?? "0"
                }
                suffix="%"
              />
            </div>

            {/* Sales & financial */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Financial summary */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="text-right">
                    الإيرادات والمصروفات
                  </CardTitle>
                  <CardDescription className="text-right">
                    ملخص سريع للأداء المالي خلال الفترة المختارة.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="income" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="income">إيرادات</TabsTrigger>
                      <TabsTrigger value="expenses">مصروفات</TabsTrigger>
                    </TabsList>
                    <TabsContent value="income" className="space-y-3">
                      <SummaryRow
                        label="إجمالي الإيرادات"
                        value={
                          dashboardData.financial?.total_income?.toLocaleString() ??
                          "0"
                        }
                        suffix="ج.م"
                        accent="text-[#16c098]"
                      />
                      <SummaryRow
                        label="الربح"
                        value={
                          dashboardData.financial?.profit?.toLocaleString() ??
                          "0"
                        }
                        suffix="ج.م"
                        accent="text-[#16c098]"
                      />
                      <SummaryRow
                        label="هامش الربح"
                        value={
                          dashboardData.financial?.profit_margin?.toFixed(1) ??
                          "0"
                        }
                        suffix="%"
                      />
                    </TabsContent>
                    <TabsContent value="expenses" className="space-y-3">
                      <SummaryRow
                        label="إجمالي المصروفات"
                        value={
                          dashboardData.financial?.total_expenses?.toLocaleString() ??
                          "0"
                        }
                        suffix="ج.م"
                        accent="text-[#cf0c0c]"
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Sales by status */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-right">
                    المبيعات حسب الحالة
                  </CardTitle>
                  <CardDescription className="text-right">
                    توزيع الطلبات والإيرادات حسب حالة الطلب.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardData.sales?.by_status &&
                  Object.keys(dashboardData.sales.by_status).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(dashboardData.sales.by_status).map(
                        ([status, data]: [string, any]) => {
                          const labels: Record<string, string> = {
                            created: "تم الإنشاء",
                            delivered: "تم التسليم",
                            paid: "مدفوع",
                            partially_paid: "مدفوع جزئياً",
                            canceled: "ملغي",
                          };
                          const label = labels[status] ?? status;
                          return (
                            <div
                              key={status}
                              className="rounded-xl border px-4 py-3 bg-muted/40"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-right">
                                  {label}
                                </p>
                              </div>
                              <p className="text-2xl font-bold">
                                {data?.count ?? 0}
                                <span className="mr-1 text-xs font-normal text-muted-foreground">
                                  طلب
                                </span>
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                الإيرادات:{" "}
                                {data?.revenue
                                  ? `${data.revenue.toLocaleString()} ج.م`
                                  : "0 ج.م"}
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      لا توجد بيانات مبيعات متاحة للفترة المحددة.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Activity & inventory & HR can follow here (simplified) */}

            {/* Period info */}
            <div className="text-right text-xs text-muted-foreground">
              {dashboardData.sales?.period && (
                <p>
                  الفترة من{" "}
                  {format(
                    new Date(dashboardData.sales.period.from),
                    "yyyy-MM-dd"
                  )}{" "}
                  إلى{" "}
                  {format(
                    new Date(dashboardData.sales.period.to),
                    "yyyy-MM-dd"
                  )}
                </p>
              )}
              {dashboardData.generated_at && (
                <p className="mt-1">
                  آخر تحديث:{" "}
                  {format(
                    new Date(dashboardData.generated_at),
                    "yyyy-MM-dd HH:mm"
                  )}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type KpiCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  title: string;
  value: number | string;
  suffix?: string;
  subtitle?: string;
  trend?: number;
};

function KpiCard({
  icon,
  iconBg,
  borderColor,
  title,
  value,
  suffix,
  subtitle,
  trend,
}: KpiCardProps) {
  const numericTrend =
    typeof trend === "number" && !Number.isNaN(trend) ? trend : undefined;
  const isUp = numericTrend !== undefined && numericTrend > 0;
  const isDown = numericTrend !== undefined && numericTrend < 0;

  return (
    <Card className={`relative overflow-hidden border-l-4 ${borderColor}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 text-right flex-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-2xl font-bold">{value}</span>
              {suffix && (
                <span className="text-xs text-muted-foreground">{suffix}</span>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
          >
            {icon}
          </div>
        </div>
        {numericTrend !== undefined && (isUp || isDown) && (
          <div className="mt-2 flex items-center justify-end gap-1 text-[11px]">
            {isUp && (
              <ChevronUp className="h-3 w-3 text-[#16c098]" aria-hidden />
            )}
            {isDown && (
              <ChevronDown className="h-3 w-3 text-[#cf0c0c]" aria-hidden />
            )}
            <span
              className={
                isUp ? "text-[#16c098]" : isDown ? "text-[#cf0c0c]" : ""
              }
            >
              {Math.abs(numericTrend).toFixed(1)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type SummaryRowProps = {
  label: string;
  value: string | number;
  suffix?: string;
  accent?: string;
};

function SummaryRow({ label, value, suffix, accent }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${accent ?? ""}`}>
        {value}
        {suffix && (
          <span className="mr-1 text-[11px] text-muted-foreground">
            {suffix}
          </span>
        )}
      </span>
    </div>
  );
}

export default DashboardPage;

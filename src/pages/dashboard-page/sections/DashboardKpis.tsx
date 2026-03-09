import {
  Activity,
  BarChart3,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { KpiCard } from "../components/KpiCard";
import { fmtCur, fmtNum, fmtPct } from "../utils/dashboard.utils";
import type {
  TDashboardActivity,
  TDashboardSales,
  TDashboardClients,
  TDashboardInventory,
  TDashboardPayments,
} from "@/api/v2/dashboard/dashboard.types";

type DashboardKpisProps = {
  sales: TDashboardSales | undefined;
  clients: { active_clients?: number; total_clients?: number; new_clients?: number; growth_rate?: number } | undefined;
  inventory: TDashboardInventory | undefined;
  payments: TDashboardPayments | undefined;
  activity: TDashboardActivity | undefined;
};

export function DashboardKpis({
  sales,
  clients,
  inventory,
  payments,
  activity,
}: DashboardKpisProps) {
  const clientSubtitle =
    clients != null
      ? [
          clients.total_clients != null && `إجمالي ${fmtNum(clients.total_clients)}`,
          clients.new_clients != null && `جدد ${fmtNum(clients.new_clients)}`,
        ]
          .filter(Boolean)
          .join(" — ") || undefined
      : undefined;

  return (
    <section className="space-y-5">
      <SectionHeader
        title="مؤشرات الأداء"
        description="نظرة سريعة على المؤشرات الرئيسية للفترة المحددة"
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<ShoppingBag className="h-6 w-6 text-amber-600" aria-hidden />}
          iconBg="bg-amber-500/10"
          borderColor="border-amber-500/60"
          title="إجمالي الطلبات"
          value={fmtNum(sales?.order_count)}
          subtitle={
            sales?.total_revenue != null
              ? `إيرادات ${fmtCur(sales.total_revenue, "")}`
              : undefined
          }
        />
        <KpiCard
          icon={<DollarSign className="h-6 w-6 text-emerald-600" aria-hidden />}
          iconBg="bg-emerald-500/10"
          borderColor="border-emerald-500/60"
          title="إجمالي الإيرادات"
          value={
            sales?.total_revenue != null
              ? `${(sales.total_revenue / 1000).toFixed(1)}K`
              : "0"
          }
          suffix="ج.م"
          subtitle={
            sales?.average_order_value != null
              ? `متوسط الطلب ${fmtCur(sales.average_order_value, "")}`
              : undefined
          }
        />
        <KpiCard
          icon={<Users className="h-6 w-6 text-violet-600" aria-hidden />}
          iconBg="bg-violet-500/10"
          borderColor="border-violet-500/60"
          title="العملاء النشطون"
          value={fmtNum(clients?.active_clients)}
          subtitle={clientSubtitle}
          trend={clients?.growth_rate}
        />
        <KpiCard
          icon={<Package className="h-6 w-6 text-rose-600" aria-hidden />}
          iconBg="bg-rose-500/10"
          borderColor="border-rose-500/60"
          title="المنتجات المتاحة"
          value={fmtNum(inventory?.available)}
          subtitle={
            inventory?.total_items != null
              ? `إجمالي ${fmtNum(inventory.total_items)} — مستأجر ${fmtNum(inventory?.out_of_branch)}`
              : undefined
          }
        />
        <KpiCard
          icon={<Wallet className="h-5 w-5 text-teal-600" aria-hidden />}
          iconBg="bg-teal-500/10"
          borderColor="border-teal-500/60"
          title="إجمالي المدفوعات"
          value={
            payments?.total_payments != null
              ? `${(payments.total_payments / 1000).toFixed(1)}K`
              : "0"
          }
          suffix="ج.م"
          subtitle={
            payments?.payment_count != null
              ? `${fmtNum(payments.payment_count)} عملية`
              : undefined
          }
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5 text-sky-500" aria-hidden />}
          iconBg="bg-sky-500/10"
          borderColor="border-sky-500/60"
          title="متوسط قيمة الطلب"
          value={fmtCur(sales?.average_order_value ?? 0, "")}
          suffix="ج.م"
        />
        <KpiCard
          icon={<Activity className="h-5 w-5 text-orange-600" aria-hidden />}
          iconBg="bg-orange-500/10"
          borderColor="border-orange-500/60"
          title="إجمالي النشاطات"
          value={fmtNum(activity?.total_activities)}
        />
        <KpiCard
          icon={<BarChart3 className="h-5 w-5 text-indigo-600" aria-hidden />}
          iconBg="bg-indigo-500/10"
          borderColor="border-indigo-500/60"
          title="معدل استخدام المخزون"
          value={fmtPct(inventory?.utilization_rate)}
        />
      </div>
    </section>
  );
}

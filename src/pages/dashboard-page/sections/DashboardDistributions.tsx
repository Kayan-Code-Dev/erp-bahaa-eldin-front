import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Package, Banknote } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { DonutChart } from "../charts/DonutChart";
import { ActivityDistribution } from "../charts/ActivityDistribution";
import { PaymentsByMethodChart } from "../charts/PaymentsByMethodChart";
import { fmtPct } from "../utils/dashboard.utils";
import type {
  TDashboardActivity,
  TDashboardInventory,
  TDashboardPayments,
} from "@/api/v2/dashboard/dashboard.types";
import type { DonutDataItem } from "../charts/DonutChart";
import { CHART_COLORS } from "../constants/dashboard.constants";

function buildInventoryDonutData(
  inventory: TDashboardInventory | undefined
): DonutDataItem[] {
  if (!inventory) return [];
  const available = inventory.available ?? 0;
  const out = inventory.out_of_branch ?? 0;
  return [
    { name: "متاح", value: available, fill: "hsl(160 50% 45%)" },
    { name: "مستأجر", value: out, fill: "hsl(250 55% 55%)" },
  ].filter((d) => d.value > 0);
}

type DashboardDistributionsProps = {
  activity: TDashboardActivity | undefined;
  inventory: TDashboardInventory | undefined;
  payments: TDashboardPayments | undefined;
};

export function DashboardDistributions({
  activity,
  inventory,
  payments,
}: DashboardDistributionsProps) {
  const inventoryData = buildInventoryDonutData(inventory);
  const activityFrom = activity?.by_entity_type ?? activity?.by_action ?? {};
  const hasActivityBreakdown = Object.values(activityFrom).some((v) => (v ?? 0) > 0);

  return (
    <>
      <SectionHeader
        title="التوزيعات والتحليلات"
        description="النشاط، المخزون، والمدفوعات حسب النوع"
        className="mt-10"
      />
      <section className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hasActivityBreakdown && (
          <Card className="overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-muted-foreground" />
                توزيع النشاط
              </CardTitle>
              <CardDescription className="text-right">
                حسب نوع الكيان أو الإجراء — مرتب حسب العدد مع نسبة كل فئة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityDistribution activity={activity} />
            </CardContent>
          </Card>
        )}
        {inventoryData.length > 0 && (
          <Card className="overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-muted-foreground" />
                المخزون
              </CardTitle>
              <CardDescription className="text-right">
                متاح مقابل مستأجر — معدل الاستخدام {fmtPct(inventory?.utilization_rate)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={inventoryData}
                emptyIcon={<Package className="h-12 w-12 text-muted-foreground/50" />}
                emptyMessage="لا توجد بيانات مخزون"
                labelFormatter={(name, value) => `${name}: ${value}`}
              />
            </CardContent>
          </Card>
        )}
        <Card className="overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Banknote className="h-5 w-5 text-muted-foreground" />
              المدفوعات حسب النوع
            </CardTitle>
            <CardDescription className="text-right">
              عدد العمليات والمبلغ (بالآلاف)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentsByMethodChart payments={payments} />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

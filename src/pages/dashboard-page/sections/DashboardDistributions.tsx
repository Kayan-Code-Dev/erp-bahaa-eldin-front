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
import { PaymentsByMethodChart } from "../charts/PaymentsByMethodChart";
import { CHART_COLORS } from "../constants/dashboard.constants";
import { fmtPct } from "../utils/dashboard.utils";
import type {
  TDashboardActivity,
  TDashboardInventory,
  TDashboardPayments,
} from "@/api/v2/dashboard/dashboard.types";
import type { DonutDataItem } from "../charts/DonutChart";

function buildActivityDonutData(
  activity: TDashboardActivity | undefined
): DonutDataItem[] {
  const from = activity?.by_entity_type ?? activity?.by_action ?? {};
  const entries = Object.entries(from);
  if (entries.length === 0) return [];
  return entries
    .map(([name, value], i) => ({
      name: name.length > 12 ? name.slice(0, 12) + "…" : name,
      value: value ?? 0,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))
    .filter((d) => d.value > 0);
}

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
  const activityData = buildActivityDonutData(activity);
  const inventoryData = buildInventoryDonutData(inventory);

  return (
    <>
      <SectionHeader
        title="التوزيعات والتحليلات"
        description="النشاط، المخزون، والمدفوعات حسب النوع"
        className="mt-10"
      />
      <section className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activityData.length > 0 && (
          <Card className="overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-muted-foreground" />
                توزيع النشاط
              </CardTitle>
              <CardDescription className="text-right">
                حسب نوع الكيان أو الإجراء
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={activityData}
                emptyIcon={<Activity className="h-12 w-12 text-muted-foreground/50" />}
                emptyMessage="لا توجد بيانات نشاط"
                labelFormatter={(name, _value, percent) => `${name} ${percent.toFixed(0)}%`}
              />
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

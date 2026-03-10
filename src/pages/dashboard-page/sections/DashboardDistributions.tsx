import { Activity, Package, Banknote } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { DashboardGridCard } from "../components/DashboardGridCard";
import { ActivityDistribution } from "../charts/ActivityDistribution";
import { InventoryRadialChart } from "../charts/InventoryRadialChart";
import { PaymentsByMethodLanes } from "../charts/PaymentsByMethodLanes";
import { fmtPct } from "../utils/dashboard.utils";
import type {
  TDashboardActivity,
  TDashboardInventory,
  TDashboardPayments,
} from "@/api/v2/dashboard/dashboard.types";

function hasInventoryData(inventory: TDashboardInventory | undefined) {
  if (!inventory) return false;
  const available = inventory.available ?? 0;
  const out = inventory.out_of_branch ?? 0;
  return available > 0 || out > 0;
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
  const showInventory = hasInventoryData(inventory);
  const activityFrom = activity?.by_entity_type ?? activity?.by_action ?? {};
  const hasActivityBreakdown = Object.values(activityFrom).some((v) => (v ?? 0) > 0);

  const blocks: React.ReactNode[] = [];
  if (hasActivityBreakdown) {
    blocks.push(
      <DashboardGridCard
        key="activity"
        title={
          <>
            <Activity className="h-5 w-5 text-muted-foreground" />
            توزيع النشاط
          </>
        }
        description="حسب نوع الكيان أو الإجراء — مرتب حسب العدد مع نسبة كل فئة"
        contentMinHeight={270}
      >
        <ActivityDistribution activity={activity} />
      </DashboardGridCard>
    );
  }
  if (showInventory) {
    blocks.push(
      <DashboardGridCard
        key="inventory"
        title={
          <>
            <Package className="h-5 w-5 text-muted-foreground" />
            المخزون
          </>
        }
        description={`حلقات نسبية — معدل الاستخدام ${fmtPct(inventory?.utilization_rate)}`}
        contentMinHeight={270}
      >
        <InventoryRadialChart inventory={inventory} />
      </DashboardGridCard>
    );
  }
  blocks.push(
    <DashboardGridCard
      key="payments"
      title={
        <>
          <Banknote className="h-5 w-5 text-muted-foreground" />
          المدفوعات حسب النوع
        </>
      }
      description="شرائح نسبية — عرض توزيع كل نوع دفع مع المبلغ وعدد العمليات"
      contentMinHeight={270}
    >
      <PaymentsByMethodLanes payments={payments} />
    </DashboardGridCard>
  );

  const n = blocks.length;
  const gridClass =
    n === 1
      ? "grid grid-cols-1"
      : n === 2
        ? "grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch md:auto-rows-fr"
        : "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:items-stretch lg:auto-rows-fr";

  return (
    <>
      <SectionHeader
        title="التوزيعات والتحليلات"
        description="النشاط، المخزون، والمدفوعات حسب النوع"
        className="mt-10"
      />
      <section className={`mt-4 ${gridClass}`}>{blocks}</section>
    </>
  );
}

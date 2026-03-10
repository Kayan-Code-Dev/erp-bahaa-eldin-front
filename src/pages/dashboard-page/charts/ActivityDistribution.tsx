import { CHART_COLORS } from "../constants/dashboard.constants";
import { fmtNum, fmtPct } from "../utils/dashboard.utils";
import type { TDashboardActivity } from "@/api/v2/dashboard/dashboard.types";
import { EmptyChartState } from "../components/EmptyChartState";
import { Activity } from "lucide-react";

export type ActivityDistributionItem = {
  name: string;
  value: number;
  fill: string;
  percentOfTotal: number;
};

function buildActivityItems(
  activity: TDashboardActivity | undefined
): ActivityDistributionItem[] {
  const from = activity?.by_entity_type ?? activity?.by_action ?? {};
  const entries = Object.entries(from).filter(([, v]) => (v ?? 0) > 0);
  if (entries.length === 0) return [];

  const total = entries.reduce((s, [, v]) => s + (v ?? 0), 0);
  if (total <= 0) return [];

  return entries
    .map(([name, value], i) => ({
      name,
      value: value ?? 0,
      fill: CHART_COLORS[i % CHART_COLORS.length],
      percentOfTotal: total > 0 ? ((value ?? 0) / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

type ActivityDistributionProps = {
  activity: TDashboardActivity | undefined;
};

/**
 * عرض توزيع النشاط كقائمة مرتبة مع شريط نسبة لكل فئة —
 * أوضح من الدونات عند وجود عدد كبير من الفئات.
 */
export function ActivityDistribution({ activity }: ActivityDistributionProps) {
  const items = buildActivityItems(activity);
  const totalActivities = activity?.total_activities ?? items.reduce((s, i) => s + i.value, 0);

  if (items.length === 0) {
    return (
      <EmptyChartState
        icon={<Activity className="h-12 w-12 text-muted-foreground/50" />}
        message="لا توجد بيانات نشاط"
        className="min-h-0 flex-1 justify-center"
        minHeight={200}
      />
    );
  }

  const maxValue = items[0]?.value ?? 1;

  return (
    <div className="flex flex-col gap-2">
      {/* ملخص علوي — مضغوط */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-2 py-1.5 text-xs">
        <span className="text-muted-foreground">إجمالي النشاطات</span>
        <span className="font-semibold tabular-nums">{fmtNum(totalActivities)}</span>
        <span className="text-muted-foreground">عدد الفئات</span>
        <span className="rounded-md bg-background px-2 py-0.5 font-medium tabular-nums">
          {items.length}
        </span>
      </div>

      {/* قائمة بحد أقصى للارتفاع — تمرير عند كثرة الفئات */}
      <div className="max-h-52 overflow-y-auto rounded-lg border border-border/60 bg-muted/10">
        <ul className="divide-y divide-border/50 p-1.5">
          {items.map((item, index) => {
            const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            return (
              <li key={`${item.name}-${index}`} className="py-1.5 first:pt-0.5">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="min-w-0 flex-1 wrap-break-word text-right text-sm font-medium leading-snug"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="tabular-nums text-sm font-semibold">
                      {fmtNum(item.value)}
                    </span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {fmtPct(item.percentOfTotal)}
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: item.fill,
                      minWidth: item.value > 0 ? "4px" : 0,
                    }}
                    aria-hidden
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

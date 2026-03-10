/**
 * مخطط شريطي قطبي (حلقات) للمخزون — شكل مختلف عن الدونات والأعمدة.
 */
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend, Tooltip } from "recharts";
import { CHART_TOOLTIP_STYLE } from "../constants/dashboard.constants";
import { EmptyChartState } from "../components/EmptyChartState";
import { Package } from "lucide-react";
import { fmtNum } from "../utils/dashboard.utils";
import type { TDashboardInventory } from "@/api/v2/dashboard/dashboard.types";

type RadialItem = { name: string; value: number; count: number; fill: string };

function buildRadialData(inventory: TDashboardInventory | undefined): RadialItem[] {
  if (!inventory) return [];
  const available = inventory.available ?? 0;
  const out = inventory.out_of_branch ?? 0;
  const total = available + out;
  if (total <= 0) return [];
  const pctAvail = (available / total) * 100;
  const pctOut = (out / total) * 100;
  return [
    { name: "متاح", value: Math.max(pctAvail, 4), count: available, fill: "hsl(160 55% 42%)" },
    { name: "مستأجر", value: Math.max(pctOut, 4), count: out, fill: "hsl(265 55% 55%)" },
  ];
}

type InventoryRadialChartProps = {
  inventory: TDashboardInventory | undefined;
};

export function InventoryRadialChart({ inventory }: InventoryRadialChartProps) {
  const data = buildRadialData(inventory);

  if (data.length === 0) {
    return (
      <EmptyChartState
        icon={<Package className="h-12 w-12 text-muted-foreground/50" />}
        message="لا توجد بيانات مخزون"
        className="min-h-0 flex-1 justify-center"
        minHeight={200}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* ارتفاع ثابت مضغوط للحلقات */}
      <div className="w-full" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="20%"
            outerRadius="90%"
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              background={{ fill: "var(--muted)" }}
              dataKey="value"
              cornerRadius={8}
            />
            <Tooltip
              formatter={(value, _name, item) => {
                const p = item?.payload as RadialItem | undefined;
                if (!p) return String(value ?? "");
                const total = data.reduce((s, d) => s + d.count, 0);
                const pct = total > 0 ? ((p.count / total) * 100).toFixed(0) : "0";
                return `${p.name}: ${fmtNum(p.count)} (${pct}%)`;
              }}
              contentStyle={CHART_TOOLTIP_STYLE}
            />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-[10px] text-muted-foreground">
        الحلقات تمثل نسبة كل جزء من إجمالي القطع (متاح + مستأجر)
      </p>
    </div>
  );
}

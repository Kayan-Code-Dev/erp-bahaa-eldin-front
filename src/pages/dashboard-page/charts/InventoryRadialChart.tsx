import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EmptyChartState } from "../components/EmptyChartState";
import { Package } from "lucide-react";
import { fmtNum } from "../utils/dashboard.utils";
import type { TDashboardInventory } from "@/api/v2/dashboard/dashboard.types";
import { EChartsBox } from "./echarts";

type RadialItem = { name: string; value: number; count: number };

function buildItems(inventory: TDashboardInventory | undefined): RadialItem[] {
  if (!inventory) return [];
  const available = inventory.available ?? 0;
  const out = inventory.out_of_branch ?? 0;
  const total = available + out;
  if (total <= 0) return [];
  return [
    { name: "متاح", value: available, count: available },
    { name: "مستأجر", value: out, count: out },
  ];
}

type InventoryRadialChartProps = {
  inventory: TDashboardInventory | undefined;
};

export function InventoryRadialChart({ inventory }: InventoryRadialChartProps) {
  const data = useMemo(() => buildItems(inventory), [inventory]);

  const option = useMemo<EChartsOption>(() => {
    const pieData = data.map((d) => ({ name: d.name, value: d.count }));
    return {
      tooltip: {
        trigger: "item",
        formatter: (params: unknown) => {
          const p = params as { name?: string; value?: unknown; percent?: number };
          const val = typeof p.value === "number" ? p.value : Number(p.value) || 0;
          const pct = p.percent != null ? p.percent.toFixed(1) : "0";
          return `${p.name ?? ""}<br/>القطع: <b>${fmtNum(val)}</b> (${pct}%)`;
        },
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        borderWidth: 1,
        padding: 12,
      },
      legend: {
        bottom: 8,
        icon: "roundRect",
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { fontSize: 11 },
      },
      series: [
        {
          name: "المخزون",
          type: "pie",
          radius: ["42%", "68%"],
          center: ["50%", "46%"],
          itemStyle: {
            borderRadius: 8,
            borderColor: "var(--card)",
            borderWidth: 3,
          },
          label: {
            show: true,
            formatter: "{b}\n{d}%",
            fontSize: 11,
            fontWeight: 500,
          },
          labelLine: { length: 12, length2: 8 },
          emphasis: {
            scale: true,
            scaleSize: 8,
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: "rgba(0,0,0,0.2)",
            },
          },
          data: pieData.map((d, i) => ({
            ...d,
            itemStyle: {
              color:
                i === 0
                  ? {
                      type: "linear",
                      x: 0,
                      y: 0,
                      x2: 1,
                      y2: 1,
                      colorStops: [
                        { offset: 0, color: "hsl(160 55% 48%)" },
                        { offset: 1, color: "hsl(160 50% 36%)" },
                      ],
                    }
                  : {
                      type: "linear",
                      x: 0,
                      y: 0,
                      x2: 1,
                      y2: 1,
                      colorStops: [
                        { offset: 0, color: "hsl(265 55% 58%)" },
                        { offset: 1, color: "hsl(265 50% 42%)" },
                      ],
                    },
            },
          })),
        },
      ],
    };
  }, [data]);

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
      <div className="w-full" style={{ height: 200 }}>
        <EChartsBox option={option} height={200} className="border-0 bg-transparent" />
      </div>
      <p className="text-center text-[10px] text-muted-foreground">
        الحلقات تمثل نسبة كل جزء من إجمالي القطع (متاح + مستأجر)
      </p>
    </div>
  );
}

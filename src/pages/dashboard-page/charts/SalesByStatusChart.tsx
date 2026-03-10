import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { ChartContainer } from "./ChartContainer";
import { EmptyChartState } from "../components/EmptyChartState";
import { BarChart3 } from "lucide-react";
import { ORDER_STATUS_LABELS } from "../constants/dashboard.constants";
import { EChartsBox, barGradient, getDashboardChartColors } from "./echarts";

export type SalesByStatusItem = {
  name: string;
  طلبات: number;
  إيرادات: number;
};

type SalesByStatusChartProps = {
  data: SalesByStatusItem[];
  chartHeight?: number;
  fillHeight?: boolean;
  fillMinHeight?: number;
};

const DEFAULT_CHART_HEIGHT = 280;

export function SalesByStatusChart({
  data,
  chartHeight = DEFAULT_CHART_HEIGHT,
  fillHeight,
  fillMinHeight = 480,
}: SalesByStatusChartProps) {
  const colors = useMemo(() => getDashboardChartColors(), []);
  const option = useMemo<EChartsOption>(() => {
    const categories = data.map((d) => d.name);
    const barData = data.map((d) => d.طلبات);
    const lineData = data.map((d) => d.إيرادات);
    const c1 = colors[0] ?? "#4f6bf7";
    const c2 = colors[1] ?? "#16c098";

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross", crossStyle: { color: "#999" } },
        formatter: (params: unknown) => {
          const list = Array.isArray(params) ? params : [params];
          const first = list[0] as { axisValue?: string };
          const lines = [`<div style="font-weight:600;margin-bottom:6px">${first?.axisValue ?? ""}</div>`];
          for (const p of list) {
            const item = p as { seriesName?: string; value?: number; marker?: string };
            const v = item.value != null ? Number(item.value).toLocaleString("en-US") : "";
            lines.push(`${item.marker ?? ""} ${item.seriesName ?? ""}: <b>${v}</b>`);
          }
          return lines.join("<br/>");
        },
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        borderWidth: 1,
        padding: 12,
        textStyle: { fontSize: 12 },
        extraCssText: "border-radius:12px;box-shadow:var(--shadow-lg)",
      },
      legend: {
        data: ["عدد الطلبات", "إيرادات (آلاف)"],
        bottom: 0,
        textStyle: { fontSize: 11 },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: 52,
        top: 48,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: categories,
        axisLabel: { rotate: 18, interval: 0 },
        axisTick: { alignWithLabel: true },
      },
      yAxis: [
        {
          type: "value",
          name: "طلبات",
          nameTextStyle: { fontSize: 10 },
          splitLine: { show: true },
        },
        {
          type: "value",
          name: "آلاف",
          nameTextStyle: { fontSize: 10 },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "عدد الطلبات",
          type: "bar",
          yAxisIndex: 0,
          data: barData,
          barMaxWidth: 48,
          itemStyle: {
            color: barGradient(c1, colors[2]),
            borderRadius: [8, 8, 4, 4],
            shadowBlur: 8,
            shadowColor: "rgba(79, 107, 247, 0.25)",
            shadowOffsetY: 4,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 16,
              shadowColor: "rgba(79, 107, 247, 0.35)",
            },
          },
        },
        {
          name: "إيرادات (آلاف)",
          type: "line",
          yAxisIndex: 1,
          data: lineData,
          smooth: 0.35,
          symbol: "circle",
          symbolSize: 8,
          lineStyle: { width: 3, shadowBlur: 6, shadowColor: "rgba(22, 192, 152, 0.35)" },
          itemStyle: {
            color: c2,
            borderWidth: 2,
            borderColor: "#fff",
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(22, 192, 152, 0.28)" },
                { offset: 1, color: "rgba(22, 192, 152, 0.02)" },
              ],
            },
          },
        },
      ],
    };
  }, [data, colors]);

  if (data.length === 0) {
    return (
      <div className={fillHeight ? "flex min-h-0 flex-1 flex-col" : undefined}>
        <EmptyChartState
          icon={<BarChart3 className="h-12 w-12 text-muted-foreground/50" />}
          message="لا توجد بيانات مبيعات للفترة المحددة"
          minHeight={fillHeight ? fillMinHeight : chartHeight}
          className={fillHeight ? "min-h-0 flex-1 justify-center" : undefined}
        />
      </div>
    );
  }

  if (fillHeight) {
    return (
      <ChartContainer fillParent minHeight={fillMinHeight}>
        <EChartsBox option={option} fillParent minHeight={fillMinHeight} className="border-0 bg-transparent" />
      </ChartContainer>
    );
  }

  return (
    <ChartContainer height={chartHeight}>
      <EChartsBox option={option} height={chartHeight - 32} className="border-0 bg-transparent" />
    </ChartContainer>
  );
}

export function buildSalesByStatusData(
  byStatus: Record<string, { count: number; revenue: number }> | undefined
): SalesByStatusItem[] {
  if (!byStatus || Object.keys(byStatus).length === 0) return [];
  return Object.entries(byStatus).map(([status, info]) => ({
    name: ORDER_STATUS_LABELS[status] ?? status,
    طلبات: info?.count ?? 0,
    إيرادات: Math.round((info?.revenue ?? 0) / 1000),
  }));
}

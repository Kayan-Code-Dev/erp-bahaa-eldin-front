import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { ChartContainer } from "./ChartContainer";
import { EChartsBox, getDashboardChartColors } from "./echarts";

export type AttendanceTrendPoint = {
  date: string;
  معدل: number;
  حاضر: number;
  إجمالي: number;
};

export type PayrollTrendPoint = {
  date: string;
  رواتب: number;
  كشوف: number;
};

type AttendanceTrendChartProps = {
  data: AttendanceTrendPoint[];
};

export function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
  const colors = useMemo(() => getDashboardChartColors(), []);
  const option = useMemo<EChartsOption>(() => {
    const dates = data.map((d) => d.date);
    const values = data.map((d) => d.معدل);
    const c1 = colors[0] ?? "#4f6bf7";
    return {
      tooltip: {
        trigger: "axis",
        formatter: (params: unknown) => {
          const list = Array.isArray(params) ? params : [params];
          const p = list[0] as { axisValue?: string; value?: number; marker?: string };
          const v = p.value != null ? `${Number(p.value).toFixed(1)}%` : "";
          return `${p.axisValue ?? ""}<br/>${p.marker ?? ""} معدل الحضور: <b>${v}</b>`;
        },
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        borderWidth: 1,
        padding: 12,
      },
      grid: { left: "3%", right: "4%", bottom: 36, top: 24, containLabel: true },
      xAxis: { type: "category", boundaryGap: false, data: dates },
      yAxis: {
        type: "value",
        axisLabel: { formatter: (v: number) => `${v}%` },
        splitLine: { show: true },
      },
      series: [
        {
          name: "معدل الحضور",
          type: "line",
          smooth: 0.4,
          data: values,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 3, color: c1 },
          itemStyle: { color: c1 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${c1}55` },
                { offset: 1, color: `${c1}05` },
              ],
            },
          },
        },
      ],
    };
  }, [data, colors]);

  if (data.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">اتجاه الحضور (يومي)</h3>
      <ChartContainer height={260}>
        <EChartsBox option={option} height={228} className="border-0 bg-transparent" />
      </ChartContainer>
    </div>
  );
}

type PayrollTrendChartProps = {
  data: PayrollTrendPoint[];
};

export function PayrollTrendChart({ data }: PayrollTrendChartProps) {
  const colors = useMemo(() => getDashboardChartColors(), []);
  const option = useMemo<EChartsOption>(() => {
    const dates = data.map((d) => d.date);
    const c2 = colors[1] ?? "#16c098";
    const c3 = colors[2] ?? "#f59e0b";
    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        borderWidth: 1,
        padding: 12,
      },
      legend: { bottom: 0, data: ["رواتب (آلاف)", "كشوف"], textStyle: { fontSize: 11 } },
      grid: { left: "3%", right: "4%", bottom: 48, top: 24, containLabel: true },
      xAxis: { type: "category", boundaryGap: false, data: dates },
      yAxis: { type: "value", splitLine: { show: true } },
      series: [
        {
          name: "رواتب (آلاف)",
          type: "line",
          smooth: 0.35,
          data: data.map((d) => d.رواتب),
          lineStyle: { width: 3 },
          itemStyle: { color: c2 },
          symbol: "circle",
          symbolSize: 6,
          emphasis: { focus: "series" },
        },
        {
          name: "كشوف",
          type: "line",
          smooth: 0.35,
          data: data.map((d) => d.كشوف),
          lineStyle: { width: 3 },
          itemStyle: { color: c3 },
          symbol: "diamond",
          symbolSize: 7,
          emphasis: { focus: "series" },
        },
      ],
    };
  }, [data, colors]);

  if (data.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">اتجاه الرواتب (يومي — بالآلاف)</h3>
      <ChartContainer height={260}>
        <EChartsBox option={option} height={228} className="border-0 bg-transparent" />
      </ChartContainer>
    </div>
  );
}

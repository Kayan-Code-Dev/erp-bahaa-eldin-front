import * as echarts from "echarts";

const THEME_NAME = "dashboardPro";

function cssVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

let registered = false;

export function registerDashboardEchartsTheme(): void {
  if (registered) return;
  registered = true;

  const text = cssVar("--foreground", "#1a1a2e");
  const muted = cssVar("--muted-foreground", "#64748b");
  const border = cssVar("--border", "#e2e8f0");
  const card = cssVar("--card", "#ffffff");
  const chart1 = cssVar("--chart-1", "#4f6bf7");
  const chart2 = cssVar("--chart-2", "#16c098");
  const chart3 = cssVar("--chart-3", "#f59e0b");
  const chart4 = cssVar("--chart-4", "#a855f7");
  const chart5 = cssVar("--chart-5", "#ef4444");

  echarts.registerTheme(THEME_NAME, {
    color: [chart1, chart2, chart3, chart4, chart5, "#6366f1", "#14b8a6", "#f97316"],
    backgroundColor: "transparent",
    textStyle: {
      fontFamily: "Cairo, sans-serif",
      color: muted,
    },
    title: { textStyle: { color: text } },
    line: {
      itemStyle: { borderWidth: 2 },
      lineStyle: { width: 2 },
      symbolSize: 6,
      emphasis: {
        itemStyle: { borderWidth: 3 },
        lineStyle: { width: 3 },
      },
    },
    bar: {
      itemStyle: { barBorderRadius: [6, 6, 0, 0], borderWidth: 0 },
      emphasis: { itemStyle: { shadowBlur: 12, shadowColor: "rgba(0,0,0,0.12)" } },
    },
    pie: {
      itemStyle: { borderColor: card, borderWidth: 2, borderRadius: 6 },
      emphasis: { itemStyle: { shadowBlur: 14, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.15)" } },
    },
    categoryAxis: {
      axisLine: { lineStyle: { color: border } },
      axisTick: { lineStyle: { color: border } },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: [border], opacity: 0.5, type: "dashed" } },
    },
    valueAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: [border], opacity: 0.5, type: "dashed" } },
    },
    radar: {
      axisLine: { lineStyle: { color: border } },
      splitLine: { lineStyle: { color: border } },
      splitArea: { show: false },
    },
    gauge: {
      axisLine: { lineStyle: { width: 10 } },
    },
  });
}

export function getDashboardChartColors(): string[] {
  return [
    cssVar("--chart-1", "#4f6bf7"),
    cssVar("--chart-2", "#16c098"),
    cssVar("--chart-3", "#f59e0b"),
    cssVar("--chart-4", "#a855f7"),
    cssVar("--chart-5", "#ef4444"),
  ];
}

export function getEchartsThemeName(): string {
  return THEME_NAME;
}

export function barGradient(topColor: string, bottomColor?: string): echarts.graphic.LinearGradient {
  const bottom = bottomColor ?? darkenHex(topColor, -0.18);
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: topColor },
    { offset: 1, color: bottom },
  ]);
}

function darkenHex(hexOrCss: string, amount: number): string {
  if (!hexOrCss.startsWith("#")) return hexOrCss;
  const hex = hexOrCss.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const nr = Math.round(Math.max(0, Math.min(255, r * (1 + amount))));
  const ng = Math.round(Math.max(0, Math.min(255, g * (1 + amount))));
  const nb = Math.round(Math.max(0, Math.min(255, b * (1 + amount))));
  return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
}

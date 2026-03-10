import { useEffect, useMemo, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption, EChartsType } from "echarts";
import { registerDashboardEchartsTheme, getEchartsThemeName } from "./dashboardEchartsTheme";

type EChartsBoxProps = {
  option: EChartsOption;
  height?: number;
  fillParent?: boolean;
  minHeight?: number;
  className?: string;
  onChartReady?: (instance: EChartsType) => void;
};

export function EChartsBox({
  option,
  height = 280,
  fillParent,
  minHeight = 200,
  className = "",
  onChartReady,
}: EChartsBoxProps) {
  useEffect(() => {
    registerDashboardEchartsTheme();
  }, []);

  const style = useMemo(
    () =>
      fillParent
        ? { height: "100%", minHeight }
        : { height: typeof height === "number" ? `${height}px` : height },
    [fillParent, height, minHeight]
  );

  const mergedOption = useMemo(() => {
    const base: EChartsOption = {
      textStyle: { fontFamily: "Cairo, sans-serif" },
      animation: true,
      animationDuration: 600,
      animationEasing: "cubicOut",
    };
    return { ...base, ...option } as EChartsOption;
  }, [option]);

  const onReady = useCallback(
    (instance: EChartsType) => {
      onChartReady?.(instance);
    },
    [onChartReady]
  );

  return (
    <div
      className={`rounded-xl border border-border/40 bg-muted/10 ${fillParent ? "min-h-0 flex-1" : ""} ${className}`.trim()}
      style={style as React.CSSProperties}
    >
      <ReactECharts
        option={mergedOption}
        theme={getEchartsThemeName()}
        style={{ width: "100%", height: "100%", minHeight: fillParent ? minHeight : undefined }}
        opts={{ renderer: "canvas", locale: "AR" }}
        notMerge={false}
        lazyUpdate
        onChartReady={onReady}
      />
    </div>
  );
}

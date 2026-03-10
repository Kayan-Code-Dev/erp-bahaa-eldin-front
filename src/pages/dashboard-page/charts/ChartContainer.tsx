import type { CSSProperties } from "react";
import { CHART_CONTAINER_CLASS } from "../constants/dashboard.constants";

type ChartContainerProps = {
  children: React.ReactNode;
  height?: string | number;
  className?: string;
  /**
   * عند true: يملأ ارتفاع الأب (flex) مع حد أدنى — ليتوازن مع بطاقة مجاورة أطول.
   */
  fillParent?: boolean;
  /** مع fillParent: الحد الأدنى للارتفاع بالبكسل */
  minHeight?: number;
};

export function ChartContainer({
  children,
  height = 280,
  className = "",
  fillParent,
  minHeight = 400,
}: ChartContainerProps) {
  const style: CSSProperties = fillParent
    ? { height: "100%", minHeight }
    : typeof height === "number"
      ? { height: `${height}px` }
      : { height };

  const flexClass = fillParent ? "min-h-0 flex-1" : "";

  return (
    <div
      className={`${CHART_CONTAINER_CLASS} ${flexClass} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}

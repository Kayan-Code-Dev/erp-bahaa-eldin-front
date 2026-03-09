import { CHART_CONTAINER_CLASS } from "../constants/dashboard.constants";

type ChartContainerProps = {
  children: React.ReactNode;
  height?: string | number;
  className?: string;
};

export function ChartContainer({
  children,
  height = 280,
  className = "",
}: ChartContainerProps) {
  const style = typeof height === "number" ? { height: `${height}px` } : { height };

  return (
    <div className={`${CHART_CONTAINER_CLASS} ${className}`} style={style}>
      {children}
    </div>
  );
}

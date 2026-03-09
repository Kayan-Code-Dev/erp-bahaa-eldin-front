import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CHART_TOOLTIP_STYLE } from "../constants/dashboard.constants";
import { ChartContainer } from "./ChartContainer";
import { EmptyChartState } from "../components/EmptyChartState";

export type DonutDataItem = { name: string; value: number; fill: string };

type DonutChartProps = {
  data: DonutDataItem[];
  height?: number;
  emptyIcon: React.ReactNode;
  emptyMessage: string;
  labelFormatter?: (name: string, value: number, percent: number) => string;
};

export function DonutChart({
  data,
  height = 240,
  emptyIcon,
  emptyMessage,
  labelFormatter,
}: DonutChartProps) {
  if (data.length === 0) {
    return <EmptyChartState icon={emptyIcon} message={emptyMessage} />;
  }

  return (
    <ChartContainer height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={2}
            label={
              labelFormatter
                ? ({ name, value, percent }) => labelFormatter(name, value, percent * 100)
                : undefined
            }
          >
            {data.map((_, i) => (
              <Cell key={i} fill={data[i].fill} stroke="var(--card)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => value.toLocaleString("en-US")}
            contentStyle={CHART_TOOLTIP_STYLE}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

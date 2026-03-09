import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { CHART_TOOLTIP_STYLE } from "../constants/dashboard.constants";
import { ChartContainer } from "./ChartContainer";

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
  if (data.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">اتجاه الحضور (يومي)</h3>
      <ChartContainer height={260}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <defs>
              <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <Tooltip
              formatter={(value: number) => `${Number(value).toFixed(1)}%`}
              contentStyle={CHART_TOOLTIP_STYLE}
            />
            <Area
              type="monotone"
              dataKey="معدل"
              stroke="var(--chart-1)"
              fill="url(#attGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

type PayrollTrendChartProps = {
  data: PayrollTrendPoint[];
};

export function PayrollTrendChart({ data }: PayrollTrendChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">اتجاه الرواتب (يومي — بالآلاف)</h3>
      <ChartContainer height={260}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Legend />
            <Line
              type="monotone"
              dataKey="رواتب"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="كشوف"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

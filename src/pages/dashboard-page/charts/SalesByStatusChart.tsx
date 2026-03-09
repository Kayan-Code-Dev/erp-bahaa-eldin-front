import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { CHART_TOOLTIP_STYLE } from "../constants/dashboard.constants";
import { ORDER_STATUS_LABELS } from "../constants/dashboard.constants";
import { ChartContainer } from "./ChartContainer";
import { EmptyChartState } from "../components/EmptyChartState";
import { BarChart3 } from "lucide-react";

export type SalesByStatusItem = {
  name: string;
  طلبات: number;
  إيرادات: number;
};

type SalesByStatusChartProps = {
  data: SalesByStatusItem[];
};

export function SalesByStatusChart({ data }: SalesByStatusChartProps) {
  if (data.length === 0) {
    return (
      <EmptyChartState
        icon={<BarChart3 className="h-12 w-12 text-muted-foreground/50" />}
        message="لا توجد بيانات مبيعات للفترة المحددة"
      />
    );
  }

  return (
    <ChartContainer height={280}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 60, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <Tooltip
            formatter={(value: number) => value.toLocaleString("en-US")}
            contentStyle={CHART_TOOLTIP_STYLE}
          />
          <Legend />
          <Bar dataKey="طلبات" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="إيرادات" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
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

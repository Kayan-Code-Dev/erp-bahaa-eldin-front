/**
 * مخطط مكوّن: أعمدة لعدد الطلبات + خط للإيرادات (بالآلاف) — شكل مختلف عن باقي الأقسام.
 */
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { CHART_TOOLTIP_STYLE, ORDER_STATUS_LABELS } from "../constants/dashboard.constants";
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
  /** ارتفاع منطقة المخطط بالبكسل — يُتجاهل إن كان fillHeight=true */
  chartHeight?: number;
  /**
   * true: المخطط يملأ ارتفاع البطاقة (نفس ارتفاع عمود الإيرادات/المصروفات)
   */
  fillHeight?: boolean;
  /** مع fillHeight — الحد الأدنى للارتفاع */
  fillMinHeight?: number;
};

const DEFAULT_CHART_HEIGHT = 280;

export function SalesByStatusChart({
  data,
  chartHeight = DEFAULT_CHART_HEIGHT,
  fillHeight,
  fillMinHeight = 480,
}: SalesByStatusChartProps) {
  if (data.length === 0) {
    return (
      <div
        className={
          fillHeight ? "flex min-h-0 flex-1 flex-col" : undefined
        }
      >
        <EmptyChartState
          icon={<BarChart3 className="h-12 w-12 text-muted-foreground/50" />}
          message="لا توجد بيانات مبيعات للفترة المحددة"
          minHeight={fillHeight ? fillMinHeight : chartHeight}
          className={fillHeight ? "min-h-0 flex-1 justify-center" : undefined}
        />
      </div>
    );
  }

  return (
    <ChartContainer
      fillParent={fillHeight}
      minHeight={fillMinHeight}
      height={fillHeight ? undefined : chartHeight}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 16, right: 16, left: 12, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={50}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          />
          <Tooltip
            formatter={(value) =>
              value != null ? Number(value).toLocaleString("en-US") : ""
            }
            contentStyle={CHART_TOOLTIP_STYLE}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="طلبات"
            name="عدد الطلبات"
            fill="var(--chart-1)"
            radius={[6, 6, 0, 0]}
            maxBarSize={56}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="إيرادات"
            name="إيرادات (آلاف)"
            stroke="var(--chart-2)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--chart-2)" }}
          />
        </ComposedChart>
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

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { CHART_TOOLTIP_STYLE, CHART_COLORS, PAYMENT_METHOD_LABELS } from "../constants/dashboard.constants";
import { ChartContainer } from "./ChartContainer";
import { EmptyChartState } from "../components/EmptyChartState";
import { Banknote } from "lucide-react";
import type { TDashboardPayments } from "@/api/v2/dashboard/dashboard.types";

export type PaymentChartItem = { name: string; عدد: number; مبلغ: number; fill: string };

function buildPaymentsChartData(payments: TDashboardPayments | undefined): PaymentChartItem[] {
  if (!payments?.by_method || Object.keys(payments.by_method).length === 0) return [];
  return Object.entries(payments.by_method).map(([method, info], i) => ({
    name: PAYMENT_METHOD_LABELS[method] ?? method,
    عدد: info?.count ?? 0,
    مبلغ: Math.round((info?.total ?? 0) / 1000),
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));
}

type PaymentsByMethodChartProps = {
  payments: TDashboardPayments | undefined;
};

export function PaymentsByMethodChart({ payments }: PaymentsByMethodChartProps) {
  const data = buildPaymentsChartData(payments);

  if (data.length === 0) {
    return (
      <EmptyChartState
        icon={<Banknote className="h-12 w-12 text-muted-foreground/50" />}
        message="لا توجد بيانات مدفوعات للفترة"
      />
    );
  }

  return (
    <ChartContainer height={240}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 8, left: 55, bottom: 8 }}
        >
          <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <YAxis type="category" dataKey="name" width={52} tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value: number) => value.toLocaleString("en-US")}
            contentStyle={CHART_TOOLTIP_STYLE}
          />
          <Bar dataKey="عدد" name="عدد العمليات" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={data[i].fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

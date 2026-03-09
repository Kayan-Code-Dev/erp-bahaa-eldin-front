import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { SummaryRow } from "../components/SummaryRow";
import { fmtCur, fmtPct } from "../utils/dashboard.utils";
import type { TDashboardFinancial } from "@/api/v2/dashboard/dashboard.types";

type FinancialSummaryCardProps = {
  financial: TDashboardFinancial | undefined;
};

type FinancialBarItem = { name: string; value: number; fill: string };

function buildFinancialChartData(financial: TDashboardFinancial | undefined): FinancialBarItem[] {
  if (!financial) return [];
  const income = financial.total_income ?? 0;
  const expenses = financial.total_expenses ?? 0;
  return [
    { name: "إيرادات", value: income, fill: "hsl(160 60% 45%)" },
    { name: "مصروفات", value: expenses, fill: "hsl(0 70% 50%)" },
  ].filter((d) => d.value > 0);
}

export function FinancialSummaryCard({ financial }: FinancialSummaryCardProps) {
  const chartData = buildFinancialChartData(financial);

  return (
    <Card className="overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          الإيرادات والمصروفات
        </CardTitle>
        <CardDescription className="text-right">
          مقارنة إجمالي الإيرادات والمصروفات
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-3 rounded-xl bg-muted/50 p-3">
            <SummaryRow
              label="إيرادات"
              value={fmtCur(financial?.total_income)}
              accent="text-emerald-600 dark:text-emerald-400"
            />
            <SummaryRow
              label="مصروفات"
              value={fmtCur(financial?.total_expenses)}
              accent="text-red-600 dark:text-red-400"
            />
          </div>
          <SummaryRow
            label="الربح"
            value={fmtCur(financial?.profit)}
            accent="text-emerald-600 dark:text-emerald-400"
          />
          <SummaryRow label="هامش الربح" value={fmtPct(financial?.profit_margin)} />
          {chartData.length > 0 && (
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 50, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 11 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={chartData[i].fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {financial?.cashbox_balances && financial.cashbox_balances.length > 0 && (
            <div className="border-t pt-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">
                أرصدة الصناديق
              </p>
              <ul className="space-y-1.5">
                {financial.cashbox_balances.map((cb) => (
                  <li
                    key={cb.cashbox_id}
                    className="flex justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{cb.name}</span>
                    <span className="tabular-nums">{fmtCur(cb.balance)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

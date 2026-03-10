import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CHART_TOOLTIP_STYLE } from "../constants/dashboard.constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  const cashboxes = financial?.cashbox_balances;
  const cashboxCount = cashboxes?.length ?? 0;

  return (
    <Card className="flex h-full w-full min-h-[560px] flex-col overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm">
      <CardHeader className="shrink-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          الإيرادات والمصروفات
        </CardTitle>
        <CardDescription className="text-right">
          دائرة توزيع — إيرادات مقابل مصروفات ثم الأرصدة
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
        <div className="flex shrink-0 gap-3 rounded-xl bg-muted/50 p-3">
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
          {/* مخطط دائري للإيرادات/المصروفات — شكل مختلف عن الأعمدة في باقي الأقسام */}
          {chartData.length > 0 && (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                    label={false}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={chartData[i].fill} stroke="var(--card)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      value != null ? Number(value).toLocaleString("en-US") : ""
                    }
                    contentStyle={CHART_TOOLTIP_STYLE}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {cashboxes && cashboxCount > 0 && (
            <div className="mt-auto min-h-0 border-t pt-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  أرصدة الصناديق
                </p>
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  {cashboxCount}
                </span>
              </div>
              {/* ارتفاع ثابت + تمرير حتى لا تمتد البطاقة وتكبّر الصف بجانب مخطط المبيعات */}
              <ScrollArea className="h-44 rounded-lg border border-border/60 bg-muted/20 pr-1">
                <ul className="space-y-1 p-1.5">
                  {cashboxes.map((cb) => (
                    <li
                      key={cb.cashbox_id}
                      className="flex items-center justify-between gap-2 rounded-md bg-background/80 px-2.5 py-1.5 text-sm shadow-sm"
                    >
                      <span className="min-w-0 flex-1 truncate font-medium" title={cb.name}>
                        {cb.name}
                      </span>
                      <span className="shrink-0 tabular-nums text-xs font-semibold">
                        {fmtCur(cb.balance)}
                      </span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
      </CardContent>
    </Card>
  );
}

import { Banknote } from "lucide-react";
import { EmptyChartState } from "../components/EmptyChartState";
import { CHART_COLORS, PAYMENT_METHOD_LABELS } from "../constants/dashboard.constants";
import { fmtCur, fmtNum } from "../utils/dashboard.utils";
import type { TDashboardPayments } from "@/api/v2/dashboard/dashboard.types";

type LaneItem = {
  key: string;
  label: string;
  count: number;
  total: number;
  fill: string;
  percentOfTotal: number;
};

function buildLanes(payments: TDashboardPayments | undefined): LaneItem[] {
  if (!payments?.by_method || Object.keys(payments.by_method).length === 0) return [];
  const entries = Object.entries(payments.by_method);
  const sumTotal = entries.reduce((s, [, info]) => s + (info?.total ?? 0), 0);
  const sumCount = entries.reduce((s, [, info]) => s + (info?.count ?? 0), 0);
  const useAmounts = sumTotal > 0;
  const lanes: LaneItem[] = [];

  entries.forEach(([method, info], i) => {
    const count = info?.count ?? 0;
    const total = info?.total ?? 0;
    const denominator = useAmounts ? sumTotal : sumCount > 0 ? sumCount : 1;
    const numerator = useAmounts ? total : count;
    if (numerator <= 0 && count <= 0) return;
    const percentOfTotal =
      denominator > 0 ? Math.min(100, Math.round((numerator / denominator) * 1000) / 10) : 0;
    lanes.push({
      key: method,
      label: PAYMENT_METHOD_LABELS[method] ?? method,
      count,
      total,
      fill: String(CHART_COLORS[i % CHART_COLORS.length]),
      percentOfTotal: percentOfTotal || (count > 0 ? 1 : 0),
    });
  });

  return lanes.sort((a, b) => (b.total || b.count) - (a.total || a.count));
}

type PaymentsByMethodLanesProps = {
  payments: TDashboardPayments | undefined;
};

export function PaymentsByMethodLanes({ payments }: PaymentsByMethodLanesProps) {
  const lanes = buildLanes(payments);

  if (lanes.length === 0) {
    return (
      <EmptyChartState
        icon={<Banknote className="h-12 w-12 text-muted-foreground/50" />}
        message="لا توجد بيانات مدفوعات للفترة"
        title="المدفوعات حسب النوع"
        className="min-h-0 flex-1 justify-center"
        minHeight={200}
      />
    );
  }

  const grandTotal = lanes.reduce((s, l) => s + l.total, 0);
  const grandCount = lanes.reduce((s, l) => s + l.count, 0);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/10 p-3">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Banknote className="h-4 w-4 shrink-0" />
          <span>توزيع حسب النوع (نسبة من الإجمالي)</span>
        </div>
        <div className="flex flex-wrap gap-4 text-xs tabular-nums">
          {grandTotal > 0 && (
            <span className="rounded-lg bg-card px-2 py-1 font-medium shadow-sm">
              إجمالي المبالغ: <span className="text-foreground">{fmtCur(grandTotal)}</span>
            </span>
          )}
          <span className="rounded-lg bg-card px-2 py-1 font-medium shadow-sm">
            إجمالي العمليات: <span className="text-foreground">{fmtNum(grandCount)}</span>
          </span>
        </div>
      </div>

      <ul className="flex max-h-40 flex-col gap-2 overflow-y-auto">
        {lanes.map((lane) => (
          <li key={lane.key} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-semibold text-foreground">{lane.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {lane.total > 0 ? fmtCur(lane.total) : "—"} · {fmtNum(lane.count)} عملية
              </span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{
                  width: `${Math.max(lane.percentOfTotal, lane.count > 0 ? 4 : 0)}%`,
                  backgroundColor: lane.fill,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
                }}
                title={`${lane.percentOfTotal}%`}
              />
            </div>
            <div className="text-[11px] tabular-nums text-muted-foreground">
              {lane.percentOfTotal}% من إجمالي {grandTotal > 0 ? "المبالغ" : "العمليات"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

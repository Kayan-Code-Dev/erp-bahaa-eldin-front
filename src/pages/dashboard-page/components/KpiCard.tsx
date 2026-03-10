import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type KpiCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  title: string;
  value: number | string;
  suffix?: string;
  subtitle?: string;
  trend?: number;
};

export function KpiCard({
  icon,
  iconBg,
  borderColor,
  title,
  value,
  suffix,
  subtitle,
  trend,
}: KpiCardProps) {
  const numericTrend =
    typeof trend === "number" && !Number.isNaN(trend) ? trend : undefined;
  const isUp = numericTrend !== undefined && numericTrend > 0;
  const isDown = numericTrend !== undefined && numericTrend < 0;

  return (
    <Card
      className={`h-full rounded-2xl border border-border border-l-4 ${borderColor} shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 bg-card`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 text-right flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
            <div className="flex items-baseline justify-end gap-1 flex-wrap">
              <span className="text-2xl font-bold tabular-nums">{value}</span>
              {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
            </div>
            {subtitle && (
              <p className="mt-1 text-[11px] text-muted-foreground leading-tight">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
          >
            {icon}
          </div>
        </div>
        {numericTrend !== undefined && (isUp || isDown) && (
          <div className="mt-2 flex items-center justify-end gap-1 text-[11px]">
            {isUp && <ChevronUp className="h-3 w-3 text-emerald-600" aria-hidden />}
            {isDown && <ChevronDown className="h-3 w-3 text-red-600" aria-hidden />}
            <span className={isUp ? "text-emerald-600" : isDown ? "text-red-600" : ""}>
              {Math.abs(numericTrend).toFixed(1)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  periodLabel: string;
  showFilters: boolean;
  onToggleFilters: () => void;
};

export function DashboardHeader({
  periodLabel,
  showFilters,
  onToggleFilters,
}: DashboardHeaderProps) {
  return (
    <header className="mb-6 rounded-2xl border border-primary-foreground/10 bg-linear-to-l from-primary via-primary to-primary/95 px-6 py-6 text-primary-foreground shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">لوحة التحكم</h1>
            <span className="rounded-full bg-primary-foreground/15 px-2.5 py-0.5 text-xs font-medium">
              {periodLabel}
            </span>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-primary-foreground/85">
            <Clock className="h-3.5 w-3.5 opacity-80" />
            نظرة عامة على أداء النظام
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onToggleFilters}
          className="shrink-0 rounded-xl border-0 bg-white/15 font-medium text-white hover:bg-white/25"
        >
          <Filter className="ml-2 h-4 w-4" />
          {showFilters ? "إخفاء الفلاتر" : "عرض الفلاتر"}
        </Button>
      </div>
    </header>
  );
}

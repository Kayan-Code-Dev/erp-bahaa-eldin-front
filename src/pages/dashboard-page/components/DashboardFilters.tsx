import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/custom/DatePicker";
import { BranchesSelect } from "@/components/custom/BranchesSelect";
import { DepartmentsSelect } from "@/components/custom/departments-select";
import type { TDashboardOverviewParams } from "@/api/v2/dashboard/dashboard.types";
import { PERIOD_OPTIONS } from "../constants/dashboard.constants";

type DashboardFiltersProps = {
  filters: TDashboardOverviewParams;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onFilterChange: (key: keyof TDashboardOverviewParams, value: unknown) => void;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
  onReset: () => void;
};

export function DashboardFilters({
  filters,
  dateFrom,
  dateTo,
  onFilterChange,
  onDateFromChange,
  onDateToChange,
  onReset,
}: DashboardFiltersProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">فلاتر لوحة التحكم</CardTitle>
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs">
            إعادة التعيين
          </Button>
        </div>
        <CardDescription className="text-right">
          اختر الفترة والفرع والقسم لعرض بيانات مخصصة.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">الفترة</Label>
            <Select
              value={filters.period ?? "month"}
              onValueChange={(v) => onFilterChange("period", v === "all" ? undefined : v)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="اختر الفترة" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.filter((o) => o.value != null).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value!}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">من تاريخ</Label>
            <DatePicker
              value={dateFrom}
              onChange={onDateFromChange}
              placeholder="اختر تاريخ البداية"
              allowPastDates
              allowFutureDates={false}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">إلى تاريخ</Label>
            <DatePicker
              value={dateTo}
              onChange={onDateToChange}
              placeholder="اختر تاريخ النهاية"
              allowPastDates
              allowFutureDates={false}
              minDate={dateFrom}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">الفرع</Label>
            <BranchesSelect
              value={filters.branch_id ? String(filters.branch_id) : ""}
              onChange={(v) => onFilterChange("branch_id", v ? Number(v) : undefined)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">القسم (للحضور)</Label>
            <DepartmentsSelect
              value={filters.department_id ? String(filters.department_id) : ""}
              onChange={(v) => onFilterChange("department_id", v ? Number(v) : undefined)}
              placeholder="جميع الأقسام"
              allowClear
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

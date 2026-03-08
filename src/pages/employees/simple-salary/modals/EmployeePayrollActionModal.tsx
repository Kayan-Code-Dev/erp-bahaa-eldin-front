import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGetSimpleSalarySummaryQueryOptions } from "@/api/simple-salary/simple-salary.hooks";
import { getDefaultPeriod, PERIOD_REGEX } from "../constants";
import { SimpleSalarySummaryCard } from "../SimpleSalarySummaryCard";
import { AddSimpleSalaryDeductionModal } from "./AddSimpleSalaryDeductionModal";
import { PaySimpleSalaryModal } from "./PaySimpleSalaryModal";
import { Calendar, FileBarChart, Loader2 } from "lucide-react";

export type EmployeePayrollActionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  employeeName: string;
  employeeCode?: string;
};

export function EmployeePayrollActionModal({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  employeeCode = "",
}: EmployeePayrollActionModalProps) {
  const [period, setPeriod] = useState(getDefaultPeriod());
  const [addDeductionOpen, setAddDeductionOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);

  const periodValid = useMemo(() => !!period && PERIOD_REGEX.test(period), [period]);

  const {
    data: summary,
    isPending: summaryPending,
    refetch: refetchSummary,
  } = useQuery({
    ...useGetSimpleSalarySummaryQueryOptions(employeeId, periodValid ? period : null),
    enabled: open && periodValid,
    staleTime: 1000 * 60 * 2,
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-[calc(100%-2rem)] sm:max-w-[90vw] sm:w-[90vw] gap-0 overflow-hidden rounded-2xl p-0">
          <DialogHeader className="border-b border-border/80 bg-muted/20 px-6 py-5">
            <div className="flex flex-wrap items-center gap-4">
              <DialogTitle className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileBarChart className="h-5 w-5" />
                </span>
                كشف الراتب — {employeeName}
                {employeeCode && (
                  <span className="font-mono text-sm font-normal text-muted-foreground">
                    ({employeeCode})
                  </span>
                )}
              </DialogTitle>
              <div className="flex h-10 min-w-40 items-center gap-2 rounded-lg border border-input bg-background px-3 has-focus:ring-2 has-focus:ring-ring ms-auto">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  type="month"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="h-9 min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto">
            <div className="space-y-5 px-6 py-5">
              {!periodValid && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/10 py-10 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground">
                    اختر شهراً صالحاً (YYYY-MM) لعرض الملخص.
                  </p>
                </div>
              )}

              {periodValid && summaryPending && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-muted/10 py-14">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">
                    جاري تحميل الملخص...
                  </p>
                </div>
              )}

              {periodValid && !summaryPending && summary && (
                <SimpleSalarySummaryCard
                  summary={summary}
                  onAddDeduction={() => setAddDeductionOpen(true)}
                  onPay={() => setPayModalOpen(true)}
                />
              )}

              {periodValid && !summaryPending && !summary && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/10 py-12 text-center">
                  <FileBarChart className="h-10 w-10 text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground">
                    لا توجد بيانات لهذا الموظف في الشهر المحدد.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {summary && (
        <>
          <AddSimpleSalaryDeductionModal
            open={addDeductionOpen}
            onOpenChange={setAddDeductionOpen}
            employeeId={summary.employee.id}
            employeeName={summary.employee.name}
            period={summary.period}
            onSuccess={() => refetchSummary()}
          />
          <PaySimpleSalaryModal
            open={payModalOpen}
            onOpenChange={setPayModalOpen}
            summary={summary}
            onSuccess={() => refetchSummary()}
          />
        </>
      )}
    </>
  );
}

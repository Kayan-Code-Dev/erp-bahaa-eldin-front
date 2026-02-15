import { useQuery } from "@tanstack/react-query";
import { TEmployeeDeduction } from "@/api/v2/employees/employee-deductions/employee-deductions.types";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/formatDate";
import { useGetEmployeeDeductionQueryOptions } from "@/api/v2/employees/employee-deductions/employee-deductions.hooks";

type Props = {
  deduction: TEmployeeDeduction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ShowEmployeeDeductionModal({
  deduction,
  open,
  onOpenChange,
}: Props) {
  const { data, isPending } = useQuery({
    ...useGetEmployeeDeductionQueryOptions(deduction?.id || 0),
    enabled: open && !!deduction?.id,
  });

  const deductionData = data || deduction;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center">تفاصيل الخصم</DialogTitle>
          <DialogDescription className="text-center">
            عرض جميع المعلومات المتعلقة بالخصم
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : deductionData ? (
            <>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الموظف</p>
                  <p className="text-base font-medium">{deductionData.employee.user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">نوع الخصم</p>
                  <p className="text-base">{deductionData.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">السبب</p>
                  <p className="text-base">{deductionData.reason || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">المبلغ</p>
                  <p className="text-base">{deductionData.amount.toLocaleString()} ج.م</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">التاريخ</p>
                  <p className="text-base">{formatDate(deductionData.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الفترة</p>
                  <p className="text-base">{deductionData.period || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الحالة</p>
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={deductionData.is_applied ? "default" : "secondary"}
                    >
                      {deductionData.is_applied ? "مطبق" : "غير مطبق"}
                    </Badge>
                    {deductionData.approved_by && (
                      <Badge variant="outline" className="text-xs">
                        موافق عليه
                      </Badge>
                    )}
                  </div>
                </div>
                {deductionData.payroll_id && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">رقم كشف الراتب</p>
                    <p className="text-base">{deductionData.payroll_id}</p>
                  </div>
                )}
                {deductionData.description && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">الوصف</p>
                    <p className="text-base">{deductionData.description}</p>
                  </div>
                )}
                {deductionData.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">ملاحظات</p>
                    <p className="text-base">{deductionData.notes}</p>
                  </div>
                )}
              </div>

              {/* Approval Information */}
              {deductionData.approved_by && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">معلومات الموافقة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">تمت الموافقة بواسطة</p>
                      <p className="text-base">{deductionData.approved_by.name}</p>
                      <p className="text-sm text-muted-foreground">{deductionData.approved_by.email}</p>
                    </div>
                    {deductionData.approved_at && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">تاريخ الموافقة</p>
                        <p className="text-base">{formatDate(deductionData.approved_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Creation Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">معلومات الإنشاء</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">تم الإنشاء بواسطة</p>
                    <p className="text-base">{deductionData.created_by.name}</p>
                    <p className="text-sm text-muted-foreground">{deductionData.created_by.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">تاريخ الإنشاء</p>
                    <p className="text-base">{formatDate(deductionData.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">تاريخ آخر تحديث</p>
                    <p className="text-base">{formatDate(deductionData.updated_at)}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              لا توجد بيانات للخصم
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


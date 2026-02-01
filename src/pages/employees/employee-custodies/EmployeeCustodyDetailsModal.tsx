import { useGetEmployeeCustodyByIdQueryOptions } from "@/api/v2/employees/employee-custodies/employee-custodies.hooks";
import { TEmployeeCustody } from "@/api/v2/employees/employee-custodies/employee-custodies.types";
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
import { useQuery } from "@tanstack/react-query";

type Props = {
  employeeCustody: TEmployeeCustody | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    assigned: "معين",
    returned: "مرجع",
    damaged: "تالف",
    lost: "مفقود",
  };
  return labels[status] || status;
};

const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    assigned: "default",
    returned: "secondary",
    damaged: "destructive",
    lost: "destructive",
  };
  return variants[status] || "default";
};

const getConditionLabel = (condition: string) => {
  const labels: Record<string, string> = {
    new: "جديد",
    good: "جيد",
    fair: "مقبول",
    poor: "ضعيف",
  };
  return labels[condition] || condition;
};

export function EmployeeCustodyDetailsModal({
  employeeCustody,
  open,
  onOpenChange,
}: Props) {
  const { data, isPending } = useQuery({
    ...useGetEmployeeCustodyByIdQueryOptions(employeeCustody?.id || 0),
    enabled: open && !!employeeCustody?.id,
  });

  const custodyData = data || employeeCustody;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-center">تفاصيل الضمان</DialogTitle>
          <DialogDescription className="text-center">
            عرض جميع المعلومات المتعلقة بالضمان
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4" dir="rtl">
          {isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : custodyData ? (
            <>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الموظف</p>
                  <p className="text-base font-medium">
                    {custodyData.employee?.user?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">نوع الضمان</p>
                  <p className="text-base">{custodyData.type || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الاسم</p>
                  <p className="text-base">{custodyData.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الحالة</p>
                  <Badge variant={getStatusVariant(custodyData.status)}>
                    {getStatusLabel(custodyData.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الوصف</p>
                  <p className="text-base">{custodyData.description || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الرقم التسلسلي</p>
                  <p className="text-base">{custodyData.serial_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">علامة الأصل</p>
                  <p className="text-base">{custodyData.asset_tag}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">القيمة</p>
                  <p className="text-base">{custodyData.value.toLocaleString()} ج.م</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    الحالة عند التعيين
                  </p>
                  <p className="text-base">
                    {getConditionLabel(custodyData.condition_on_assignment)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">تاريخ التعيين</p>
                  <p className="text-base">{formatDate(custodyData.assigned_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    تاريخ الإرجاع المتوقع
                  </p>
                  <p className="text-base">{formatDate(custodyData.expected_return_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">معين بواسطة</p>
                  <p className="text-base">{custodyData.assigned_by?.name || "-"}</p>
                </div>
              </div>

              {/* Notes */}
              {custodyData.notes && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">ملاحظات</h3>
                  <p className="text-base">{custodyData.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">معلومات إضافية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">تاريخ الإنشاء</p>
                    <p className="text-base">{formatDate(custodyData.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">آخر تحديث</p>
                    <p className="text-base">{formatDate(custodyData.updated_at)}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              لا توجد بيانات للضمان
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


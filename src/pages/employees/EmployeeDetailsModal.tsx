import { useGetEmployeeQueryOptions } from "@/api/v2/employees/employees.hooks";
import { TEmployee } from "@/api/v2/employees/employees.types";
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
import { formatPhone } from "@/utils/formatPhone";
import { useQuery } from "@tanstack/react-query";

type Props = {
  employee: TEmployee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const getEmploymentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    full_time: "دوام كامل",
    part_time: "دوام جزئي",
    contract: "عقد",
    intern: "متدرّب",
  };
  return labels[type] || type;
};

const getEmploymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: "نشط",
    on_leave: "في إجازة",
    suspended: "معلّق",
    terminated: "منتهي",
  };
  return labels[status] || status;
};

const getEmploymentStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    on_leave: "secondary",
    suspended: "outline",
    terminated: "destructive",
  };
  return variants[status] || "default";
};

export function EmployeeDetailsModal({ employee, open, onOpenChange }: Props) {
  const { data, isPending } = useQuery({
    ...useGetEmployeeQueryOptions(employee?.id || 0),
    enabled: open && !!employee?.id,
  });

  const employeeData = data || employee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center">تفاصيل الموظف</DialogTitle>
          <DialogDescription className="text-center">
            عرض جميع المعلومات المتعلقة بالموظف
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : employeeData ? (
            <>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">الاسم</p>
                  <p className="text-base font-medium">{employeeData.user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</p>
                  <p className="text-base">{employeeData.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">كود الموظف</p>
                  <p className="text-base">{employeeData.employee_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">القسم</p>
                  <p className="text-base">{employeeData.department?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">المسمى الوظيفي</p>
                  <p className="text-base">{employeeData.job_title?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">المدير</p>
                  <p className="text-base">{employeeData.manager?.user?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">نوع التوظيف</p>
                  <p className="text-base">{getEmploymentTypeLabel(employeeData.employment_type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">حالة التوظيف</p>
                  <Badge variant={getEmploymentStatusVariant(employeeData.employment_status)}>
                    {getEmploymentStatusLabel(employeeData.employment_status)}
                  </Badge>
                </div>
                {employeeData.user.roles && employeeData.user.roles.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      الأدوار
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {employeeData.user.roles.map((role) => (
                        <Badge key={role.id} variant="outline">
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">تاريخ التوظيف</p>
                  <p className="text-base">{formatDate(employeeData.hire_date)}</p>
                </div>
                {employeeData.termination_date && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">تاريخ إنهاء الخدمة</p>
                    <p className="text-base">{formatDate(employeeData.termination_date)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">تاريخ انتهاء فترة التجربة</p>
                  <p className="text-base">{formatDate(employeeData.probation_end_date)}</p>
                </div>
              </div>

              {/* Financial Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">المعلومات المالية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">الراتب الأساسي</p>
                    <p className="text-base">{employeeData.base_salary?.toLocaleString() || 0} ج.م</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">بدل النقل</p>
                    <p className="text-base">{employeeData.transport_allowance?.toLocaleString() || 0} ج.م</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">بدل السكن</p>
                    <p className="text-base">{employeeData.housing_allowance?.toLocaleString() || 0} ج.م</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">بدلات أخرى</p>
                    <p className="text-base">{employeeData.other_allowances?.toLocaleString() || 0} ج.م</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">معدل الإضافي</p>
                    <p className="text-base">{employeeData.overtime_rate || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">معدل العمولة</p>
                    <p className="text-base">{employeeData.commission_rate || 0}%</p>
                  </div>
                </div>
              </div>

              {/* Vacation Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">معلومات الإجازات</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">رصيد أيام الإجازة</p>
                    <p className="text-base">{employeeData.vacation_days_balance || 0} يوم</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">أيام الإجازة المستخدمة</p>
                    <p className="text-base">{employeeData.vacation_days_used || 0} يوم</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">إجمالي أيام الإجازة السنوية</p>
                    <p className="text-base">{employeeData.annual_vacation_days || 0} يوم</p>
                  </div>
                </div>
              </div>

              {/* Work Schedule */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">جدول العمل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">وقت بدء العمل</p>
                    <p className="text-base">{employeeData.work_start_time || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">وقت انتهاء العمل</p>
                    <p className="text-base">{employeeData.work_end_time || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ساعات العمل اليومية</p>
                    <p className="text-base">{employeeData.work_hours_per_day || 0} ساعة</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">حد التأخير (بالدقائق)</p>
                    <p className="text-base">{employeeData.late_threshold_minutes || 0} دقيقة</p>
                  </div>
                </div>
              </div>

              {/* Bank Information */}
              {(employeeData.bank_name || employeeData.bank_account_number || employeeData.bank_iban) && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">معلومات البنك</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employeeData.bank_name && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">اسم البنك</p>
                        <p className="text-base">{employeeData.bank_name}</p>
                      </div>
                    )}
                    {employeeData.bank_account_number && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">رقم الحساب</p>
                        <p className="text-base">{employeeData.bank_account_number}</p>
                      </div>
                    )}
                    {employeeData.bank_iban && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">IBAN</p>
                        <p className="text-base">{employeeData.bank_iban}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {(employeeData.emergency_contact_name || employeeData.emergency_contact_phone) && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">جهة الاتصال في حالات الطوارئ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employeeData.emergency_contact_name && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">الاسم</p>
                        <p className="text-base">{employeeData.emergency_contact_name}</p>
                      </div>
                    )}
                    {employeeData.emergency_contact_phone && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">رقم الهاتف</p>
                        <p className="text-base" dir="ltr">{formatPhone(employeeData.emergency_contact_phone, "-")}</p>
                      </div>
                    )}
                    {employeeData.emergency_contact_relation && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">العلاقة</p>
                        <p className="text-base">{employeeData.emergency_contact_relation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Branches */}
              {employeeData.branches && employeeData.branches.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">الفروع</h3>
                  <div className="flex flex-wrap gap-2">
                    {employeeData.branches.map((branch) => (
                      <Badge key={branch.id} variant="outline">
                        {branch.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              لا توجد بيانات للموظف
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


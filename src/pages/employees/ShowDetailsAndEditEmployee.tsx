import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  useGetEmployeeQueryOptions,
  useGetEmployeeAssignmentsQueryOptions,
} from "@/api/v2/employees/employees.hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/formatDate";
import { Edit, UserX } from "lucide-react";
import { useState } from "react";
import EditEmployee from "./EditEmployee";
import { TerminateEmployeeModal } from "./TerminateEmployeeModal";

const getEmploymentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    full_time: "دوام كامل",
    part_time: "دوام جزئي",
    contract: "عقد",
    intern: "متدرب",
  };
  return labels[type] || type;
};

const getEmploymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: "نشط",
    on_leave: "في إجازة",
    suspended: "معلق",
    terminated: "منتهي",
  };
  return labels[status] || status;
};

const getEmploymentStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    active: "default",
    on_leave: "secondary",
    suspended: "outline",
    terminated: "destructive",
  };
  return variants[status] || "default";
};

function ShowDetailsAndEditEmployee() {
  const { id } = useParams<{ id: string }>();
  const employeeId = id ? Number(id) : 0;
  const [isEditMode, setIsEditMode] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);

  const { data: employee, isPending, refetch } = useQuery({
    ...useGetEmployeeQueryOptions(employeeId),
    enabled: employeeId > 0 && !isEditMode,
  });

  const { data: assignments, isPending: isAssignmentsPending } = useQuery({
    ...useGetEmployeeAssignmentsQueryOptions(employeeId),
    enabled: employeeId > 0 && !isEditMode,
  });

  if (isEditMode && employee) {
    return (
      <EditEmployee
        employee={employee}
        onCancel={() => setIsEditMode(false)}
        onSuccess={() => {
          setIsEditMode(false);
          refetch();
        }}
      />
    );
  }

  return (
    <div className="container mx-auto py-6" dir="rtl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تفاصيل الموظف</h1>
          <p className="text-muted-foreground">
            عرض جميع المعلومات المتعلقة بالموظف
          </p>
        </div>
        {employee && (
          <div className="flex gap-2">
            {employee.employment_status !== "terminated" && (
              <Button
                variant="destructive"
                onClick={() => setIsTerminateModalOpen(true)}
              >
                <UserX className="ml-2 h-4 w-4" />
                إنهاء خدمة الموظف
              </Button>
            )}
            <Button onClick={() => setIsEditMode(true)}>
              <Edit className="ml-2 h-4 w-4" />
              تعديل الموظف
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : employee ? (
          <>
            {/* Basic Information */}
            <div className="space-y-4 border rounded-lg p-6">
              <h2 className="text-lg font-semibold">المعلومات الأساسية</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    الاسم
                  </p>
                  <p className="text-base font-medium">{employee.user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    البريد الإلكتروني
                  </p>
                  <p className="text-base">{employee.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    كود الموظف
                  </p>
                  <p className="text-base">{employee.employee_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    القسم
                  </p>
                  <p className="text-base">
                    {employee.department?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    المسمى الوظيفي
                  </p>
                  <p className="text-base">
                    {employee.job_title?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    المدير
                  </p>
                  <p className="text-base">
                    {employee.manager?.user?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    نوع التوظيف
                  </p>
                  <p className="text-base">
                    {getEmploymentTypeLabel(employee.employment_type)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    حالة التوظيف
                  </p>
                  <Badge
                    variant={getEmploymentStatusVariant(
                      employee.employment_status
                    )}
                  >
                    {getEmploymentStatusLabel(employee.employment_status)}
                  </Badge>
                </div>
                {employee.user.roles && employee.user.roles.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      الأدوار
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {employee.user.roles.map((role) => (
                        <Badge key={role.id} variant="outline">
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    تاريخ التوظيف
                  </p>
                  <p className="text-base">{formatDate(employee.hire_date)}</p>
                </div>
                {employee.termination_date && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      تاريخ إنهاء الخدمة
                    </p>
                    <p className="text-base">
                      {formatDate(employee.termination_date)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    تاريخ انتهاء فترة التجربة
                  </p>
                  <p className="text-base">
                    {formatDate(employee.probation_end_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4 border rounded-lg p-6">
              <h2 className="text-lg font-semibold">المعلومات المالية</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    الراتب الأساسي
                  </p>
                  <p className="text-base">
                    {employee.base_salary?.toLocaleString() || 0} ج.م
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    بدل النقل
                  </p>
                  <p className="text-base">
                    {employee.transport_allowance?.toLocaleString() || 0} ج.م
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    بدل السكن
                  </p>
                  <p className="text-base">
                    {employee.housing_allowance?.toLocaleString() || 0} ج.م
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    بدلات أخرى
                  </p>
                  <p className="text-base">
                    {employee.other_allowances?.toLocaleString() || 0} ج.م
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    معدل الإضافي
                  </p>
                  <p className="text-base">{employee.overtime_rate || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    معدل العمولة
                  </p>
                  <p className="text-base">{employee.commission_rate || 0}%</p>
                </div>
              </div>
            </div>

            {/* Vacation Information */}
            <div className="space-y-4 border rounded-lg p-6">
              <h2 className="text-lg font-semibold">معلومات الإجازات</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    رصيد أيام الإجازة
                  </p>
                  <p className="text-base">
                    {employee.vacation_days_balance || 0} يوم
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    أيام الإجازة المستخدمة
                  </p>
                  <p className="text-base">
                    {employee.vacation_days_used || 0} يوم
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    إجمالي أيام الإجازة السنوية
                  </p>
                  <p className="text-base">
                    {employee.annual_vacation_days || 0} يوم
                  </p>
                </div>
              </div>
            </div>

            {/* Work Schedule */}
            <div className="space-y-4 border rounded-lg p-6">
              <h2 className="text-lg font-semibold">جدول العمل</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    وقت بدء العمل
                  </p>
                  <p className="text-base">{employee.work_start_time || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    وقت انتهاء العمل
                  </p>
                  <p className="text-base">{employee.work_end_time || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    ساعات العمل اليومية
                  </p>
                  <p className="text-base">
                    {employee.work_hours_per_day || 0} ساعة
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    حد التأخير (بالدقائق)
                  </p>
                  <p className="text-base">
                    {employee.late_threshold_minutes || 0} دقيقة
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Information */}
            {(employee.bank_name ||
              employee.bank_account_number ||
              employee.bank_iban) && (
              <div className="space-y-4 border rounded-lg p-6">
                <h2 className="text-lg font-semibold">معلومات البنك</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.bank_name && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        اسم البنك
                      </p>
                      <p className="text-base">{employee.bank_name}</p>
                    </div>
                  )}
                  {employee.bank_account_number && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        رقم الحساب
                      </p>
                      <p className="text-base">
                        {employee.bank_account_number}
                      </p>
                    </div>
                  )}
                  {employee.bank_iban && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        IBAN
                      </p>
                      <p className="text-base">{employee.bank_iban}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {(employee.emergency_contact_name ||
              employee.emergency_contact_phone) && (
              <div className="space-y-4 border rounded-lg p-6">
                <h2 className="text-lg font-semibold">
                  جهة الاتصال في حالات الطوارئ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.emergency_contact_name && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        الاسم
                      </p>
                      <p className="text-base">
                        {employee.emergency_contact_name}
                      </p>
                    </div>
                  )}
                  {employee.emergency_contact_phone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        رقم الهاتف
                      </p>
                      <p className="text-base">
                        {employee.emergency_contact_phone}
                      </p>
                    </div>
                  )}
                  {employee.emergency_contact_relation && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        العلاقة
                      </p>
                      <p className="text-base">
                        {employee.emergency_contact_relation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Branches */}
            {employee.branches && employee.branches.length > 0 && (
              <div className="space-y-4 border rounded-lg p-6">
                <h2 className="text-lg font-semibold">الفروع</h2>
                <div className="flex flex-wrap gap-2">
                  {employee.branches.map((branch) => (
                    <Badge key={branch.id} variant="outline">
                      {branch.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Entity Assignments */}
            {isAssignmentsPending ? (
              <div className="space-y-4 border rounded-lg p-6">
                <h2 className="text-lg font-semibold">التعيينات</h2>
                <Skeleton className="h-6 w-full" />
              </div>
            ) : assignments && assignments.length > 0 ? (
              <div className="space-y-4 border rounded-lg p-6">
                <h2 className="text-lg font-semibold">التعيينات</h2>
                <div className="space-y-4">
                  {/* Factories */}
                  {assignments.filter((a) => a.entity_type === "factory")
                    .length > 0 && (
                    <div>
                      <h3 className="text-md font-medium mb-2">المصانع</h3>
                      <div className="flex flex-wrap gap-2">
                        {assignments
                          .filter((a) => a.entity_type === "factory")
                          .map((assignment) => (
                            <Badge
                              key={assignment.id}
                              variant={assignment.is_primary ? "default" : "outline"}
                            >
                              {assignment.entity_name}
                              {assignment.is_primary && (
                                <span className="mr-1">(رئيسي)</span>
                              )}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Workshops */}
                  {assignments.filter((a) => a.entity_type === "workshop")
                    .length > 0 && (
                    <div>
                      <h3 className="text-md font-medium mb-2">الورش</h3>
                      <div className="flex flex-wrap gap-2">
                        {assignments
                          .filter((a) => a.entity_type === "workshop")
                          .map((assignment) => (
                            <Badge
                              key={assignment.id}
                              variant={assignment.is_primary ? "default" : "outline"}
                            >
                              {assignment.entity_name}
                              {assignment.is_primary && (
                                <span className="mr-1">(رئيسي)</span>
                              )}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Branches from assignments */}
                  {assignments.filter((a) => a.entity_type === "branch")
                    .length > 0 && (
                    <div>
                      <h3 className="text-md font-medium mb-2">الفروع</h3>
                      <div className="flex flex-wrap gap-2">
                        {assignments
                          .filter((a) => a.entity_type === "branch")
                          .map((assignment) => (
                            <Badge
                              key={assignment.id}
                              variant={assignment.is_primary ? "default" : "outline"}
                            >
                              {assignment.entity_name}
                              {assignment.is_primary && (
                                <span className="mr-1">(رئيسي)</span>
                              )}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            لا توجد بيانات للموظف
          </div>
        )}
      </div>

      {employee && (
        <TerminateEmployeeModal
          employee={employee}
          open={isTerminateModalOpen}
          onOpenChange={setIsTerminateModalOpen}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
}

export default ShowDetailsAndEditEmployee;

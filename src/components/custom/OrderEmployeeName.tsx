import { TOrder } from "@/api/v2/orders/orders.types";
import { useQuery } from "@tanstack/react-query";
import { useGetEmployeeQueryOptions } from "@/api/v2/employees/employees.hooks";

type Props = {
  order: TOrder;
  className?: string;
};

/**
 * يعرض اسم الموظف الذي أنشأ الطلب.
 * يعتمد أولاً على `order.employee_name` لو موجودة من الـ API،
 * ولو غير موجودة يحاول يجلب بيانات الموظف من `/employees/:id`
 * باستخدام `employee_id` الموجود في رد الطلب.
 */
export function OrderEmployeeName({ order, className }: Props) {
  // بعض الـ APIs ترجع employee_name مباشرة، وبعضها ترجع employee_id فقط
  const rawEmployeeId = (order as any).employee_id as number | null | undefined;
  const employeeId = rawEmployeeId && rawEmployeeId > 0 ? rawEmployeeId : null;

  const hasEmployeeName =
    typeof order.employee_name === "string" &&
    order.employee_name.trim().length > 0;

  // لو في اسم جاهز من الـ API نستخدمه مباشرة بدون طلب إضافي
  const { data: employeeData, isLoading } = useQuery(
    useGetEmployeeQueryOptions(employeeId || 0),
  );

  const fetchedName = employeeData?.user?.name;

  const displayName =
    (hasEmployeeName && order.employee_name) ||
    fetchedName ||
    (employeeId ? `#${employeeId}` : "-");

  if (isLoading && !hasEmployeeName && employeeId) {
    return <span className={className}>جاري التحميل...</span>;
  }

  return <span className={className}>{displayName}</span>;
}


import { TOrder } from "@/api/v2/orders/orders.types";
import { useQuery } from "@tanstack/react-query";
import { useGetEmployeeQueryOptions } from "@/api/v2/employees/employees.hooks";

type Props = {
  order: TOrder;
  className?: string;
};

/**
 * Displays the name of the employee who created the order.
 * First relies on `order.employee_name` if available from the API,
 * otherwise tries to fetch employee data from `/employees/:id`
 * using `employee_id` found in the order response.
 */
export function OrderEmployeeName({ order, className }: Props) {
  // Some APIs return employee_name directly, others return only employee_id
  const rawEmployeeId = (order as any).employee_id as number | null | undefined;
  const employeeId = rawEmployeeId && rawEmployeeId > 0 ? rawEmployeeId : null;

  const hasEmployeeName =
    typeof order.employee_name === "string" &&
    order.employee_name.trim().length > 0;

  // If name is available from API, use it directly without additional request
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

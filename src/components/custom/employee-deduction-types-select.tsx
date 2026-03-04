import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { useGetEmployeeDeductionTypesQueryOptions } from "@/api/v2/employees/employee-deductions/employee-deductions.hooks";
import { Loader2 } from "lucide-react";
import { useHasPermission } from "@/api/auth/auth.hooks";

export interface EmployeeDeductionTypesSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Whether to allow clearing the selection */
  allowClear?: boolean;
}

export function EmployeeDeductionTypesSelect({
  value,
  onChange,
  placeholder = "اختر نوع الخصم...",
  disabled = false,
  className,
  allowClear = true,
}: EmployeeDeductionTypesSelectProps) {
  const { hasPermission, isPending } = useHasPermission("hr.deductions.view");
  const {
    data,
    isLoading,
  } = useQuery({
    ...useGetEmployeeDeductionTypesQueryOptions(),
    enabled: hasPermission,
  });

  // Convert deduction types to ComboboxOption format
  const options: ComboboxOption[] = useMemo(
    () =>
      (data?.types || []).map((type) => ({
        value: type.key,
        label: type.name,
      })),
    [data?.types]
  );

  if (isPending) {
    return (
      <div className="flex h-9 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    );
  }
  if (!hasPermission) {
    return (
      <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
        لا تملك صلاحية عرض أنواع الخصومات
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-9 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="ابحث عن نوع الخصم..."
      emptyText="لا يوجد أنواع خصومات."
      className={className}
      disabled={disabled}
      allowClear={allowClear}
    />
  );
}


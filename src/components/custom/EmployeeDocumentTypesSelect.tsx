import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { useGetEmployeeDocumentTypesQueryOptions } from "@/api/v2/employees/employee-documents/employee-documents.hooks";

export type EmployeeDocumentTypesSelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  popoverClassName?: string;
  disabled?: boolean;
  allowClear?: boolean;
};

export function EmployeeDocumentTypesSelect({
  value,
  onChange,
  placeholder = "اختر نوع الوثيقة...",
  searchPlaceholder = "ابحث عن نوع الوثيقة...",
  emptyText = "لا يوجد أنواع وثائق.",
  className,
  popoverClassName,
  disabled = false,
  allowClear = false,
}: EmployeeDocumentTypesSelectProps) {
  const { data, isLoading, isError } = useQuery(
    useGetEmployeeDocumentTypesQueryOptions()
  );

  // Transform the data to ComboboxOption format
  const options: ComboboxOption[] = useMemo(() => {
    if (!data) return [];
    return data.map((type) => ({
      value: type.key,
      label: type.name,
    }));
  }, [data]);

  // Show loader while loading
  if (isLoading) {
    return (
      <div className="flex h-9 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    );
  }

  // Show error state (optional - you can customize this)
  if (isError) {
    return (
      <div className="flex h-9 w-full items-center justify-center rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
        حدث خطأ أثناء جلب أنواع الوثائق
      </div>
    );
  }

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyText={emptyText}
      className={className}
      popoverClassName={popoverClassName}
      disabled={disabled}
      allowClear={allowClear}
    />
  );
}


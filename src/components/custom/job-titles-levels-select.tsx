import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { useGetJobTitleLevelsQueryOptions } from "@/api/v2/content-managment/job-titles/job-titles.hooks";
import { Loader2 } from "lucide-react";

// Single select props
export interface JobTitlesLevelsSelectPropsSingle {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Exclude specific level keys from the list */
  excludeKeys?: string[];
  /** Whether to allow clearing the selection */
  allowClear?: boolean;
  /** Whether to allow multiple selections */
  multi?: false;
}

// Multi select props
export interface JobTitlesLevelsSelectPropsMulti {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Exclude specific level keys from the list */
  excludeKeys?: string[];
  /** Whether to allow clearing the selection */
  allowClear?: boolean;
  /** Whether to allow multiple selections */
  multi: true;
}

export type JobTitlesLevelsSelectProps =
  | JobTitlesLevelsSelectPropsSingle
  | JobTitlesLevelsSelectPropsMulti;

export function JobTitlesLevelsSelect({
  value,
  onChange,
  placeholder = "اختر المستوى...",
  disabled = false,
  className,
  excludeKeys = [],
  allowClear = true,
  multi = false,
}: JobTitlesLevelsSelectProps) {
  const { data: levelsData, isLoading } = useQuery(
    useGetJobTitleLevelsQueryOptions()
  );

  // Filter excluded keys
  const allLevels = useMemo(() => {
    const levels = levelsData || [];
    return levels.filter((level) => !excludeKeys.includes(level.key));
  }, [levelsData, excludeKeys]);

  // Convert levels to ComboboxOption format
  const options: ComboboxOption[] = useMemo(
    () =>
      allLevels.map((level) => ({
        value: level.key,
        label: level.name,
      })),
    [allLevels]
  );

  if (isLoading) {
    return (
      <div className="flex h-9 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    );
  }

  // Single select mode
  if (!multi) {
    return (
      <Combobox
        options={options}
        value={value as string}
        onChange={onChange as (value: string) => void}
        placeholder={placeholder}
        searchPlaceholder="ابحث عن مستوى..."
        emptyText="لا يوجد مستويات."
        className={className}
        disabled={disabled}
        allowClear={allowClear}
        multi={false}
      />
    );
  }

  // Multi select mode
  return (
    <Combobox
      options={options}
      value={value as string[]}
      onChange={onChange as (value: string[]) => void}
      placeholder={placeholder}
      searchPlaceholder="ابحث عن مستوى..."
      emptyText="لا يوجد مستويات."
      className={className}
      disabled={disabled}
      allowClear={allowClear}
      multi={true}
    />
  );
}


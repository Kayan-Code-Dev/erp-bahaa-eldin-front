import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useGetInfiniteCashboxesQueryOptions } from "@/api/v2/cashboxes/cashboxes.hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";

// Single select props
export interface CashboxesSelectPropsSingle {
  /** Current selected value (single mode) */
  value?: string;
  /** Callback when value changes (single mode) */
  onChange?: (value: string) => void;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Placeholder text when no cashbox is selected */
  placeholder?: string;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Number of cashboxes per page for infinite query */
  perPage?: number;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS classes for the popover */
  popoverClassName?: string;
  /** Whether clicking the selected option clears the selection */
  allowClear?: boolean;
  /** Whether to allow multiple selections */
  multi?: false;
}

// Multi select props
export interface CashboxesSelectPropsMulti {
  /** Current selected values (multi mode) */
  value?: string[];
  /** Callback when value changes (multi mode) */
  onChange?: (value: string[]) => void;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Placeholder text when no cashboxes are selected */
  placeholder?: string;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Number of cashboxes per page for infinite query */
  perPage?: number;
  /** Additional CSS classes */
  className?: string;
  /** Additional CSS classes for the popover */
  popoverClassName?: string;
  /** Whether clicking the selected option clears the selection */
  allowClear?: boolean;
  /** Whether to allow multiple selections */
  multi: true;
}

export type CashboxesSelectProps = CashboxesSelectPropsSingle | CashboxesSelectPropsMulti;

function CashboxesSelectContent({
  value,
  onChange,
  disabled = false,
  placeholder,
  searchPlaceholder = "ابحث عن صندوق...",
  perPage = 10,
  className,
  popoverClassName,
  allowClear = false,
  multi = false,
}: CashboxesSelectProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery(useGetInfiniteCashboxesQueryOptions(perPage));

  // Flatten all cashboxes from all pages into options
  const options: ComboboxOption[] = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) =>
      (page?.data || []).map((cashbox) => ({
        value: cashbox.id.toString(),
        label: cashbox.name,
      }))
    );
  }, [data?.pages]);

  // Show loader on first load
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
    const singleValue = (value as string) || "";
    const defaultPlaceholder = placeholder || "اختر الصندوق...";

    return (
      <div className="space-y-2">
        <Combobox
          multi={false}
          options={options}
          value={singleValue}
          onChange={onChange as (value: string) => void}
          placeholder={defaultPlaceholder}
          searchPlaceholder={searchPlaceholder}
          emptyText="لا توجد صناديق."
          disabled={disabled}
          className={className}
          popoverClassName={popoverClassName}
          allowClear={allowClear}
        />
        
        {/* Load More Button - shown when there are more pages */}
        {hasNextPage && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isFetchingNextPage}
            onClick={(e) => {
              e.preventDefault();
              fetchNextPage();
            }}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التحميل...
              </>
            ) : (
              "تحميل المزيد"
            )}
          </Button>
        )}
        
        {/* Loading indicator for initial fetch */}
        {isFetching && !isFetchingNextPage && (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
    );
  }

  // Multi select mode
  const multiValue = (value as string[]) || [];
  const defaultPlaceholder = placeholder || "اختر الصناديق...";

  return (
    <div className="space-y-2">
      <Combobox
        multi={true}
        options={options}
        value={multiValue}
        onChange={onChange as (value: string[]) => void}
        placeholder={defaultPlaceholder}
        searchPlaceholder={searchPlaceholder}
        emptyText="لا توجد صناديق."
        disabled={disabled}
        className={className}
        popoverClassName={popoverClassName}
        allowClear={allowClear}
      />
      
      {/* Load More Button - shown when there are more pages */}
      {hasNextPage && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={isFetchingNextPage}
          onClick={(e) => {
            e.preventDefault();
            fetchNextPage();
          }}
        >
          {isFetchingNextPage ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري التحميل...
            </>
          ) : (
            "تحميل المزيد"
          )}
        </Button>
      )}
      
      {/* Loading indicator for initial fetch */}
      {isFetching && !isFetchingNextPage && (
        <div className="flex items-center justify-center p-2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  );
}

/**
 * Combobox component for selecting cashboxes (single or multi-select).
 * Uses infinite query to load cashboxes in pages.
 * 
 * @example
 * // Single select - Standalone usage
 * <CashboxesSelect
 *   value={selectedCashboxId}
 *   onChange={setSelectedCashboxId}
 * />
 * 
 * @example
 * // Single select - With react-hook-form
 * <FormField
 *   control={form.control}
 *   name="cashboxId"
 *   render={({ field }) => (
 *     <FormItem>
 *       <FormLabel>الصندوق</FormLabel>
 *       <FormControl>
 *         <CashboxesSelect
 *           value={field.value}
 *           onChange={field.onChange}
 *         />
 *       </FormControl>
 *       <FormMessage />
 *     </FormItem>
 *   )}
 * />
 * 
 * @example
 * // Multi select - Standalone usage
 * <CashboxesSelect
 *   multi={true}
 *   value={selectedCashboxIds}
 *   onChange={setSelectedCashboxIds}
 * />
 * 
 * @example
 * // Multi select - With react-hook-form
 * <FormField
 *   control={form.control}
 *   name="cashboxIds"
 *   render={({ field }) => (
 *     <FormItem>
 *       <FormLabel>الصناديق</FormLabel>
 *       <FormControl>
 *         <CashboxesSelect
 *           multi={true}
 *           value={field.value || []}
 *           onChange={field.onChange}
 *         />
 *       </FormControl>
 *       <FormMessage />
 *     </FormItem>
 *   )}
 * />
 */
export function CashboxesSelect(props: CashboxesSelectProps) {
  return <CashboxesSelectContent {...props} />;
}

// Export with the old name for backward compatibility
export const MultiCashboxesSelect = CashboxesSelect;


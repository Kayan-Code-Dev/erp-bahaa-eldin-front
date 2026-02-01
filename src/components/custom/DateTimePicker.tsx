import * as React from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

export interface DateTimePickerProps {
  /** The selected date range value (controlled) */
  value?: DateRange | undefined;
  /** Callback when date range changes */
  onChange?: (date: DateRange | undefined) => void;
  /** Default date range value (uncontrolled) */
  defaultValue?: DateRange | undefined;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Custom className for the button */
  buttonClassName?: string;
  /** Number of months to display side by side */
  numberOfMonths?: number;
  /** Minimum selectable date */
  fromDate?: Date;
  /** Maximum selectable date */
  toDate?: Date;
  /** Minimum selectable year */
  fromYear?: number;
  /** Maximum selectable year */
  toYear?: number;
  /** ID for the button element */
  id?: string;
  /** Date format string (default: "LLL dd, y") */
  dateFormat?: string;
  /** Whether the popover is open (controlled) */
  open?: boolean;
  /** Callback when popover open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Alignment of the popover */
  align?: "start" | "center" | "end";
}

export function DateTimePicker({
  value,
  onChange,
  defaultValue,
  placeholder = "Pick a date range",
  disabled = false,
  className,
  buttonClassName,
  numberOfMonths = 2,
  fromDate,
  toDate,
  fromYear,
  toYear,
  id = "date-range-picker",
  dateFormat = "LLL dd, y",
  open: controlledOpen,
  onOpenChange,
  align = "start",
}: DateTimePickerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<DateRange | undefined>(
    defaultValue
  );

  // Use controlled open state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [controlledOpen, onOpenChange]
  );

  // Sync internal state with controlled value
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalDate(value);
    }
  }, [value]);

  // Determine if component is controlled
  const isControlled = value !== undefined;

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    if (!isControlled) {
      setInternalDate(selectedDate);
    }
    onChange?.(selectedDate);
  };

  const displayDate = isControlled ? value : internalDate;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !displayDate && "text-muted-foreground",
              buttonClassName
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayDate?.from ? (
              displayDate.to ? (
                <>
                  {format(displayDate.from, dateFormat)} -{" "}
                  {format(displayDate.to, dateFormat)}
                </>
              ) : (
                format(displayDate.from, dateFormat)
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={displayDate?.from}
            selected={displayDate}
            onSelect={handleDateSelect}
            numberOfMonths={numberOfMonths}
            fromDate={fromDate}
            toDate={toDate}
            fromYear={fromYear}
            toYear={toYear}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

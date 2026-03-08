import { useCallback, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import useDebounce from "@/hooks/useDebounce";
import { getSearchConfigForPath } from "@/api/api-index-filters";

export function HeaderSearch() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const config = getSearchConfigForPath(pathname);
  const param = config.param;
  const placeholder = config.placeholder;

  const initialValue = searchParams.get(param) ?? "";
  const [localValue, setLocalValue] = useState(initialValue);
  const debouncedValue = useDebounce({ value: localValue, delay: 400 });

  useEffect(() => {
    setLocalValue(searchParams.get(param) ?? "");
  }, [pathname, param, searchParams]);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const current = prev.get(param) ?? "";
        const nextVal = debouncedValue.trim();
        if (current === nextVal) return prev;
        const next = new URLSearchParams(prev);
        if (nextVal) {
          next.set(param, nextVal);
          next.set("page", "1");
        } else {
          next.delete(param);
        }
        return next;
      },
      { replace: true }
    );
  }, [debouncedValue, param, setSearchParams]);

  const handleClear = useCallback(() => {
    setLocalValue("");
    const next = new URLSearchParams(searchParams);
    next.delete(param);
    setSearchParams(next, { replace: true });
  }, [param, searchParams, setSearchParams]);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl px-4 h-10 transition-all duration-200",
        "bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/60",
        "focus-within:bg-white focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(79,107,247,0.12)]",
        "w-full min-w-[220px] max-w-[420px] shadow-sm"
      )}
    >
      <Search className="w-4 h-4 text-slate-500 group-focus-within:text-primary shrink-0 transition-colors" />
      <input
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-0 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-500 placeholder:font-normal min-w-0"
        dir="rtl"
      />
      {localValue ? (
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          aria-label="مسح البحث"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

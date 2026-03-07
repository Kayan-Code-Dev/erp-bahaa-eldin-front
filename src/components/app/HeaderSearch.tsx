import { useCallback, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import useDebounce from "@/hooks/useDebounce";

/** Route-specific search config: URL param name and placeholder */
const SEARCH_CONFIG: Record<string, { param: string; placeholder: string }> = {
  "/orders/list": { param: "search", placeholder: "ابحث برقم الفاتورة أو الكود أو الاسم..." },
  "/clients": { param: "search", placeholder: "ابحث باسم العميل أو الهاتف..." },
  "/clothes/list": { param: "code", placeholder: "ابحث بكود المنتج..." },
  "/employees/list": { param: "search", placeholder: "ابحث بالاسم أو البريد الإلكتروني..." },
  "/payments": { param: "search", placeholder: "ابحث في المدفوعات..." },
  "/deliveries": { param: "search", placeholder: "ابحث في التسليمات..." },
  "/returns": { param: "search", placeholder: "ابحث في الإرجاعات..." },
  "/overdue-returns": { param: "search", placeholder: "ابحث في الإرجاعات المتأخرة..." },
  "/orders/search-deliveries-returns": { param: "search", placeholder: "ابحث في التسليمات والإرجاعات..." },
  "/suppliers": { param: "search", placeholder: "ابحث باسم المورد..." },
  "/suppliers/orders": { param: "search", placeholder: "ابحث في طلبيات الموردين..." },
  "/expenses": { param: "search", placeholder: "ابحث في المصروفات..." },
  "/cashboxes": { param: "search", placeholder: "ابحث في الصناديق..." },
  "/inventory/branches-managers": { param: "search", placeholder: "ابحث في المخزون..." },
  "/inventory/branches": { param: "search", placeholder: "ابحث في مخزون الفروع..." },
  "/inventory/employees": { param: "search", placeholder: "ابحث في مخزون الموظفين..." },
  "/content/categories": { param: "search", placeholder: "ابحث في الأقسام..." },
  "/content/sub-categories": { param: "search", placeholder: "ابحث في الأقسام الفرعية..." },
  "/content/countries": { param: "search", placeholder: "ابحث في الدول..." },
  "/content/cities": { param: "search", placeholder: "ابحث في المدن..." },
  "/content/currencies": { param: "search", placeholder: "ابحث في العملات..." },
  "/hr/admins/list": { param: "search", placeholder: "ابحث في المسؤولين..." },
  "/hr/branch-managers/all-branches-managers": { param: "search", placeholder: "ابحث في مديري الفروع..." },
  "/hr/branch-managers/branches": { param: "search", placeholder: "ابحث في الفروع..." },
  "/branch": { param: "search", placeholder: "ابحث في الفروع..." },
  "/clothes/transfer-clothes/requests": { param: "search", placeholder: "ابحث في طلبات النقل..." },
  "/factory": { param: "search", placeholder: "ابحث في المصانع..." },
  "/workshop": { param: "search", placeholder: "ابحث في الورش..." },
  "/employees/custodies": { param: "search", placeholder: "ابحث في العهد..." },
};

const DEFAULT_CONFIG = { param: "search", placeholder: "بحث..." };

/** Paths sorted by length descending so longer paths match first (e.g. /orders/search-deliveries-returns before /orders) */
const SEARCH_CONFIG_KEYS_SORTED = (Object.keys(SEARCH_CONFIG) as string[]).sort(
  (a, b) => b.length - a.length
);

function getSearchConfig(pathname: string): { param: string; placeholder: string } {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const exact = SEARCH_CONFIG[normalized];
  if (exact) return exact;
  for (const path of SEARCH_CONFIG_KEYS_SORTED) {
    if (normalized.startsWith(path)) return SEARCH_CONFIG[path];
  }
  return DEFAULT_CONFIG;
}

export function HeaderSearch() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const config = getSearchConfig(pathname);
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

/**
 * API Index Filters – aligned with backend GET list/index endpoints.
 * Used by HeaderSearch and list pages to sync URL params and API query params.
 * Header search uses only the "search" query param on all pages.
 */

export type SearchConfig = {
  param: string;
  placeholder: string;
};

export function getHeaderSearchPlaceholder(pathname: string): string {
  return getSearchConfigForPath(pathname).placeholder;
}

/** Route path (exact or prefix) → search config. Longer paths first for prefix match. */
export const API_INDEX_SEARCH_CONFIG: Record<string, SearchConfig> = {
  "/orders/list": {
    param: "search",
    placeholder:
      "ابحث برقم الطلب، الحالة، الملاحظات، اسم العميل، الرقم الوطني، الموظف، كود المنتج، القسم أو القسم الفرعي...",
  },
  "/orders/search-deliveries-returns": {
    param: "search",
    placeholder:
      "ابحث برقم الطلب، الحالة، اسم العميل، كود المنتج، القسم أو القسم الفرعي...",
  },
  "/payments": {
    param: "search",
    placeholder:
      "ابحث برقم الدفعة، رقم الطلب، المبلغ، الحالة، النوع، الملاحظات، اسم العميل أو المسجل...",
  },
  "/expenses": {
    param: "search",
    placeholder:
      "ابحث برقم المصروف، المبلغ، الفئة، المورد، الرقم المرجعي، الوصف، الملاحظات، الحالة أو اسم المنشئ/المعتمد...",
  },
  "/cashboxes": {
    param: "search",
    placeholder:
      "ابحث برقم الصندوق، الاسم، الوصف، الرصيد، أو اسم/كود الفرع...",
  },
  "/clients": {
    param: "search",
    placeholder:
      "ابحث برقم العميل، الاسم، الرقم الوطني، المصدر، ملاحظات المقاسات، العنوان، المدينة أو الهاتف...",
  },
  "/employees/list": {
    param: "search",
    placeholder:
      "ابحث برقم الموظف، الكود، الاسم، البريد، القسم، المسمى، الفرع، المدير أو الحالة...",
  },
  "/branch": {
    param: "search",
    placeholder:
      "ابحث برقم الفرع، الكود، الاسم، الهاتف، العملة، الضريبة أو العنوان...",
  },
  "/hr/branch-managers/branches": {
    param: "search",
    placeholder:
      "ابحث برقم الفرع، الكود، الاسم، الهاتف أو العنوان...",
  },
  "/workshop": {
    param: "search",
    placeholder:
      "ابحث برقم الورشة، الكود، الاسم، العنوان، المدينة، الدولة أو الفرع...",
  },
  "/factory": {
    param: "search",
    placeholder:
      "ابحث برقم المصنع، الكود، الاسم، جهة الاتصال، الهاتف، البريد، الملاحظات أو الحالة...",
  },
  "/clothes/list": {
    param: "search",
    placeholder: "ابحث في الكود، الملاحظات، مقاس الصدر، الخصر، الكم...",
  },
  "/deliveries": {
    param: "search",
    placeholder: "ابحث في التسليمات (رقم الطلب، العميل، المواعيد)...",
  },
  "/returns": {
    param: "search",
    placeholder: "ابحث في الإرجاعات...",
  },
  "/overdue-returns": {
    param: "search",
    placeholder: "ابحث في الإرجاعات المتأخرة...",
  },
  "/suppliers": {
    param: "search",
    placeholder: "ابحث باسم المورد...",
  },
  "/suppliers/orders": {
    param: "search",
    placeholder: "ابحث في طلبيات الموردين...",
  },
  "/inventory/branches-managers": {
    param: "search",
    placeholder: "ابحث في المخزون...",
  },
  "/inventory/branches": {
    param: "search",
    placeholder: "ابحث في مخزون الفروع...",
  },
  "/inventory/employees": {
    param: "search",
    placeholder: "ابحث في مخزون الموظفين...",
  },
  "/content/categories": {
    param: "search",
    placeholder: "ابحث في الأقسام...",
  },
  "/content/sub-categories": {
    param: "search",
    placeholder: "ابحث في الأقسام الفرعية...",
  },
  "/content/countries": {
    param: "search",
    placeholder: "ابحث في الدول...",
  },
  "/content/cities": {
    param: "search",
    placeholder: "ابحث في المدن...",
  },
  "/content/currencies": {
    param: "search",
    placeholder: "ابحث في العملات...",
  },
  "/hr/admins/list": {
    param: "search",
    placeholder: "ابحث في المسؤولين...",
  },
  "/hr/branch-managers/all-branches-managers": {
    param: "search",
    placeholder: "ابحث في مديري الفروع...",
  },
  "/clothes/transfer-clothes/requests": {
    param: "search",
    placeholder: "ابحث في طلبات النقل...",
  },
  "/employees/custodies": {
    param: "search",
    placeholder: "ابحث في العهد...",
  },
};

const SORTED_PATHS = (Object.keys(API_INDEX_SEARCH_CONFIG) as string[]).sort(
  (a, b) => b.length - a.length
);

export function getSearchConfigForPath(pathname: string): SearchConfig {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const exact = API_INDEX_SEARCH_CONFIG[normalized];
  if (exact) return exact;
  for (const path of SORTED_PATHS) {
    if (normalized.startsWith(path)) return API_INDEX_SEARCH_CONFIG[path];
  }
  return { param: "search", placeholder: "بحث..." };
}

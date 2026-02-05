/** Default items per page for overdue returns list */
export const DEFAULT_PER_PAGE = 15;

/** Debounce delay (ms) for filter form values before syncing to API/URL */
export const FILTER_DEBOUNCE_MS = 500;

/** API filter: only overdue returns — always pass delayed=true */
export const OVERDUE_RETURNS_FILTER = {
  overdue: true as const,
  status: "overdue" as const,
  delayed: true as const,
} as const;

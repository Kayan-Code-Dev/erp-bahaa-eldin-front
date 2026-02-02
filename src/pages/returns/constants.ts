
/** Default items per page for returns list */
export const DEFAULT_PER_PAGE = 15;

/** Debounce delay (ms) for filter form values before syncing to API/URL */
export const FILTER_DEBOUNCE_MS = 500;

/** API filter: delivered orders (تم التسليم) for returns management */
export const RETURNS_FILTER = {
  status: "delivered" as const,
} as const;

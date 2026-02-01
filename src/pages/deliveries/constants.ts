/** Default items per page for deliveries list */
export const DEFAULT_PER_PAGE = 15;

/** Debounce delay (ms) for filter form values before syncing to API/URL */
export const FILTER_DEBOUNCE_MS = 500;

/** API filter: only delivered orders */
export const DELIVERIES_STATUS = "delivered" as const;

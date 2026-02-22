/**
 * Normalizes notification action_url from backend to frontend routes.
 * Backend may send paths like /supplier-orders/4 which don't exist in the frontend.
 */
export function normalizeNotificationActionUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "/";
  try {
    // Use pathname only (strip origin if full URL)
    let path = url;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const u = new URL(url);
      path = u.pathname;
    } else if (url.startsWith("//")) {
      path = new URL(`https:${url}`).pathname;
    }
    path = path.replace(/\/+$/, "") || "/";

    // Map backend paths to frontend routes
    const matchSupplierOrder = path.match(/^\/supplier-orders(?:\/(\d+))?\/?$/);
    if (matchSupplierOrder) {
      return "/suppliers/orders";
    }

    return path || "/";
  } catch {
    return "/";
  }
}

export const includeRoute = (
  pathname: string,
  path: string | undefined,
  level: number,
  hasSubItems?: boolean
): boolean => {
  if (!path) {
    return false;
  }
  
  // Special case for root path
  if (path === "/" && pathname === "/") {
    return true;
  }
  
  // Exact match: return true, unless this item has subItems (parent group).
  // Then we don't highlight the parent when URL exactly matches path, so only
  // the sibling leaf item with the same path gets highlighted (e.g. "الخزنة" not "الخزنة و المحاسبة").
  if (pathname === path) {
    return !hasSubItems;
  }
  
  // Check if pathname starts with the path (parent-child relationship)
  if (pathname.startsWith(path + "/")) {
    // Sub-items (level >= 2) must match exactly: e.g. suppliers list (/suppliers) must not
    // be active when we're on /suppliers/orders — only the exact route should be bold.
    if (level >= 2) {
      return false;
    }
    // Parent/section (level 1): active when on any child route
    const pathnameArr = pathname.split("/");
    const pathArr = path.split("/");
    for (let i = 0; i <= level && i < pathArr.length && i < pathnameArr.length; i++) {
      if (pathArr[i] !== pathnameArr[i]) {
        return false;
      }
    }
    return true;
  }
  
  // If pathname doesn't start with path, they are not related
  // This prevents sibling paths from matching each other
  return false;
};

// Check if any child or descendant is active
export const hasActiveChild = (
  pathname: string,
  item: { path: string; level: number; subItems?: Array<{ path: string; level: number; subItems?: any[] }> }
): boolean => {
  if (!item.subItems || item.subItems.length === 0) {
    return false;
  }
  
  return item.subItems.some((subItem) => {
    // Check if this child itself is active
    if (includeRoute(pathname, subItem.path, subItem.level)) {
      return true;
    }
    // Recursively check if any descendant is active
    if (subItem.subItems) {
      return hasActiveChild(pathname, subItem);
    }
    return false;
  });
};
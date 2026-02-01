export const includeRoute = (
  pathname: string,
  path: string | undefined,
  level: number
): boolean => {
  if (!path) {
    return false;
  }
  
  // Special case for root path
  if (path === "/" && pathname === "/") {
    return true;
  }
  
  // Exact match - always return true
  if (pathname === path) {
    return true;
  }
  
  // Check if pathname starts with the path (parent-child relationship)
  if (pathname.startsWith(path + "/")) {
    // Sub-items (level >= 2) must match exactly: e.g. "عرض الموردين" (/suppliers) must not
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
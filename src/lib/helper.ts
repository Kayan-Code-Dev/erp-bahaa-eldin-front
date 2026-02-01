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
  // e.g., pathname "/clothes/transfer-clothes/requests" starts with path "/clothes/transfer-clothes"
  // We need to ensure we don't match siblings - e.g., "/clothes/transfer-clothes/requests" 
  // should NOT match "/clothes/transfer-clothes/actions"
  if (pathname.startsWith(path + "/")) {
    // Verify that segments match up to the specified level
    const pathnameArr = pathname.split("/");
    const pathArr = path.split("/");
    
    // Check all segments up to and including the level match
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
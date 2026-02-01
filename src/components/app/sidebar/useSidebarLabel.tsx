import { useMemo } from "react";
import { SidebarLabel } from "./constants";

/**
 * Recursively filters the sidebar labels based on user permissions.
 *
 * An item is kept if:
 * 1. It has no `permission` (is public).
 * 2. The user's permissions include the item's `permission`.
 * 3. Any of its descendants are visible.
 *
 * @param labels - The array of sidebar items to filter.
 * @param userPermissions - A Set of permission strings the user has.
 * @returns A new, filtered array of sidebar items.
 */
function filterRecursive(
  labels: SidebarLabel[],
  userPermissions: Set<string>
): SidebarLabel[] {
  // Use .reduce() to build the new array
  return labels.reduce((filteredList, item) => {
    // 1. First, recursively filter the children.
    let filteredSubItems: SidebarLabel[] | undefined = undefined;
    if (item.subItems && item.subItems.length > 0) {
      filteredSubItems = filterRecursive(item.subItems, userPermissions);
    }

    // 2. Now, decide if we should keep this parent item.
    const hasVisibleChildren = filteredSubItems && filteredSubItems.length > 0;
    const hasDirectPermission = item.permission
      ? userPermissions.has(item.permission)
      : false;
    const isPublic = !item.permission;

    // Keep the item if it's public, the user has direct permission,
    // or it has children that are visible.
    if (isPublic || hasDirectPermission || hasVisibleChildren) {
      // Create a new item (to avoid mutation)
      // and assign the *filtered* children
      filteredList.push({
        ...item,
        subItems: filteredSubItems,
      });
    }

    return filteredList;
  }, [] as SidebarLabel[]);
}

/**
 * Main wrapper function to filter the sidebar.
 * It converts the user's permission array to a Set for efficient lookups.
 *
 * @param allSidebarLabels - The complete list of all sidebar labels.
 * @param userPermissions - An array of permission strings the user has.
 * @returns The filtered list of sidebar labels.
 */
export function filterSidebarByPermissions(
  allSidebarLabels: SidebarLabel[],
  userPermissions: string[]
): SidebarLabel[] {
  // Convert array to Set for O(1) average-case lookups
  const permissionsSet = new Set(userPermissions);
  return filterRecursive(allSidebarLabels, permissionsSet);
}

function useSidebarLabel(labels: SidebarLabel[], myPermissions: string[]) {
  const ret = useMemo(() => {
    return filterSidebarByPermissions(labels, myPermissions);
  }, [labels, myPermissions]);
  return ret;
}

export default useSidebarLabel;

import { useQuery } from "@tanstack/react-query";
import { getPermissionsList } from "./permissions.service";

export const PERMISSIONS_KEY = "permissions";

export const usePermissionsList = (current_page = 1) => {
  return useQuery({
    queryKey: [PERMISSIONS_KEY, current_page],
    queryFn: () => getPermissionsList({ current_page }),
    staleTime: 1000 * 60 * 5,
  });
};

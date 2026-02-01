import {
  getBranchesManagersRoles,
  showBranchesManagersRole,
  toggleBranchesManagersRolePermission,
} from "./branches-managers.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const BRANCHES_MANAGERS_ROLES_KEY = "BRANCHES_MANAGERS_ROLES";
export const useBranchesManagersRolesList = () => {
  return useQuery({
    queryKey: [BRANCHES_MANAGERS_ROLES_KEY],
    queryFn: () => getBranchesManagersRoles(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useBranchesManagersShowRole = (id: number) => {
  return useQuery({
    queryKey: [BRANCHES_MANAGERS_ROLES_KEY, id],
    queryFn: () => showBranchesManagersRole(id),
    enabled: !!id,
  });
};

export const useToggleBranchesManagersRolePermission = () => {
  const qClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      toggleBranchesManagersRolePermission(data.role_id, data.permission_id),
    onMutate: async (data) => {
      qClient.cancelQueries({
        queryKey: [BRANCHES_MANAGERS_ROLES_KEY, data.role_id],
      });
      const previousRoles = qClient.getQueryData([
        BRANCHES_MANAGERS_ROLES_KEY,
        data.role_id,
      ]);
      qClient.setQueryData(
        [BRANCHES_MANAGERS_ROLES_KEY, data.role_id],
        (oldData: any) => {
          return {
            ...oldData,
            permissions: oldData.permissions.map((item: any) => {
              if (item.id === data.permission_id) {
                return {
                  ...item,
                  granted: !item.granted,
                };
              }
              return item;
            }),
          };
        }
      );
      return { previousRoles };
    },
    onSettled: () => {
      qClient.invalidateQueries({
        queryKey: [BRANCHES_MANAGERS_ROLES_KEY],
      });
    },
  });
};

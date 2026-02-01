import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRole,
  deleteRole,
  editRole,
  getRolesList,
  showRole,
  toggleRolePermission,
} from "./roles.service";
import { TLoginGuard } from "@/api/auth/auth.types";

export const ROLES_KEY = "ROLES";
export const useRolesList = () => {
  return useQuery({
    queryKey: [ROLES_KEY],
    queryFn: getRolesList,
    staleTime: 1000 * 60 * 5,
  });
};

export const useDeleteRole = () => {
  const qClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSettled: () => {
      qClient.invalidateQueries({
        queryKey: [ROLES_KEY],
      });
    },
  });
};

type TEditRoleMutation = {
  id: number;
  guard_name: TLoginGuard;
  name: string;
};

export const useEditRole = () => {
  const qClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TEditRoleMutation) => editRole(data.id, { ...data }),
    onSettled: () => {
      qClient.invalidateQueries({
        queryKey: [ROLES_KEY],
      });
    },
  });
};

export const useShowRole = (id: number) => {
  return useQuery({
    queryKey: [ROLES_KEY, id],
    queryFn: () => showRole(id),
    enabled: !!id,
  });
};

export const useToggleRolePermission = () => {
  const qClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      toggleRolePermission(data.role_id, data.permission_id),
    onMutate: async (data) => {
      await qClient.cancelQueries({
        queryKey: [ROLES_KEY, data.role_id],
      });
      const previousData = qClient.getQueryData([ROLES_KEY, data.role_id]);
      qClient.setQueryData([ROLES_KEY, data.role_id], (oldData: any) => {
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
      });
      return { previousData };
    },

    onSettled: () => {
      qClient.invalidateQueries({
        queryKey: [ROLES_KEY],
      });
    },
  });
};

export const useCreateRole = () => {
  const qClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { guard_name: TLoginGuard; name: string }) =>
      createRole(data.guard_name, data.name),
    onSettled: () => {
      qClient.invalidateQueries({
        queryKey: [ROLES_KEY],
      });
    },
  });
};

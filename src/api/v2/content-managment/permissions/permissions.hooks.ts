import {
  mutationOptions,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getPermissionsByRoleId,
  getPermissionsList,
  togglePermissionForRole,
} from "./permissions.service";
import { TPermission } from "./permissions.types";
import { toast } from "sonner";

export const PERMISSIONS_KEY = "permissions";

export const usePermissionsListQueryOptions = () => {
  return queryOptions({
    queryKey: [PERMISSIONS_KEY],
    queryFn: getPermissionsList,
    staleTime: 1000 * 60 * 5,
  });
};

export const usePermissionsByRoleIdQueryOptions = (roleId: number) => {
  return queryOptions({
    queryKey: [PERMISSIONS_KEY, roleId],
    queryFn: () => getPermissionsByRoleId(roleId),
    staleTime: 1000 * 60 * 5,
  });
};

export const useTogglePermissionForRoleMutationOptions = () => {
  const qClient = useQueryClient();
  return mutationOptions({
    mutationFn: (data: { roleId: number; permission: string }) =>
      togglePermissionForRole(data.roleId, data.permission),
    onMutate: async ({ roleId, permission }) => {
      // Cancel any outgoing refetches
      await qClient.cancelQueries({ queryKey: [PERMISSIONS_KEY, roleId] });
      await qClient.cancelQueries({ queryKey: [PERMISSIONS_KEY] });

      // Snapshot the previous value
      const previousRolePermissions = qClient.getQueryData<TPermission[]>([
        PERMISSIONS_KEY,
        roleId,
      ]);
      const allPermissions = qClient.getQueryData<TPermission[]>([
        PERMISSIONS_KEY,
      ]);

      // Optimistically update the role permissions
      if (previousRolePermissions) {
        const permissionExists = previousRolePermissions.some(
          (perm) => perm.name === permission
        );

        if (permissionExists) {
          // Remove the permission (toggle off)
          const updatedPermissions = previousRolePermissions.filter(
            (perm) => perm.name !== permission
          );
          qClient.setQueryData<TPermission[]>(
            [PERMISSIONS_KEY, roleId],
            updatedPermissions
          );
        } else {
          // Add the permission (toggle on)
          // Find the permission from all permissions
          const permissionToAdd = allPermissions?.find(
            (perm) => perm.name === permission
          );

          if (permissionToAdd) {
            const updatedPermissions = [
              ...previousRolePermissions,
              permissionToAdd,
            ];
            qClient.setQueryData<TPermission[]>(
              [PERMISSIONS_KEY, roleId],
              updatedPermissions
            );
          }
        }
      }

      // Return a context object with the snapshotted value
      return { previousRolePermissions };
    },
    onError: (_err, { roleId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousRolePermissions) {
        qClient.setQueryData<TPermission[]>(
          [PERMISSIONS_KEY, roleId],
          context.previousRolePermissions
        );
      }
      toast.error("خطأ في تعديل الصلاحية");
    },
    onSettled: (_, __, { roleId }) => {
      // Always refetch after error or success to ensure we have the latest data
      qClient.invalidateQueries({ queryKey: [PERMISSIONS_KEY, roleId] });
    },
  });
};

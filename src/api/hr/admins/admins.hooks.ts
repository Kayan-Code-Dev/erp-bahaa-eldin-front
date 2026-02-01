import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  blockAdmin,
  createAdmin,
  deleteAdmin,
  forceDeleteAdmin,
  getAdminRoles,
  getAdmins,
  getDeletedAdmins,
  restoreAdmin,
  updateAdmin,
} from "./admins.service";
import { TAdmin } from "./admins.types";
import { TPaginationResponse } from "@/api/api-common.types";

export const ADMINS_KEY = "admins";
export const DELETED_ADMINS_KEY = "deleted-admins";

export const useGetAdmins = (page: number) => {
  return useQuery<TPaginationResponse<TAdmin> | undefined, Error>({
    queryKey: [ADMINS_KEY, page],
    queryFn: () => getAdmins(page),
  });
};

export const useGetDeletedAdmins = (page: number) => {
  return useQuery<TPaginationResponse<TAdmin> | undefined, Error>({
    queryKey: [DELETED_ADMINS_KEY, page],
    queryFn: () => getDeletedAdmins(page),
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMINS_KEY] });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      updateAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMINS_KEY] });
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMINS_KEY] });
      queryClient.invalidateQueries({ queryKey: [DELETED_ADMINS_KEY] });
    },
  });
};

export const useForceDeleteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: forceDeleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMINS_KEY] });
      queryClient.invalidateQueries({ queryKey: [DELETED_ADMINS_KEY] });
    },
  });
};

export const useRestoreAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMINS_KEY] });
      queryClient.invalidateQueries({ queryKey: [DELETED_ADMINS_KEY] });
    },
  });
};

export const useGetAdminRoles = () => {
  return useQuery({
    queryKey: ["admin-roles"],
    queryFn: getAdminRoles,
    staleTime: 24 * 60 * 60 * 1000,
  });
};

export const useBlockAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blockAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMINS_KEY] });
    },
  });
};
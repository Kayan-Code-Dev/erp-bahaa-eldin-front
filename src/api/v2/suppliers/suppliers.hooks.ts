import {
  mutationOptions,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
  createSupplierOrder,
  getSuppliersList,
} from "./suppliers.service";
import { TUpdateSupplierRequest } from "./suppliers.types";

export const SUPPLIERS_KEY = "suppliers";

export const useCreateSupplierMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
    },
  });
};

export const useUpdateSupplierMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: (payload: { id: number; data: TUpdateSupplierRequest }) =>
      updateSupplier(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
    },
  });
};

export const useGetSuppliersQueryOptions = (page: number, per_page: number) => {
  return queryOptions({
    queryKey: [SUPPLIERS_KEY, page, per_page],
    queryFn: () => getSuppliers(page, per_page),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetSupplierQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: [SUPPLIERS_KEY, id],
    queryFn: () => getSupplier(id),
    staleTime: 1000 * 60 * 5,
  });
};

export const useDeleteSupplierMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
    },
  });
};

export const useCreateSupplierOrderMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: createSupplierOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
    },
  });
};

export const useGetSuppliersListQueryOptions = () => {
  return queryOptions({
    queryKey: [SUPPLIERS_KEY, "list"],
    queryFn: () => getSuppliersList(),
    staleTime: 1000 * 60 * 5,
  });
};






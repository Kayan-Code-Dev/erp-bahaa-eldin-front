import {
  mutationOptions,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createSupplier,
  createSupplierMinimal,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
  createSupplierOrder,
  updateSupplierOrder,
  getSuppliersList,
  getSupplierOrders,
  getSupplierOrdersBySupplierId,
  getSupplierOrder,
  addPaymentToSupplierOrder,
  returnSupplierOrder,
  exportSuppliersToExcel,
  exportSupplierOrdersToExcel,
} from "./suppliers.service";
import { TUpdateSupplierRequest, TUpdateSupplierOrderRequest } from "./suppliers.types";

export const SUPPLIERS_KEY = "suppliers";
export const SUPPLIER_ORDERS_KEY = "supplier-orders";

const FIVE_MINUTES = 1000 * 60 * 5;
const TWO_MINUTES = 1000 * 60 * 2;

// ---------------------------------------------------------------------------
// Supplier queries
// ---------------------------------------------------------------------------

export const useGetSuppliersQueryOptions = (
  page: number,
  per_page: number,
  search?: string
) =>
  queryOptions({
    queryKey: [SUPPLIERS_KEY, page, per_page, search],
    queryFn: () => getSuppliers(page, per_page, search),
    staleTime: FIVE_MINUTES,
  });

export const useGetSupplierQueryOptions = (id: number) =>
  queryOptions({
    queryKey: [SUPPLIERS_KEY, id],
    queryFn: () => getSupplier(id),
    staleTime: FIVE_MINUTES,
  });

export const useGetSuppliersListQueryOptions = () =>
  queryOptions({
    queryKey: [SUPPLIERS_KEY, "list"],
    queryFn: getSuppliersList,
    staleTime: FIVE_MINUTES, 
  });

// ---------------------------------------------------------------------------
// Supplier mutations
// ---------------------------------------------------------------------------

export const useCreateSupplierMinimalMutationOptions = () => {
  const qc = useQueryClient();
  return mutationOptions({
    mutationFn: createSupplierMinimal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
    },
  });
};

export const useCreateSupplierMutationOptions = () => {
  const qc = useQueryClient();
  return mutationOptions({
    mutationFn: createSupplier,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
    },
  });
};

export const useUpdateSupplierMutationOptions = () => {
  const qc = useQueryClient();
  return mutationOptions({
    mutationFn: (payload: { id: number; data: TUpdateSupplierRequest }) =>
      updateSupplier(payload.id, payload.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
    },
  });
};

export const useDeleteSupplierMutationOptions = () => {
  const qc = useQueryClient();
  return mutationOptions({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
    },
  });
};

export const useExportSuppliersToExcelMutationOptions = () =>
  mutationOptions({
    mutationFn: (params?: Parameters<typeof exportSuppliersToExcel>[0]) =>
      exportSuppliersToExcel(params),
  });

export const useExportSupplierOrdersToExcelMutationOptions = () =>
  mutationOptions({
    mutationFn: (params?: Parameters<typeof exportSupplierOrdersToExcel>[0]) =>
      exportSupplierOrdersToExcel(params),
  });

// ---------------------------------------------------------------------------
// Supplier Order queries
// ---------------------------------------------------------------------------

export const useGetSupplierOrdersQueryOptions = (
  page: number,
  per_page: number,
) =>
  queryOptions({
    queryKey: [SUPPLIER_ORDERS_KEY, page, per_page],
    queryFn: () => getSupplierOrders(page, per_page),
    staleTime: FIVE_MINUTES,
  });

export const useGetSupplierOrdersBySupplierIdQueryOptions = (
  supplierId: number,
  page: number,
  per_page: number,
) =>
  queryOptions({
    queryKey: [SUPPLIER_ORDERS_KEY, "by-supplier", supplierId, page, per_page],
    queryFn: () => getSupplierOrdersBySupplierId(supplierId, page, per_page),
    enabled: supplierId > 0,
    staleTime: FIVE_MINUTES,
  });

export const useGetSupplierOrderQueryOptions = (
  supplierId: number,
  orderId: number,
  options?: { enabled?: boolean },
) =>
  queryOptions({
    queryKey: [SUPPLIER_ORDERS_KEY, "detail", supplierId, orderId],
    queryFn: () => getSupplierOrder(supplierId, orderId),
    enabled: (options?.enabled ?? true) && supplierId > 0 && orderId > 0,
    staleTime: TWO_MINUTES,
  });

// ---------------------------------------------------------------------------
// Supplier Order mutations
// ---------------------------------------------------------------------------

export const useCreateSupplierOrderMutationOptions = () => {
  const qc = useQueryClient();
  return mutationOptions({
    mutationFn: createSupplierOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
      qc.invalidateQueries({ queryKey: [SUPPLIER_ORDERS_KEY] });
    },
  });
};

export const useUpdateSupplierOrderMutationOptions = () => {
  const qc = useQueryClient();
  return mutationOptions({
    mutationFn: (payload: { id: number; data: TUpdateSupplierOrderRequest }) =>
      updateSupplierOrder(payload.id, payload.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUPPLIER_ORDERS_KEY] });
    },
  });
};

export const useAddPaymentToSupplierOrderMutationOptions = () => {
  const qc = useQueryClient();
  return mutationOptions({
    mutationFn: (payload: {
      id: number;
      clothes: { cloth_id: number; amount: number }[];
    }) => addPaymentToSupplierOrder(payload.id, { clothes: payload.clothes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUPPLIER_ORDERS_KEY] });
      qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
    },
  });
};

export const useReturnSupplierOrderMutationOptions = () => {
  const qc = useQueryClient();
  return mutationOptions({
    mutationFn: returnSupplierOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SUPPLIER_ORDERS_KEY] });
      qc.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
    },
  });
};

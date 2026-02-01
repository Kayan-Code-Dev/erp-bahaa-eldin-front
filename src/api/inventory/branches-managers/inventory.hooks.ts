import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveInventoryTransfer,
  createInventoryTransfer,
  getInventoryBranches,
  getInventoryCategoriesByBranch,
  getInventoryItems,
  getInventorySubCategoriesByCategory,
  getInventoryTransfers,
  rejectInventoryTransfer,
} from "./inventory.service";

export const INVENTORY_KEY = "inventory";
export const INVENTORY_TRANSFERS_KEY = "inventory-transfers";
export const INVENTORY_BRANCHES_KEY = "inventory-branches";
export const INVENTORY_CATEGORIES_KEY = "inventory-categories";
export const INVENTORY_SUB_CATEGORIES_KEY = "inventory-sub-categories";

export const useGetInventoryItems = (page: number) => {
  return useQuery({
    queryKey: [INVENTORY_KEY, page],
    queryFn: () => getInventoryItems(page),
  });
};

export const useGetInventoryTransfers = (page: number) => {
  return useQuery({
    queryKey: [INVENTORY_TRANSFERS_KEY, page],
    queryFn: () => getInventoryTransfers(page),
  });
};

export const useGetInventoryBranches = () => {
  return useQuery({
    queryKey: [INVENTORY_BRANCHES_KEY],
    queryFn: getInventoryBranches,
  });
};

export const useGetInventoryCategoriesByBranch = (branchId: number) => {
  return useQuery({
    queryKey: [INVENTORY_CATEGORIES_KEY, branchId],
    queryFn: () => getInventoryCategoriesByBranch(branchId),
    enabled: !!branchId,
  });
};

export const useGetInventorySubCategoriesByCategory = (categoryId: number) => {
  return useQuery({
    queryKey: [INVENTORY_SUB_CATEGORIES_KEY, categoryId],
    queryFn: () => getInventorySubCategoriesByCategory(categoryId),
    enabled: !!categoryId,
  });
};

export const useCreateInventoryTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInventoryTransfer,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [INVENTORY_TRANSFERS_KEY],
      });
    },
  });
};

export const useApproveInventoryTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveInventoryTransfer,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [INVENTORY_TRANSFERS_KEY],
      });
    },
  });
};

export const useRejectInventoryTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectInventoryTransfer,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [INVENTORY_TRANSFERS_KEY],
      });
    },
  });
};

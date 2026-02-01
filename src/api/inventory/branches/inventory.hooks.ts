import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TInventoryItem } from "../inventory.types"; // Adjust path as needed
import { TPaginationResponse } from "@/api/api-common.types";
import {
  approveBranchInventoryTransfer,
  createBranchesInventory,
  createBranchInventoryTransfer,
  deleteBranchesInventory,
  getBranchesInventory,
  getBranchesInventoryCategories,
  getBranchesInventorySubCategoriesByCategory,
  getBranchesInventoryTransferBranches,
  getBranchInventoryTransfers,
  rejectBranchInventoryTransfer,
  TUpdateBranchesInventoryRequest,
  updateBranchesInventory,
} from "./inventory.service";
export const BRANCHES_INVENTORY_KEY = "branches-inventory";
export const BRANCHES_INVENTORY_CATEGORIES_KEY =
  "branches-inventory-categories";
export const BRANCHES_INVENTORY_SUB_CATEGORIES_KEY =
  "branches-inventory-sub-categories";

// Helper type for paginated data
type TPageData = TPaginationResponse<TInventoryItem>;

export const useGetBranchesInventory = (page: number) => {
  return useQuery({
    queryKey: [BRANCHES_INVENTORY_KEY, page],
    queryFn: () => getBranchesInventory(page),
  });
};

export const useGetBranchesInventoryCategories = () => {
  return useQuery({
    queryKey: [BRANCHES_INVENTORY_CATEGORIES_KEY],
    queryFn: getBranchesInventoryCategories,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};

export const useGetBranchesInventorySubCategoriesByCategory = (
  categoryId: number
) => {
  return useQuery({
    queryKey: [BRANCHES_INVENTORY_SUB_CATEGORIES_KEY, categoryId],
    queryFn: () => getBranchesInventorySubCategoriesByCategory(categoryId),
    enabled: !!categoryId, // Only run if categoryId is a truthy value
  });
};

export const useCreateBranchesInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBranchesInventory,
    onSuccess: () => {
      toast.success("تم إنشاء الصنف بنجاح");
      queryClient.invalidateQueries({ queryKey: [BRANCHES_INVENTORY_KEY] });
    },
    onError: () => {
      toast.error("خطأ في إنشاء الصنف");
    },
  });
};

export const useUpdateBranchesInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      id,
    }: {
      data: TUpdateBranchesInventoryRequest;
      id: number;
    }) => updateBranchesInventory(data, id),
    onSuccess: () => {
      toast.success("تم تحديث الصنف بنجاح");
      queryClient.invalidateQueries({ queryKey: [BRANCHES_INVENTORY_KEY] });
    },
    onError: () => {
      toast.error("خطأ في تحديث الصنف");
    },
  });
};

export const useDeleteBranchesInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBranchesInventory,

    onMutate: async (idToDelete: number) => {
      await queryClient.cancelQueries({ queryKey: [BRANCHES_INVENTORY_KEY] });
      const previousDataSnapshot = queryClient.getQueriesData<TPageData>({
        queryKey: [BRANCHES_INVENTORY_KEY],
      });

      queryClient.setQueriesData<TPageData>(
        { queryKey: [BRANCHES_INVENTORY_KEY] },
        (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            total: oldData.total - 1,
            data: oldData.data.filter((item) => item.id !== idToDelete),
          };
        }
      );
      return { previousDataSnapshot };
    },

    onError: (_, __, context) => {
      if (context?.previousDataSnapshot) {
        context.previousDataSnapshot.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("حدث خطأ. تم التراجع عن الحذف");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [BRANCHES_INVENTORY_KEY] });
    },

    onSuccess: () => {
      toast.success("تم حذف الصنف بنجاح");
    },
  });
};

export const BRANCHES_TRANSFER_OPERATIONS_KEY = "branches-transfer-operations";

export const useGetBranchTransferOperations = (page: number) => {
  return useQuery({
    queryKey: [BRANCHES_TRANSFER_OPERATIONS_KEY, page],
    queryFn: () => getBranchInventoryTransfers(page),
  });
};

export const useApproveBranchTransferOperation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveBranchInventoryTransfer,
    onSuccess: () => {
      toast.success("تم الموافقة على الطلب بنجاح");
      queryClient.invalidateQueries({
        queryKey: [BRANCHES_TRANSFER_OPERATIONS_KEY],
      });
    },
    onError: () => {
      toast.error("خطأ في الموافقة على الطلب");
    },
  });
};

export const useRejectBranchTransferOperation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectBranchInventoryTransfer,
    onSuccess: () => {
      toast.success("تم رفض الطلب بنجاح");
      queryClient.invalidateQueries({
        queryKey: [BRANCHES_TRANSFER_OPERATIONS_KEY],
      });
    },
    onError: () => {
      toast.error("خطأ في رفض الطلب");
    },
  });
};

export const useCreateBranchInventoryTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBranchInventoryTransfer,
    onSuccess: () => {
      toast.success("تم إنشاء الحوالة بنجاح");
      queryClient.invalidateQueries({
        queryKey: [BRANCHES_TRANSFER_OPERATIONS_KEY],
      });
    },
    onError: () => {
      toast.error("خطأ في إنشاء الحوالة");
    },
  });
};

export const useGetBranchesInventoryTransferBranches = () => {
  return useQuery({
    queryKey: ["branches-inventory-transfer-branches"],
    queryFn: getBranchesInventoryTransferBranches,
  });
};

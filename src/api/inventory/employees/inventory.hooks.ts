import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TInventoryItem } from "../inventory.types"; // Adjust path as needed
import { TPaginationResponse } from "@/api/api-common.types";
import {
  approveEmployeeInventoryTransfer,
  createEmployeeInventoryTransfer,
  createEmployeesInventory,
  deleteEmployeesInventory,
  getEmployeeInventoryTransfers,
  getEmployeesInventory,
  rejectEmployeeInventoryTransfer,
  TUpdateEmployeesInventoryRequest,
  updateEmployeesInventory,
} from "./inventory.service";
export const EMPLOYEES_INVENTORY_KEY = "employees-inventory";

// Helper type for paginated data
type TPageData = TPaginationResponse<TInventoryItem>;

export const useGetEmployeesInventory = (page: number) => {
  return useQuery({
    queryKey: [EMPLOYEES_INVENTORY_KEY, page],
    queryFn: () => getEmployeesInventory(page),
  });
};


export const useCreateEmployeesInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployeesInventory,
    onSuccess: () => {
      toast.success("تم إنشاء الصنف بنجاح");
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_INVENTORY_KEY] });
    },
    onError: (err) => {
      toast.error("خطأ في إنشاء الصنف",
        {
          description: err.message
        }
      );
    },
  });
};

export const useUpdateEmployeesInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      id,
    }: {
      data: TUpdateEmployeesInventoryRequest;
      id: number;
    }) => updateEmployeesInventory(data, id),
    onSuccess: () => {
      toast.success("تم تحديث الصنف بنجاح");
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_INVENTORY_KEY] });
    },
    onError: (err) => {
      toast.error("خطأ في تحديث الصنف",
        {
          description: err.message
        }
      );
    },
  });
};

export const useDeleteEmployeesInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployeesInventory,

    onMutate: async (idToDelete: number) => {
      await queryClient.cancelQueries({ queryKey: [EMPLOYEES_INVENTORY_KEY] });
      const previousDataSnapshot = queryClient.getQueriesData<TPageData>({
        queryKey: [EMPLOYEES_INVENTORY_KEY],
      });

      queryClient.setQueriesData<TPageData>(
        { queryKey: [EMPLOYEES_INVENTORY_KEY] },
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
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_INVENTORY_KEY] });
    },

    onSuccess: () => {
      toast.success("تم حذف الصنف بنجاح");
    },
  });
};

export const EMPLOYEES_TRANSFER_OPERATIONS_KEY = "employees-transfer-operations";

export const useGetEmployeeTransferOperations = (page: number) => {
  return useQuery({
    queryKey: [EMPLOYEES_TRANSFER_OPERATIONS_KEY, page],
    queryFn: () => getEmployeeInventoryTransfers(page),
  });
};

export const useApproveEmployeeTransferOperation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveEmployeeInventoryTransfer,
    onSuccess: () => {
      toast.success("تم الموافقة على الطلب بنجاح");
      queryClient.invalidateQueries({
        queryKey: [EMPLOYEES_TRANSFER_OPERATIONS_KEY],
      });
    },
    onError: () => {
      toast.error("خطأ في الموافقة على الطلب");
    },
  });
};

export const useRejectEmployeeTransferOperation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectEmployeeInventoryTransfer,
    onSuccess: () => {
      toast.success("تم رفض الطلب بنجاح");
      queryClient.invalidateQueries({
        queryKey: [EMPLOYEES_TRANSFER_OPERATIONS_KEY],
      });
    },
    onError: () => {
      toast.error("خطأ في رفض الطلب");
    },
  });
};

export const useCreateEmployeeInventoryTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployeeInventoryTransfer,
    onSuccess: () => {
      toast.success("تم إنشاء الحوالة بنجاح");
      queryClient.invalidateQueries({
        queryKey: [EMPLOYEES_TRANSFER_OPERATIONS_KEY],
      });
    },
    onError: (error) => {
      toast.error("خطأ في إنشاء الحوالة", {
        description: error.message,
      });
    },
  });
};
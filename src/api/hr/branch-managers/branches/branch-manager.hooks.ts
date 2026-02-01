import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  blockBranchManager,
  createBranchManager,
  deleteBranchManager,
  deleteBranchManagerPermanently,
  getAllDeletedBranchManagers,
  getBranchManagers,
  getBranchesManagersIds,
  restoreBranchManager,
  updateBranchManager,
} from "./branch-manager.service";
import { toast } from "sonner";
import { TBranchManager } from "./branch-manager.types";
import { TPaginationResponse } from "@/api/api-common.types";

export const BRANCH_MANGER_KEY = "branch-managers";
export const DELETED_BRANCH_MANGERS_KEY = "deleted-branch-managers";

// Helper type for our paginated data
type TPageData = TPaginationResponse<TBranchManager>;

export const useGetBranchManagers = (page: number) => {
  return useQuery({
    queryKey: [BRANCH_MANGER_KEY, page],
    queryFn: () => getBranchManagers(page),
  });
};

export const useGetBranchesManagersIds = () => {
  return useQuery({
    queryKey: ["branch-managers-ids"],
    queryFn: getBranchesManagersIds,
  });
};

export const useCreateBranchManager = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBranchManager,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BRANCH_MANGER_KEY] });
      toast.success("تم إنشاء مدير فرع جديد بنجاح");
    },
  });
};

export const useUpdateBranchManager = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      updateBranchManager(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BRANCH_MANGER_KEY] });
      toast.success("تم تحديث مدير الفرع بنجاح");
    },
  });
};

export const useDeleteBranchManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBranchManager,

    onMutate: async (idToDelete: string) => {
      await queryClient.cancelQueries({ queryKey: [BRANCH_MANGER_KEY] });
      const previousDataSnapshot = queryClient.getQueriesData<TPageData>({
        queryKey: [BRANCH_MANGER_KEY],
      });

      queryClient.setQueriesData<TPageData>(
        { queryKey: [BRANCH_MANGER_KEY] },
        (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            total: oldData.total - 1, // Decrement total
            data: oldData.data.filter(
              (manager) => manager.uuid !== idToDelete // Remove manager
            ),
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
      // Refetch both lists to be in sync
      queryClient.invalidateQueries({ queryKey: [BRANCH_MANGER_KEY] });
      queryClient.invalidateQueries({ queryKey: [DELETED_BRANCH_MANGERS_KEY] });
    },

    onSuccess: () => {
      toast.success("تم مسح مدير الفرع بنجاح");
    },
  });
};

export const useGetAllDeletedBranchManagers = (page: number) => {
  return useQuery({
    queryKey: [DELETED_BRANCH_MANGERS_KEY, page],
    queryFn: () => getAllDeletedBranchManagers(page),
  });
};

export const useRestoreBranchManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreBranchManager,

    onMutate: async (idToRestore: string) => {
      await queryClient.cancelQueries({
        queryKey: [DELETED_BRANCH_MANGERS_KEY],
      });
      const previousDataSnapshot = queryClient.getQueriesData<TPageData>({
        queryKey: [DELETED_BRANCH_MANGERS_KEY],
      });

      queryClient.setQueriesData<TPageData>(
        { queryKey: [DELETED_BRANCH_MANGERS_KEY] },
        (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            total: oldData.total - 1,
            data: oldData.data.filter(
              (manager) => manager.uuid !== idToRestore // Remove manager
            ),
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
      toast.error("حدث خطأ. تم التراجع عن الاستعادة");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [BRANCH_MANGER_KEY] });
      queryClient.invalidateQueries({ queryKey: [DELETED_BRANCH_MANGERS_KEY] });
    },

    onSuccess: () => {
      toast.success("تم استعادة مدير الفرع بنجاح");
    },
  });
};

export const useDeleteBranchManagerPermanently = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBranchManagerPermanently,

    onMutate: async (idToDelete: string) => {
      await queryClient.cancelQueries({
        queryKey: [DELETED_BRANCH_MANGERS_KEY],
      });
      const previousDataSnapshot = queryClient.getQueriesData<TPageData>({
        queryKey: [DELETED_BRANCH_MANGERS_KEY],
      });

      queryClient.setQueriesData<TPageData>(
        { queryKey: [DELETED_BRANCH_MANGERS_KEY] },
        (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            total: oldData.total - 1,
            data: oldData.data.filter(
              (manager) => manager.uuid !== idToDelete // Remove manager
            ),
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
      toast.error("حدث خطأ. تم التراجع عن الحذف النهائي");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [DELETED_BRANCH_MANGERS_KEY] });
    },

    onSuccess: () => {
      toast.success("تم مسح مدير الفرع نهائيا");
    },
  });
};

export const useBlockBranchManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blockBranchManager,

    onMutate: async (idToBlock: string) => {
      await queryClient.cancelQueries({ queryKey: [BRANCH_MANGER_KEY] });

      const previousDataSnapshot = queryClient.getQueriesData<TPageData>({
        queryKey: [BRANCH_MANGER_KEY],
      });

      queryClient.setQueriesData<TPageData>(
        { queryKey: [BRANCH_MANGER_KEY] },
        (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            data: oldData.data.map((manager) =>
              manager.uuid === idToBlock
                ? { ...manager, blocked: !manager.blocked } // The optimistic update
                : manager
            ),
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
      toast.error("حدث خطأ. تم التراجع عن تغيير حالة الحظر");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [BRANCH_MANGER_KEY] });
    },

    onSuccess: () => {
      toast.success("تم تغيير حالة حظر المدير بنجاح");
    },
  });
};

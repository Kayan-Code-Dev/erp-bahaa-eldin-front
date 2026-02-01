import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  TCreateDepartmentRequest,
  TUpdateDepartmentRequest,
  updateDepartment,
} from "./departments.service";
import { toast } from "sonner";

import { TPaginationResponse } from "@/api/api-common.types";
import { TDepartment } from "./departments.types";

export const DEPARTMENT_KEY = "departments";

// Helper type
type TPageData = TPaginationResponse<TDepartment>;

export const useDepartments = (page: number) => {
  return useQuery({
    queryKey: [DEPARTMENT_KEY, page],
    queryFn: () => getDepartments(page),
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TCreateDepartmentRequest) => createDepartment(data),
    onSuccess: () => {
      toast.success("تم إنشاء القسم بنجاح");
      queryClient.invalidateQueries({ queryKey: [DEPARTMENT_KEY] });
    },
    onError: () => {
      toast.error("خطأ في إنشاء القسم");
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: TUpdateDepartmentRequest;
    }) => updateDepartment(id, data),
    onSuccess: () => {
      toast.success("تم تحديث القسم بنجاح");
      queryClient.invalidateQueries({ queryKey: [DEPARTMENT_KEY] });
    },
    onError: () => {
      toast.error("خطأ في تحديث القسم");
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDepartment,

    onMutate: async (idToDelete: number) => {
      await queryClient.cancelQueries({ queryKey: [DEPARTMENT_KEY] });
      const previousDataSnapshot = queryClient.getQueriesData<TPageData>({
        queryKey: [DEPARTMENT_KEY],
      });

      queryClient.setQueriesData<TPageData>(
        { queryKey: [DEPARTMENT_KEY] },
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
      queryClient.invalidateQueries({ queryKey: [DEPARTMENT_KEY] });
    },
    onSuccess: () => {
      toast.success("تم حذف القسم بنجاح");
    },
  });
};

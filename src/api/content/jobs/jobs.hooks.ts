import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createJob,
  deleteJob,
  getDepartmentsForJob,
  getJobs,
  TCreateJobRequest,
  TUpdateJobRequest,
  updateJob,
} from "./jobs.service";
import { toast } from "sonner";
import { TPaginationResponse } from "@/api/api-common.types";
import { TJob } from "./jobs.types";

export const JOBS_KEY = "jobs";
export const DEPARTMENTS_FOR_JOBS_KEY = "departmentsForJobs";

// Helper type
type TPageData = TPaginationResponse<TJob>;

export const useGetJobs = (page: number) => {
  return useQuery({
    queryKey: [JOBS_KEY, page],
    queryFn: () => getJobs(page),
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TCreateJobRequest) => createJob(data),
    onSuccess: () => {
      toast.success("تم إنشاء الوظيفة بنجاح");
      queryClient.invalidateQueries({ queryKey: [JOBS_KEY] });
    },
    onError: () => {
      toast.error("خطأ في إنشاء الوظيفة");
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TUpdateJobRequest }) =>
      updateJob(id, data),
    onSuccess: () => {
      toast.success("تم تحديث الوظيفة بنجاح");
      queryClient.invalidateQueries({ queryKey: [JOBS_KEY] });
    },
    onError: () => {
      toast.error("خطأ في تحديث الوظيفة");
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteJob,

    onMutate: async (idToDelete: number) => {
      await queryClient.cancelQueries({ queryKey: [JOBS_KEY] });
      const previousDataSnapshot = queryClient.getQueriesData<TPageData>({
        queryKey: [JOBS_KEY],
      });

      queryClient.setQueriesData<TPageData>(
        { queryKey: [JOBS_KEY] },
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
      queryClient.invalidateQueries({ queryKey: [JOBS_KEY] });
    },
    onSuccess: () => {
      toast.success("تم حذف الوظيفة بنجاح");
    },
  });
};

export const useGetDepartmentsForJob = () => {
  return useQuery({
    queryKey: [DEPARTMENTS_FOR_JOBS_KEY],
    queryFn: () => getDepartmentsForJob(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};


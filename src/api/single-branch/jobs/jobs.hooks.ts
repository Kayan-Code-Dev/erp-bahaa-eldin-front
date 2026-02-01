import { TPaginationResponse } from "@/api/api-common.types";
import { createBranchJob, deleteBranchJob, getBranchJobs, updateBranchJob } from "./jobs.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TBranchJob } from "./jobs.types";

export const BRANCH_JOBS_KEY = 'BRANCH_JOBS_KEY';

export const useGetBranchJobs = (page: number) => {
    return useQuery<TPaginationResponse<TBranchJob> | undefined, Error>({
        queryKey: [BRANCH_JOBS_KEY, page],
        queryFn: () => getBranchJobs(page),
    });
};

export const useCreateBranchJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBranchJob,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_JOBS_KEY] });
        },
    });
};

export const useUpdateBranchJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: TBranchJob & { _method: "PUT" } }) =>
            updateBranchJob(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_JOBS_KEY] });
        },
    });
};

export const useDeleteBranchJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteBranchJob,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_JOBS_KEY] });
        },
    });
};

import { TPaginationResponse } from "@/api/api-common.types";
import { TBranchDepartment } from "./departments.types";
import { createBranchDepartment, deleteBranchDepartment, getBranchDepartments, updateBranchDepartment } from "./departments.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const BRANCH_DEPARTMENTS_KEY = 'BRANCH_DEPARTMENTS_KEY';

export const useGetBranchDepartments = (page: number) => {
    return useQuery<TPaginationResponse<TBranchDepartment> | undefined, Error>({
        queryKey: [BRANCH_DEPARTMENTS_KEY, page],
        queryFn: () => getBranchDepartments(page),
    });
};

export const useCreateBranchDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBranchDepartment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_DEPARTMENTS_KEY] });
        },
    });
};

export const useUpdateBranchDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: TBranchDepartment & { _method: "PUT" } }) =>
            updateBranchDepartment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_DEPARTMENTS_KEY] });
        },
    });
};

export const useDeleteBranchDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteBranchDepartment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_DEPARTMENTS_KEY] });
        },
    });
};

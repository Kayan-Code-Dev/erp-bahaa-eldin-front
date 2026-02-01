import { TPaginationResponse } from "@/api/api-common.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TBranchCategory } from "./categories.types";
import { createBranchCategory, deleteBranchCategory, getBranchCategories, updateBranchCategory } from "./categories.service";

export const BRANCH_CATEGORY_KEY = 'BRANCH_CATEGORY_KEY';

export const useGetBranchCategories = (page: number) => {
    return useQuery<TPaginationResponse<TBranchCategory> | undefined, Error>({
        queryKey: [BRANCH_CATEGORY_KEY, page],
        queryFn: () => getBranchCategories(page),
    });
};

export const useCreateBranchCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBranchCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_CATEGORY_KEY] });
        },
    });
};

export const useUpdateBranchCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: TBranchCategory & { _method: "PUT" } }) =>
            updateBranchCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_CATEGORY_KEY] });
        },
    });
};

export const useDeleteBranchCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteBranchCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_CATEGORY_KEY] });
        },
    });
};

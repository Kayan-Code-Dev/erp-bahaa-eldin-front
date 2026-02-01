import { TPaginationResponse } from "@/api/api-common.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TBranchSubCategory } from "./sub-categories.types";
import { createBranchSubCategory, deleteBranchSubCategory, getBranchSubCategories, updateBranchSubCategory } from "./sub-categories.service";

export const BRANCH_SUB_CATEGORY_KEY = 'BRANCH_SUB_CATEGORY_KEY';

export const useGetBranchSubCategories = (page: number) => {
    return useQuery<TPaginationResponse<TBranchSubCategory> | undefined, Error>({
        queryKey: [BRANCH_SUB_CATEGORY_KEY, page],
        queryFn: () => getBranchSubCategories(page),
    });
};

export const useCreateBranchSubCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBranchSubCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_SUB_CATEGORY_KEY] });
        },
    });
};

export const useUpdateBranchSubCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: TBranchSubCategory & { _method: "PUT" } }) =>
            updateBranchSubCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_SUB_CATEGORY_KEY] });
        },
    });
};

export const useDeleteBranchSubCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteBranchSubCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_SUB_CATEGORY_KEY] });
        },
    });
};

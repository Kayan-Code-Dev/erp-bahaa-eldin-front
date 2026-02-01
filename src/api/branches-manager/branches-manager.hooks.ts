import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TPaginationResponse } from "../api-common.types";
import { TBranchesManager } from "./branches-manager.types";
import { blockBranchesManager, createBranchesManager, deleteBranchesManager, forceDeleteBranchesManager, getBranchesManager, getDeletedBranchesManager, restoreBranchesManager, updateBranchesManager } from "./branches-manager.service";

export const BRANCHES_MANAGER_KEY = "branches-manager-key";
export const DELETED_BRANCHES_MANAGER_KEY = "deleted-branches-manager-key";

export const useGetBranchesManager = (page: number) => {
    return useQuery<TPaginationResponse<TBranchesManager> | undefined, Error>({
        queryKey: [BRANCHES_MANAGER_KEY, page],
        queryFn: () => getBranchesManager(page),
    });
};

export const useGetDeletedbranchesManager = (page: number) => {
    return useQuery<TPaginationResponse<TBranchesManager> | undefined, Error>({
        queryKey: [DELETED_BRANCHES_MANAGER_KEY, page],
        queryFn: () => getDeletedBranchesManager(page),
    });
};

export const useCreateBranchesManager = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBranchesManager,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCHES_MANAGER_KEY] });
        },
    });
};

export const useUpdateBranchesManager = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData }) =>
            updateBranchesManager(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCHES_MANAGER_KEY] });
        },
    });
};

export const useDeleteBranchesManager = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteBranchesManager,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCHES_MANAGER_KEY] });
            queryClient.invalidateQueries({ queryKey: [DELETED_BRANCHES_MANAGER_KEY] });
        },
    });
};

export const useForceDeleteBranchesManager = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: forceDeleteBranchesManager,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCHES_MANAGER_KEY] });
            queryClient.invalidateQueries({ queryKey: [DELETED_BRANCHES_MANAGER_KEY] });
        },
    });
};

export const useRestoreBranchesManager = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: restoreBranchesManager,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCHES_MANAGER_KEY] });
            queryClient.invalidateQueries({ queryKey: [DELETED_BRANCHES_MANAGER_KEY] });
        },
    });
};

export const useBlockBranchesManager = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: blockBranchesManager,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCHES_MANAGER_KEY] });
        },
    });
};
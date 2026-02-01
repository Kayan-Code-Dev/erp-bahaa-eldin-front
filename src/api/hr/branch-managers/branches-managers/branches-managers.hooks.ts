import { TPaginationResponse } from "@/api/api-common.types";
import { TBranchesManager } from "./branches-managers.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { blockBranchesManager, createBranchesManager, deleteBranchesManager, forceDeleteBranchesManager, getBranchesManagers, getBranchesManagersRoles, getDeletedBranchesManagers, restoreBranchesManager, updateBranchesManager } from "./branches-managers.service";

export const BRANCHES_MANAGERS_KEY = "branches-managers";
export const DELETED_BRANCHES_MANAGERS_KEY = "deleted-branches-managers";

export const useGetBranchesManagers = (page: number) => {
    return useQuery<TPaginationResponse<TBranchesManager> | undefined, Error>({
        queryKey: [BRANCHES_MANAGERS_KEY, page],
        queryFn: () => getBranchesManagers(page),
    });
};

export const useCreateBranchesManager = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBranchesManager,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCHES_MANAGERS_KEY] });
        },
    });
};

export const useUpdateBranchesManager = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData }) =>
            updateBranchesManager(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCHES_MANAGERS_KEY] });
        },
    });
};

export const useDeleteBranchesManager = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteBranchesManager,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCHES_MANAGERS_KEY] });
            queryClient.invalidateQueries({ queryKey: [DELETED_BRANCHES_MANAGERS_KEY] });
        },
    });
};

export const useGetBranchesManagersRoles = () => {
    return useQuery({
        queryKey: ["branches-managers-roles"],
        queryFn: getBranchesManagersRoles,
        staleTime: 24 * 60 * 60 * 1000,
    });
};

export const useGetDeletedBranchesManagers = (page: number) => {
    return useQuery<TPaginationResponse<TBranchesManager> | undefined, Error>({
        queryKey: [DELETED_BRANCHES_MANAGERS_KEY, page],
        queryFn: () => getDeletedBranchesManagers(page),
    });
};


export const useForceDeleteBranchesManager = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: forceDeleteBranchesManager,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCHES_MANAGERS_KEY] });
            queryClient.invalidateQueries({ queryKey: [DELETED_BRANCHES_MANAGERS_KEY] });
        },
    });
};

export const useRestoreBranchesManager = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: restoreBranchesManager,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCHES_MANAGERS_KEY] });
            queryClient.invalidateQueries({ queryKey: [DELETED_BRANCHES_MANAGERS_KEY] });
        },
    });
};

export const useBlockBranchesManager = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: blockBranchesManager,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCHES_MANAGERS_KEY] });
        },
    });
};
import { TPaginationResponse } from "@/api/api-common.types";
import { TBranchEmployee } from "@/api/branches-manager/employees/employees.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { blockBranchEmployee, createBranchEmployee, deleteBranchEmployee, forceDeleteBranchEmployee, getBranchEmployees, getDeletedBranchEmployees, getSingleBranchEmployee, restoreDeletedBranchEmployee, updateBranchEmployee } from "./employee.service";

export const BRANCH_EMPLOYEES_KEY = 'BRANCH_EMPLOYEES_KEY';
export const BRANCH_EMPLOYEE_KEY = 'BRANCH_EMPLOYEE_KEY';
export const BRANCH_EMPLOYEES_RECYCLE_BIN_KEY = 'BRANCH_EMPLOYEES_RECYCLE_BIN_KEY';

export const useGetBranchEmployees = (page: number) => {
    return useQuery<TPaginationResponse<TBranchEmployee> | undefined, Error>({
        queryKey: [BRANCH_EMPLOYEES_KEY, page],
        queryFn: () => getBranchEmployees(page),
    });
};

export const useGetSingleBranchEmployee = (id: string | undefined) => {
    return useQuery<TBranchEmployee | undefined, Error>({
        queryKey: [BRANCH_EMPLOYEE_KEY, id],
        queryFn: () => getSingleBranchEmployee(id),
        enabled: !!id,
    });
};

export const useCreateBranchEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBranchEmployee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_EMPLOYEES_KEY] });
        },
    });
};

export const useUpdateBranchEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData }) =>
            updateBranchEmployee(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_EMPLOYEES_KEY] });
        },
    });
};

export const useDeleteBranchEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteBranchEmployee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_EMPLOYEES_KEY] });
            queryClient.invalidateQueries({ queryKey: [BRANCH_EMPLOYEES_RECYCLE_BIN_KEY] });
        },
    });
};

export const useBlockBranchEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: blockBranchEmployee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BRANCH_EMPLOYEES_KEY] });
        },
    });
};

export const useDeletedBranchEmployees = (page: number) => {
    return useQuery({
        queryKey: [BRANCH_EMPLOYEES_RECYCLE_BIN_KEY],
        queryFn: () => getDeletedBranchEmployees(page),
        refetchOnWindowFocus: false,
    });
};

export const useRestoreDeletedBranchEmployee = () => {
    const qClient = useQueryClient();
    return useMutation({
        mutationFn: restoreDeletedBranchEmployee,
        onSettled: () => {
            qClient.invalidateQueries({
                queryKey: [BRANCH_EMPLOYEES_RECYCLE_BIN_KEY],
            });
        },
    });
};

export const useForceDeleteBranchEmployee = () => {
    const qClient = useQueryClient();
    return useMutation({
        mutationFn: forceDeleteBranchEmployee,
        onSettled: () => {
            qClient.invalidateQueries({
                queryKey: [BRANCH_EMPLOYEES_RECYCLE_BIN_KEY],
            });
        },
    });
};
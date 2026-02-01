import { TPaginationResponse } from "@/api/api-common.types";
import { TBranchEmployee } from "./employees.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  blockEmployee,
  createEmployee,
  deleteEmployee,
  forceDeleteEmployee,
  getDeletedEmployees,
  getEmployees,
  getListByModule,
  getSingleEmployee,
  restoreDeletedEmployee,
  updateEmployee,
} from "./employees.service";

export const BRANCHES_EMPLOYEES_KEY = "BRANCHES_EMPLOYEES_KEY";
export const BRANCHES_EMPLOYEE_KEY = "BRANCHES_EMPLOYEE_KEY";
export const BRANCHES_EMPLOYEES_RECYCLE_BIN_KEY =
  "BRANCHES_EMPLOYEES_RECYCLE_BIN_KEY";

export const useGetEmployees = (page: number) => {
  return useQuery<TPaginationResponse<TBranchEmployee> | undefined, Error>({
    queryKey: [BRANCHES_EMPLOYEES_KEY, page],
    queryFn: () => getEmployees(page),
  });
};

export const useGetSingleEmployee = (id: string | undefined) => {
  return useQuery<TBranchEmployee | undefined, Error>({
    queryKey: [BRANCHES_EMPLOYEES_KEY, id],
    queryFn: () => getSingleEmployee(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BRANCHES_EMPLOYEES_KEY] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BRANCHES_EMPLOYEES_KEY] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BRANCHES_EMPLOYEES_KEY] });
      queryClient.invalidateQueries({
        queryKey: [BRANCHES_EMPLOYEES_RECYCLE_BIN_KEY],
      });
    },
  });
};

export const useBlockEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blockEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BRANCHES_EMPLOYEES_KEY] });
    },
  });
};

export const useDeletedEmployees = (page: number) => {
  return useQuery({
    queryKey: [BRANCHES_EMPLOYEES_RECYCLE_BIN_KEY],
    queryFn: () => getDeletedEmployees(page),
    refetchOnWindowFocus: false,
  });
};

export const useRestoreDeletedEmployee = () => {
  const qClient = useQueryClient();
  return useMutation({
    mutationFn: restoreDeletedEmployee,
    onSettled: () => {
      qClient.invalidateQueries({
        queryKey: [BRANCHES_EMPLOYEES_RECYCLE_BIN_KEY],
      });
    },
  });
};

export const useForceDeleteEmployee = () => {
  const qClient = useQueryClient();
  return useMutation({
    mutationFn: forceDeleteEmployee,
    onSettled: () => {
      qClient.invalidateQueries({
        queryKey: [BRANCHES_EMPLOYEES_RECYCLE_BIN_KEY],
      });
    },
  });
};

const requiresId = [
  "department-list",
  "job-list",
  "roles-list",
  "branch-employee-job-list",
  "order-sub-categories-list",
  "employees-inventories-sub-categories-list",
  "employees-order-sub-categories-list",
];

export const useListByModule = (
  switchKey: string,
  id: string | number | undefined
) => {
  return useQuery({
    queryKey: [switchKey, id],
    queryFn: () => getListByModule(switchKey, id),
    enabled: requiresId.includes(switchKey) ? !!id : true,
  });
};

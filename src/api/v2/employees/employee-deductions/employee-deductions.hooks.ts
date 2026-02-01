import {
  approveEmployeeDeduction,
  createAbsenceEmployeeDeduction,
  createEmployeeDeduction,
  createLateEmployeeDeduction,
  deleteEmployeeDeduction,
  getEmployeeDeduction,
  getEmployeeDeductions,
  getEmployeeDeductionTypes,
  updateEmployeeDeduction,
} from "./employee-deductions.service";
import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  TGetEmployeeDeductionsParams,
  TUpdateEmployeeDeductionRequest,
} from "./employee-deductions.types";

export const EMPLOYEES_DEDUCTIONS_KEY = "employees-deductions";

export const useCreateLateEmployeeDeductionMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: createLateEmployeeDeduction,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_DEDUCTIONS_KEY] });
    },
  });
};

export const useCreateAbsenceEmployeeDeductionMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: createAbsenceEmployeeDeduction,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_DEDUCTIONS_KEY] });
    },
  });
};

export const useGetEmployeeDeductionsQueryOptions = (
  params: TGetEmployeeDeductionsParams
) => {
  return queryOptions({
    queryKey: [EMPLOYEES_DEDUCTIONS_KEY, params],
    queryFn: () => getEmployeeDeductions(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetEmployeeDeductionQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: [EMPLOYEES_DEDUCTIONS_KEY, id],
    queryFn: () => getEmployeeDeduction(id),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateEmployeeDeductionMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: createEmployeeDeduction,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_DEDUCTIONS_KEY] });
    },
  });
};

export const useUpdateEmployeeDeductionMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: TUpdateEmployeeDeductionRequest;
    }) => updateEmployeeDeduction(id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_DEDUCTIONS_KEY] });
    },
  });
};

export const useDeleteEmployeeDeductionMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: (id: number) => deleteEmployeeDeduction(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_DEDUCTIONS_KEY] });
    },
  });
};

export const useApproveEmployeeDeductionMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: (id: number) => approveEmployeeDeduction(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_DEDUCTIONS_KEY] });
    },
  });
};

export const useGetEmployeeDeductionTypesQueryOptions = () => {
  return queryOptions({
    queryKey: [EMPLOYEES_DEDUCTIONS_KEY, "types"],
    queryFn: () => getEmployeeDeductionTypes(),
    staleTime: 1000 * 60 * 5,
  });
};

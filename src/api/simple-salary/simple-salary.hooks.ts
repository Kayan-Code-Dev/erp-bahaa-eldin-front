import {
  mutationOptions,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getSimpleSalarySummary,
  createSimpleSalaryDeduction,
  getSimpleSalaryDeductions,
  paySimpleSalary,
  getSimpleSalaryPayments,
} from "./simple-salary.service";
import type {
  TGetSimpleSalaryDeductionsParams,
  TGetSimpleSalaryPaymentsParams,
  TCreateSimpleSalaryDeductionRequest,
  TSimpleSalaryPayRequest,
} from "./simple-salary.types";

export const SIMPLE_SALARY_KEY = "simple-salary";

export function useGetSimpleSalarySummaryQueryOptions(
  employeeId: number | null,
  period: string | null
) {
  return queryOptions({
    queryKey: [SIMPLE_SALARY_KEY, "summary", employeeId, period],
    queryFn: () => getSimpleSalarySummary(employeeId!, period!),
    enabled: !!employeeId && !!period && period.length === 7,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateSimpleSalaryDeductionMutationOptions() {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: (body: TCreateSimpleSalaryDeductionRequest) =>
      createSimpleSalaryDeduction(body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SIMPLE_SALARY_KEY, "summary", variables.employee_id, variables.period],
      });
      queryClient.invalidateQueries({
        queryKey: [SIMPLE_SALARY_KEY, "deductions"],
      });
    },
  });
}

export function useGetSimpleSalaryDeductionsQueryOptions(
  params: TGetSimpleSalaryDeductionsParams = {}
) {
  return queryOptions({
    queryKey: [SIMPLE_SALARY_KEY, "deductions", params],
    queryFn: () => getSimpleSalaryDeductions(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function usePaySimpleSalaryMutationOptions() {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: (body: TSimpleSalaryPayRequest) => paySimpleSalary(body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SIMPLE_SALARY_KEY, "summary", variables.employee_id, variables.period],
      });
      queryClient.invalidateQueries({
        queryKey: [SIMPLE_SALARY_KEY, "payments"],
      });
    },
  });
}

export function useGetSimpleSalaryPaymentsQueryOptions(
  params: TGetSimpleSalaryPaymentsParams = {}
) {
  return queryOptions({
    queryKey: [SIMPLE_SALARY_KEY, "payments", params],
    queryFn: () => getSimpleSalaryPayments(params),
    staleTime: 1000 * 60 * 2,
  });
}

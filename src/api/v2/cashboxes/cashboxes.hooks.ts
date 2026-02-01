import {
  infiniteQueryOptions,
  mutationOptions,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getCashbox,
  getCashboxByBranchId,
  getCashboxDailySummary,
  getCashboxes,
  recalculateCashbox,
  updateCashbox,
} from "./cashboxes.service";
import { TCashboxesParams, TUpdateCashboxRequest } from "./cashboxes.types";

export const CASHBOXES_KEY = "CASHBOXES";

export const useGetCashboxesQueryOptions = (params: TCashboxesParams) => {
  return queryOptions({
    queryKey: [CASHBOXES_KEY, params],
    queryFn: () => getCashboxes(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetCashboxQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: [CASHBOXES_KEY, id],
    queryFn: () => getCashbox(id),
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateCashboxMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: ({ id, data }: { id: number; data: TUpdateCashboxRequest }) =>
      updateCashbox(id, data),
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CASHBOXES_KEY, id] });
    },
  });
};

export const useGetCashboxDailySummaryQueryOptions = (
  id: number,
  date: string
) => {
  return queryOptions({
    queryKey: [CASHBOXES_KEY, id, date],
    queryFn: () => getCashboxDailySummary(id, date),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecalculateCashboxMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: recalculateCashbox,
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: [CASHBOXES_KEY, id] });
    },
  });
};

export const useGetCashboxByBranchIdQueryOptions = (branchId: number) => {
  return queryOptions({
    queryKey: [CASHBOXES_KEY, "by-branch", branchId],
    queryFn: () => getCashboxByBranchId(branchId),
    staleTime: 1000 * 60 * 5,
  });
};

// infinite query options used in selecting cashboxes combobox

export const useGetInfiniteCashboxesQueryOptions = (per_page: number) => {
  return infiniteQueryOptions({
    queryKey: [CASHBOXES_KEY, "infinite"],
    queryFn: ({ pageParam = 1 }) => getCashboxes({ page: pageParam, per_page }),
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      if (lastPage.current_page < lastPage.total_pages) {
        return lastPage.current_page + 1;
      }
    },
  });
};

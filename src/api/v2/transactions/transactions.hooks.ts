import { queryOptions } from "@tanstack/react-query";
import { getTransactionsPaymentsExpenses } from "./transactions.service";
import { TTransactionsParams } from "./transactions.types";

export const TRANSACTIONS_KEY = "TRANSACTIONS_KEY";

export const useGetTransactionsQueryOptions = (params: TTransactionsParams) => {
  return queryOptions({
    queryKey: [TRANSACTIONS_KEY, params],
    queryFn: () => getTransactionsPaymentsExpenses(params),
    staleTime: 1000 * 60 * 5,
  });
};


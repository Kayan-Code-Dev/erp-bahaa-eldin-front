import {
  mutationOptions,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createPayment,
  exportPaymentsToCSV,
  getPaymentById,
  getPayments,
  markPaymentAsCanceled,
  markPaymentAsPaid,
} from "./payments.service";
import { TGetPaymentsParams } from "./payments.types";
import { ORDERS_KEY } from "../orders/orders.hooks";

export const PAYMENTS_KEY = "payments";

export const useGetPaymentsQueryOptions = (params: TGetPaymentsParams) => {
  return queryOptions({
    queryKey: [PAYMENTS_KEY, params],
    queryFn: () => getPayments(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetPaymentByIdQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: [PAYMENTS_KEY, id],
    queryFn: () => getPaymentById(id),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreatePaymentMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: createPayment,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
  });
};

export const useMarkPaymentAsPaidMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: markPaymentAsPaid,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
  });
};

export const useMarkPaymentAsCanceledMutationOptions = () => {
  const queryClient = useQueryClient();
  return mutationOptions({
    mutationFn: markPaymentAsCanceled,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
  });
};

export const useExportPaymentsToCSVMutationOptions = () => {
  return mutationOptions({
    mutationFn: () => exportPaymentsToCSV(),
  });
};
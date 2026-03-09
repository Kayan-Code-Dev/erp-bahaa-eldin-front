import { api } from "@/api/api-contants";
import { TPaginationResponse } from "@/api/api-common.types";
import { populateError } from "@/api/api.utils";
import { TTransaction, TTransactionsParams } from "./transactions.types";

/** GET /api/v1/transactions/payments-expenses */
export const getTransactionsPaymentsExpenses = async (
  params: TTransactionsParams
) => {
  try {
    const { data } = await api.get<TPaginationResponse<TTransaction>>(
      "/transactions/payments-expenses",
      { params }
    );
    return data;
  } catch (error) {
    populateError(error, "خطأ فى جلب كشف معاملات الخزنة");
  }
};


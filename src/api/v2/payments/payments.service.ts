import {
  TCreatePaymentRequest,
  TGetPaymentsParams,
  TPayment,
} from "./payments.types";
import { api } from "@/api/api-contants";
import { TPaginationResponse } from "@/api/api-common.types";
import { populateError } from "@/api/api.utils";

export const getPayments = async (params: TGetPaymentsParams) => {
  try {
    const { data } = await api.get<TPaginationResponse<TPayment>>("/payments", {
      params,
    });
    return data;
  } catch (error) {
    populateError(error, "خطأ فى جلب المدفوعات");
  }
};

export const getPaymentById = async (id: number) => {
  try {
    const { data } = await api.get<TPayment>(`/payments/${id}`);
    return data;
  } catch (error) {
    populateError(error, "خطأ فى جلب المدفوعة");
  }
};

export const createPayment = async (payment: TCreatePaymentRequest) => {
  try {
    const { data } = await api.post<TPayment>("/payments", payment);
    return data;
  } catch (error) {
    populateError(error, "خطأ فى إنشاء المدفوعة");
  }
};

export const markPaymentAsPaid = async (id: number) => {
  try {
    const { data } = await api.post<TPayment>(`/payments/${id}/pay`);
    return data;
  } catch (error) {
    populateError(error, "خطأ فى تحديث حالة المدفوعة");
  }
};

export const markPaymentAsCanceled = async (id: number) => {
  try {
    const { data } = await api.post<TPayment>(`/payments/${id}/cancel`);
    return data;
  } catch (error) {
    populateError(error, "خطأ فى تحديث حالة المدفوعة");
  }
};


export const exportPaymentsToCSV = async () => {
  try {
    const { data } = await api.get(`/payments/export`, { responseType: "blob" });
    return data;
  } catch (error) {
    populateError(error, "خطأ فى تصدير المدفوعات");
  }
};
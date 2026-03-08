import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import type {
  TSimpleSalarySummary,
  TCreateSimpleSalaryDeductionRequest,
  TCreateSimpleSalaryDeductionResponse,
  TGetSimpleSalaryDeductionsParams,
  TSimpleSalaryPaginatedResponse,
  TSimpleSalaryDeduction,
  TSimpleSalaryPayRequest,
  TSimpleSalaryPayResponse,
  TGetSimpleSalaryPaymentsParams,
  TSimpleSalaryPayment,
} from "./simple-salary.types";

/** baseURL already includes /api/v1 */
const BASE = "/simple-salary";

export async function getSimpleSalarySummary(
  employeeId: number,
  period: string
): Promise<TSimpleSalarySummary | null> {
  try {
    const { data } = await api.get<TSimpleSalarySummary>(
      `${BASE}/employee/${employeeId}/period/${period}`
    );
    return data;
  } catch (error) {
    populateError(error, "خطأ في جلب ملخص الراتب");
    return null;
  }
}

export async function createSimpleSalaryDeduction(
  body: TCreateSimpleSalaryDeductionRequest
): Promise<TCreateSimpleSalaryDeductionResponse | null> {
  try {
    const { data } = await api.post<TCreateSimpleSalaryDeductionResponse>(
      `${BASE}/deductions`,
      body
    );
    return data;
  } catch (error) {
    populateError(error, "خطأ في إضافة الخصم");
    return null;
  }
}

export async function getSimpleSalaryDeductions(
  params?: TGetSimpleSalaryDeductionsParams
): Promise<TSimpleSalaryPaginatedResponse<TSimpleSalaryDeduction> | null> {
  try {
    const { data } = await api.get<
      TSimpleSalaryPaginatedResponse<TSimpleSalaryDeduction>
    >(`${BASE}/deductions`, { params });
    return data;
  } catch (error) {
    populateError(error, "خطأ في جلب الخصومات");
    return null;
  }
}

export async function paySimpleSalary(
  body: TSimpleSalaryPayRequest
): Promise<TSimpleSalaryPayResponse | null> {
  try {
    const { data } = await api.post<TSimpleSalaryPayResponse>(
      `${BASE}/pay`,
      body
    );
    return data;
  } catch (error) {
    populateError(error, "خطأ في تسجيل الدفعة");
    return null;
  }
}

export async function getSimpleSalaryPayments(
  params?: TGetSimpleSalaryPaymentsParams
): Promise<TSimpleSalaryPaginatedResponse<TSimpleSalaryPayment> | null> {
  try {
    const { data } = await api.get<
      TSimpleSalaryPaginatedResponse<TSimpleSalaryPayment>
    >(`${BASE}/payments`, { params });
    return data;
  } catch (error) {
    populateError(error, "خطأ في جلب الدفعات");
    return null;
  }
}

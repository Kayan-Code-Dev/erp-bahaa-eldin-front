import { api } from "@/api/api-contants";
import {
  TCreateAbsenceEmployeeDeductionRequest,
  TCreateEmployeeDeductionRequest,
  TCreateLateEmployeeDeductionRequest,
  TEmployeeDeduction,
  TEmployeeDeductionType,
  TGetEmployeeDeductionsParams,
  TUpdateEmployeeDeductionRequest,
} from "./employee-deductions.types";
import { populateError } from "@/api/api.utils";
import { TPaginationResponse } from "@/api/api-common.types";

export const createLateEmployeeDeduction = async (
  data: TCreateLateEmployeeDeductionRequest
) => {
  try {
    await api.post("/deductions/create-late", data);
  } catch (error) {
    populateError(error, "خطأ فى إنشاء الإذن المتأخر");
  }
};

export const createAbsenceEmployeeDeduction = async (
  data: TCreateAbsenceEmployeeDeductionRequest
) => {
  try {
    await api.post("/deductions/create-absence", data);
  } catch (error) {
    populateError(error, "خطأ فى إنشاء الإذن الغير موجود");
  }
};

export const getEmployeeDeductions = async (
  params: TGetEmployeeDeductionsParams
) => {
  try {
    const { data } = await api.get<TPaginationResponse<TEmployeeDeduction>>(
      "/deductions",
      { params }
    );
    return data;
  } catch (error) {
    populateError(error, "خطأ فى إحضار الإذنات");
  }
};

export const getEmployeeDeduction = async (id: number) => {
  try {
    const { data } = await api.get<TEmployeeDeduction>(
      `/deductions/${id}`
    );
    return data;
  } catch (error) {
    populateError(error, "خطأ فى إحضار الإذن");
  }
};

export const createEmployeeDeduction = async (
  data: TCreateEmployeeDeductionRequest
) => {
  try {
    await api.post("/deductions", data);
  } catch (error) {
    populateError(error, "خطأ فى إنشاء الإذن");
  }
};

export const approveEmployeeDeduction = async (id: number) => {
  try {
    await api.post(`/deductions/${id}/approve`);
  } catch (error) {
    populateError(error, "خطأ فى تأكيد الإذن");
  }
};

export const updateEmployeeDeduction = async (
  id: number,
  data: TUpdateEmployeeDeductionRequest
) => {
  try {
    await api.put(`/deductions/${id}`, data);
  } catch (error) {
    populateError(error, "خطأ فى تحديث الإذن");
  }
};

export const deleteEmployeeDeduction = async (id: number) => {
  try {
    await api.delete(`/deductions/${id}`);
  } catch (error) {
    populateError(error, "خطأ فى حذف الإذن");
  }
};

export const getEmployeeDeductionTypes = async () => {
  try {
    const { data } = await api.get<{ types: TEmployeeDeductionType[] }>(
      "/deductions/types"
    );
    return data;
  } catch (error) {
    populateError(error, "خطأ فى إحضار أنواع الإذنات");
  }
};

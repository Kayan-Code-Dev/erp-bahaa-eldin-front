import { TPaginationResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import { TDepartment } from "./departments.types";

export const getDepartments = async (page: number) => {
  try {
    const { data } = await api.get<{ data: TPaginationResponse<TDepartment> }>(
      `/employees/departments`,
      {
        params: { page },
      }
    );
    data.data.total_pages = Math.ceil(data.data.total / 10);
    return data.data;
  } catch (error) {
    populateError(error, "خطأ فى جلب الاقسام");
  }
};

export type TCreateDepartmentRequest = {
  name: string;
  code: string;
  description: string;
};

export const createDepartment = async (data: TCreateDepartmentRequest) => {
  try {
    await api.post<TDepartment>(`/employees/departments`, data);
  } catch (error) {
    populateError(error, "خطأ فى اضافة قسم");
  }
};

export type TUpdateDepartmentRequest = {
  name: string;
  code: string;
  description: string;
  active: boolean;
};

export const updateDepartment = async (
  id: number,
  data: TUpdateDepartmentRequest
) => {
  try {
    await api.put<TDepartment>(`/employees/departments/${id}`, data);
  } catch (error) {
    populateError(error, "خطأ فى تعديل قسم");
  }
};

export const deleteDepartment = async (id: number) => {
  try {
    await api.delete(`/employees/departments/${id}`);
  } catch (error) {
    populateError(error, "خطأ فى حذف قسم");
  }
};

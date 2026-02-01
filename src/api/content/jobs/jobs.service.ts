import { TPaginationResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import { TJob } from "./jobs.types";
import { TListItem } from "@/api/branches-manager/employees/employees.types";

export const getJobs = async (page: number) => {
  try {
    const { data } = await api.get<{ data: TPaginationResponse<TJob> }>(
      `/employees/jobs`,
      {
        params: { page },
      }
    );
    data.data.total_pages = Math.ceil(data.data.total / 10);
    return data.data;
  } catch (error) {
    populateError(error, "خطأ فى جلب الوظائف");
  }
};

export type TCreateJobRequest = {
  name: string;
  code: string;
  description: string;
  department_id: number;
};

export const createJob = async (data: TCreateJobRequest) => {
  try {
    await api.post<TJob>(`/employees/jobs`, data);
  } catch (error) {
    populateError(error, "خطأ فى اضافة وظيفة");
  }
};

export type TUpdateJobRequest = {
  name: string;
  code: string;
  description: string;
  active: boolean;
  department_id: number;
};

export const updateJob = async (id: number, data: TUpdateJobRequest) => {
  try {
    await api.put<TJob>(`/employees/jobs/${id}`, data);
  } catch (error) {
    populateError(error, "خطأ فى تعديل الوظيفة");
  }
};

export const deleteJob = async (id: number) => {
  try {
    await api.delete(`/employees/jobs/${id}`);
  } catch (error) {
    populateError(error, "خطأ فى حذف الوظيفة");
  }
};

export const getDepartmentsForJob = async () => {
  try {
    const { data } = await api.get<{ data: TListItem[] }>(
      `/employees/jobs/get_department`
    );
    return data.data;
  } catch (error) {
    populateError(error, "خطأ فى جلب الاقسام");
  }
};

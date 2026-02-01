import { TPaginationResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import { TCategory } from "./categories.types";

export const getCategories = async (page: number) => {
  try {
    const { data } = await api.get<{ data: TPaginationResponse<TCategory> }>(
      `/employees/categories`,
      {
        params: {
          page,
        },
      }
    );
    data.data.total_pages = Math.ceil(data.data.total / 10);
    return data.data;
  } catch (error) {
    populateError(error, "خطأ في تحميل الفئات");
  }
};

export type TCreateCategory = {
  name: string;
  description: string;
};

export const createCategory = async (data: TCreateCategory) => {
  try {
    const { data: response } = await api.post("/employees/categories", data);
    return response.data;
  } catch (error) {
    populateError(error, "خطأ في إنشاء الفئة");
  }
};

export type TUpdateCategory = {
  description: string;
  name: string;
  active: boolean;
};

export const updateCategory = async (id: number, data: TUpdateCategory) => {
  try {
    const { data: response } = await api.put(
      `/employees/categories/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    populateError(error, "خطأ في تحديث الفئة");
  }
};

export const deleteCategory = async (id: number) => {
  try {
    await api.delete(`/employees/categories/${id}`);
  } catch (error) {
    populateError(error, "خطأ في حذف الفئة");
  }
};

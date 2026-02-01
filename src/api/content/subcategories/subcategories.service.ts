import { TPaginationResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import { TListItem } from "@/api/branches-manager/employees/employees.types";
import { TSubcategory } from "./subcategories.types";

export const getSubcategories = async (page: number) => {
  try {
    const { data } = await api.get<{ data: TPaginationResponse<TSubcategory> }>(
      `/employees/sub_categories`,
      {
        params: {
          page,
        },
      }
    );
    data.data.total_pages = Math.ceil(data.data.total / 10);
    return data.data;
  } catch (error) {
    populateError(error, "خطأ في تحميل الفئات الفرعية");
  }
};

export type TCreateSubcategory = {
  name: string;
  description: string;
  category_id: number;
};

export const createSubcategory = async (data: TCreateSubcategory) => {
  try {
    const { data: response } = await api.post(
      "/employees/sub_categories",
      data
    );
    return response.data;
  } catch (error) {
    populateError(error, "خطأ في إنشاء الفئة الفرعية");
  }
};

export type TUpdateSubcategory = {
  description: string;
  name: string;
  category_id: number;
  active: boolean;
};

export const updateSubcategory = async (
  id: number,
  data: TUpdateSubcategory
) => {
  try {
    const { data: response } = await api.put(
      `/employees/sub_categories/${id}`,
      data
    );
    return response.data;
  } catch (error) {
    populateError(error, "خطأ في تحديث الفئة الفرعية");
  }
};

export const deleteSubcategory = async (id: number) => {
  try {
    await api.delete(`/employees/sub_categories/${id}`);
  } catch (error) {
    populateError(error, "خطأ في حذف الفئة الفرعية");
  }
};

export const getCategoriesForSubcategories = async () => {
  try {
    const { data } = await api.get<{ data: TListItem[] }>(
      `/employees/sub_categories/get_my_categories`
    );
    return data.data;
  } catch (error) {
    populateError(error, "خطأ في تحميل الفئات");
  }
};

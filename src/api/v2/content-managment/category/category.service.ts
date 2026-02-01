import { populateError } from "@/api/api.utils";
import {
  TCategory,
  TCreateCategoryRequest,
  TCreateCategoryResponse,
  TUpdateCategoryRequest,
} from "./category.type";
import { api } from "@/api/api-contants";
import { TPaginationResponse } from "@/api/api-common.types";

export const createCategoryApi = async (req: TCreateCategoryRequest) => {
  try {
    const { data } = await api.post<TCreateCategoryResponse>(
      "/categories",
      req
    );
    return data;
  } catch (error: any) {
    populateError(error, "خطأ فى إنشاء الفئة");
  }
};

export const getCategoriesApi = async (page: number, per_page: number) => {
  try {
    const { data } = await api.get<TPaginationResponse<TCategory>>(
      "/categories",
      { params: { page, per_page } }
    );
    return data;
  } catch (error: any) {
    populateError(error, "خطأ فى جلب الفئات");
  }
};

export const getCategoryByIdApi = async (id: number) => {
  try {
    const { data } = await api.get<TCategory>(`/categories/${id}`);
    return data;
  } catch (error: any) {
    populateError(error, "خطأ فى جلب الفئة");
  }
};

export const updateCategoryApi = async (
  id: number,
  req: TUpdateCategoryRequest
) => {
  try {
    const { data } = await api.put<TCategory>(
      `/categories/${id}`,
      req
    );
    return data;
  } catch (error: any) {
    populateError(error, "خطأ فى تحديث الفئة");
  }
};

export const deleteCategoryApi = async (id: number) => {
  try {
    await api.delete(`/categories/${id}`);
    return true;
  } catch (error: any) {
    populateError(error, "خطأ فى حذف الفئة");
  }
};

export const exportCategoriesToCSV = async () => {
  try {
    const { data } = await api.get(`/categories/export`, { responseType: "blob" });
    return data;
  } catch (error) {
    populateError(error, "خطأ فى تصدير الفئات");
  }
};
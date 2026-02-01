import {
  TCreateSubcategoryRequest,
  TCreateSubcategoryResponse,
  TSubcategory,
  TUpdateSubcategoryRequest,
} from "./subcategory.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import { TPaginationResponse } from "@/api/api-common.types";

export const createSubcategoryApi = async (req: TCreateSubcategoryRequest) => {
  try {
    const { data } = await api.post<TCreateSubcategoryResponse>(
      "/subcategories",
      req
    );
    return data;
  } catch (error: any) {
    populateError(error, "خطأ فى إنشاء الفئة الفرعية");
  }
};

export const getSubcategoriesApi = async (page: number, per_page: number, category_id?: number) => {
  try {
    const { data } = await api.get<TPaginationResponse<TSubcategory>>(
      "/subcategories",
      { params: { page, per_page, category_id } }
    );
    return data;
  } catch (error: any) {
    populateError(error, "خطأ فى جلب الفئات الفرعية");
  }
};

export const getSubcategoryByIdApi = async (id: number) => {
  try {
    const { data } = await api.get<TSubcategory>(`/subcategories/${id}`);
    return data;
  } catch (error: any) {
    populateError(error, "خطأ فى جلب الفئة الفرعية");
  }
};

export const updateSubcategoryApi = async (
  id: number,
  req: TUpdateSubcategoryRequest
) => {
  try {
    const { data } = await api.put<TSubcategory>(`/subcategories/${id}`, req);
    return data;
  } catch (error: any) {
    populateError(error, "خطأ فى تحديث الفئة الفرعية");
  }
};

export const deleteSubcategoryApi = async (id: number) => {
  try {
    await api.delete(`/subcategories/${id}`);
    return true;
  } catch (error: any) {
    populateError(error, "خطأ فى حذف الفئة الفرعية");
  }
};


export const exportSubcategoriesToCSV = async () => {
  try {
    const { data } = await api.get(`/subcategories/export`, { responseType: "blob" });
    return data;
  } catch (error) {
    populateError(error, "خطأ فى تصدير الفئات الفرعية");
  }
};
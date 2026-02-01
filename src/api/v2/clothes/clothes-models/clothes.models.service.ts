import { TPaginationResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import {
  TClothesModel,
  TCreateClothesModel,
  TUpdateClothesModel,
} from "./clothes.models.types";
import { populateError } from "@/api/api.utils";

export const getClothesModels = async (page: number, per_page: number) => {
  try {
    const { data } = await api.get<TPaginationResponse<TClothesModel>>(
      `/cloth-types`,
      { params: { page, per_page } }
    );
    return data;
  } catch (error) {
    populateError(error, "خطأ في جلب الموديلات");
  }
};

export const createClothesModel = async (data: TCreateClothesModel) => {
  try {
    const { data: responseData } = await api.post<{ data: TClothesModel }>(
      `/cloth-types`,
      data
    );
    return responseData;
  } catch (error) {
    populateError(error, "خطأ في إنشاء الموديل");
  }
};

export const updateClothesModel = async (
  id: number,
  data: TUpdateClothesModel
) => {
  try {
    const { data: responseData } = await api.put<{ data: TClothesModel }>(
      `/cloth-types/${id}`,
      data
    );
    return responseData;
  } catch (error) {
    populateError(error, "خطأ في تحديث الموديل");
  }
};

export const deleteClothesModel = async (id: number) => {
  try {
    const { data: responseData } = await api.delete<{ data: TClothesModel }>(
      `/cloth-types/${id}`
    );
    return responseData;
  } catch (error) {
    populateError(error, "خطأ في حذف الموديل");
  }
};

export const getClothesModelById = async (id: number) => {
  try {
    const { data: responseData } = await api.get<{ data: TClothesModel }>(
      `/cloth-types/${id}`
    );
    return responseData;
  } catch (error) {
    populateError(error, "خطأ في جلب الموديل");
  }
};

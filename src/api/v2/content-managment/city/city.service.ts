import { populateError } from "@/api/api.utils";
import {
  TCity,
  TCreateCityRequest,
  TCreateCityResponse,
  TUpdateCityRequest,
} from "./city.types";
import { api } from "@/api/api-contants";
import { TPaginationResponse } from "@/api/api-common.types";

export const createCityApi = async (req: TCreateCityRequest) => {
  try {
    const { data } = await api.post<TCreateCityResponse>(
      "/cities",
      req
    );
    return data;
  } catch (error: any) {
    populateError(error, "خطأ فى إنشاء المدينة");
  }
};

export const getCitiesApi = async (page: number, per_page: number) => {
  try {
    const { data } = await api.get<TPaginationResponse<TCity>>(
      "/cities",
      { params: { page, per_page } }
    );
    return data;
  } catch (error: any) {
    populateError(error, "خطأ فى جلب المدن");
  }
};

export const getCityByIdApi = async (id: number) => {
  try {
    const { data } = await api.get<TCity>(`/cities/${id}`);
    return data;
  } catch (error: any) {
    populateError(error, "خطأ فى جلب المدينة");
  }
};

export const updateCityApi = async (id: number, req: TUpdateCityRequest) => {
  try {
    const { data } = await api.put<TCity>(`/cities/${id}`, req);
    return data;
  } catch (error: any) {
    populateError(error, "خطأ فى تحديث المدينة");
  }
};

export const deleteCityApi = async (id: number) => {
  try {
    await api.delete(`/cities/${id}`);
    return true;
  } catch (error: any) {
    populateError(error, "خطأ فى حذف المدينة");
  }
};

export const exportCitiesToCSV = async () => {
  try {
    const { data } = await api.get(`/cities/export`, { responseType: "blob" });
    return data;
  } catch (error) {
    populateError(error, "خطأ فى تصدير المدن");
  }
};
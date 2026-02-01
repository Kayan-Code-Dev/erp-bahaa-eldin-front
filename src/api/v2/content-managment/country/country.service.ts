import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import {
  TCountry,
  TCreateCountryRequest,
  TCreateCountryResponse,
} from "./country.types";
import { TPaginationResponse } from "@/api/api-common.types";

export const createCountryApi = async (req: TCreateCountryRequest) => {
  try {
    const { data } = await api.post<{ data: TCreateCountryResponse }>(
      "/countries",
      req
    );
    return data;
  } catch (error: any) {
    populateError(error, "خطأ فى إنشاء الدولة");
  }
};

export const getCountriesApi = async (page: number, per_page: number) => {
  try {
    const { data } = await api.get<TPaginationResponse<TCountry>>(
      "/countries",
      { params: { page, per_page } }
    );
    return data;
  } catch (error: any) {
    populateError(error, "خطأ فى جلب الدول");
  }
};

export const getCountryByIdApi = async (id: number) => {
  try {
    const { data } = await api.get<{ data: TCountry }>(`/countries/${id}`);
    return data.data;
  } catch (error: any) {
    populateError(error, "خطأ فى جلب الدولة");
  }
};

export const updateCountryApi = async (
  id: number,
  req: TCreateCountryRequest
) => {
  try {
    const { data } = await api.put<{ data: TCountry }>(`/countries/${id}`, req);
    return data.data;
  } catch (error: any) {
    populateError(error, "خطأ فى تحديث الدولة");
  }
};

export const deleteCountryApi = async (id: number) => {
  try {
    await api.delete(`/countries/${id}`);
    return true;
  } catch (error: any) {
    populateError(error, "خطأ فى حذف الدولة");
  }
};


export const exportCountriesToCSV = async () => {
  try {
    const { data } = await api.get(`/countries/export`, { responseType: "blob" });
    return data;
  } catch (error) {
    populateError(error, "خطأ فى تصدير الدول");
  }
};
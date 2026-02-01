import { TPaginationResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import {
  TCreateClientRequest,
  TClientResponse,
  TUpdateClientRequest,
} from "./clients.types";

export const getClients = async (
  page: number,
  per_page: number,
  search?: string
) => {
  try {
    const { data } = await api.get<TPaginationResponse<TClientResponse>>(
      "/clients",
      { params: { page, per_page, search } }
    );
    return data;
  } catch (error) {
    populateError(error, "خطأ فى جلب العملاء");
  }
};

export const createClient = async (data: TCreateClientRequest) => {
  try {
    const { data: response } = await api.post<TClientResponse>(
      "/clients",
      data
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى إنشاء العميل");
  }
};

export const updateClient = async (id: number, data: TUpdateClientRequest) => {
  try {
    const { data: response } = await api.put<TClientResponse>(
      `/clients/${id}`,
      data
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى تحديث العميل");
  }
};

export const deleteClient = async (id: number) => {
  try {
    await api.delete<TClientResponse>(`/clients/${id}`);
  } catch (error) {
    populateError(error, "خطأ فى حذف العميل");
  }
};

export const getClient = async (id: number) => {
  try {
    const { data: response } = await api.get<TClientResponse>(`/clients/${id}`);
    return response;
  } catch (error) {
    populateError(error, "خطأ فى جلب العميل");
  }
};

export const exportClientsToCSV = async () => {
  try {
    const { data } = await api.get(`/clients/export`, { responseType: "blob" });
    return data;
  } catch (error) {
    populateError(error, "خطأ فى تصدير العملاء");
  }
};

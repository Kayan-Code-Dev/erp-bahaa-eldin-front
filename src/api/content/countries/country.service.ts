import { TPaginationResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import { TCountry } from "./country.types";

export const getCountries = async (page: number) => {
  try {
    const { data } = await api.get<{ data: TPaginationResponse<TCountry> }>(
      `/admins/countries`,
      { params: { page } }
    );
    data.data.total_pages = Math.ceil(data.data.total / 10);
    return data.data;
  } catch (error) {
    populateError(error, "خطأ فى جلب الدول");
  }
};

export const getCountriesByModule = async (switchKey: string) => {
  let endpoint = "/admins/admins/get_countries"
  switch (switchKey) {
    case "admin": endpoint = "/admins/admins/get_countries"
      break;

    case "branches-managers": endpoint = "/admins/branch-managers/get_countries"
      break;

    case "branches-employees": endpoint = "/branch_managers/employees/get_countries"
      break;

    case "branch-employee": endpoint = "/branches/employees/get_countries"
      break;

    default: endpoint = "/admins/admins/get_countries"
  }

  try {
    const { data } = await api.get<{ data: Pick<TCountry, "id" | "name" | "code">[] }>(
      endpoint,
    );
    return data.data;
  } catch (error) {
    populateError(error, "خطأ فى جلب الدول");
  }
};

export const createCountry = async (data: FormData) => {
  try {
    await api.post(`/admins/countries`, data);
  } catch (error) {
    populateError(error, "خطأ فى اضافة الدولة");
  }
};

export const updateCountry = async (id: number, data: FormData) => {
  try {
    await api.post(`/admins/countries/${id}`, data);
  } catch (error) {
    populateError(error, "خطأ فى تحديث الدولة");
  }
};

export const deleteCountry = async (id: number) => {
  try {
    await api.delete(`/admins/countries/${id}`);
  } catch (error) {
    populateError(error, "خطأ فى حذف الدولة");
  }
};

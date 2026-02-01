import { TPaginationResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import { TCity } from "./city.types";

export const getCities = async (page: number) => {
  try {
    const { data } = await api.get<{ data: TPaginationResponse<TCity> }>(
      `/admins/cities`,
      { params: { page } }
    );
    data.data.total_pages = Math.ceil(data.data.total / 10);
    return data.data;
  } catch (error) {
    populateError(error, "خطأ فى جلب المدن");
  }
};

//      "name": "غزة",
//      "code": "Gazza",
//      "country_id": 2
export const createCity = async (data: FormData) => {
  try {
    await api.post(`/admins/cities`, data);
  } catch (error) {
    populateError(error, "خطأ فى انشاء المدينة");
  }
};

//      "name": "غزة",
//      "code": "Gazza",
//      "country_id": 2
//      "active" : 0 | 1

export const updateCity = async (id: number, data: FormData) => {
  try {
    await api.post(`/admins/cities/${id}`, data);
  } catch (error) {
    populateError(error, "خطأ فى تحديث المدينة");
  }
};

export const deleteCity = async (id: number) => {
  try {
    await api.delete(`/admins/cities/${id}`);
  } catch (error) {
    populateError(error, "خطأ فى حذف المدينة");
  }
};

export const getCitiesByCountry = async (id: number, switchKey?: string) => {
  let endpoint = "/admins/cities/"
  switch (switchKey) {
    case "admin": endpoint = "/admins/admins/get_cities/"
      break;

    case "branches-managers": endpoint = "/admins/branch-managers/get_cities/"
      break;

    case "branches-employees": endpoint = "/branch_managers/employees/get_cities_by_country/"
      break;

    case "branch-employee": endpoint = "/branches/employees/get_cities_by_country/"
      break;

    default: endpoint = "/admins/cities/"
  }

  try {
    const { data } = await api.get<{
      data: Pick<TCity, "id" | "name" | "code">[];
    }>(`${endpoint}${id}`);
    return data.data;
  } catch (error) {
    populateError(error, "خطأ فى جلب المدن");
  }
};

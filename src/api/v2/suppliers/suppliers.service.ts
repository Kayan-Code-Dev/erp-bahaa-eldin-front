import {
  TCreateSupplierRequest,
  TCreateSupplierOrderRequest,
  TSupplierResponse,
  TUpdateSupplierRequest,
  TSuppliersListResponse,
} from "./suppliers.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";

export const createSupplier = async (data: TCreateSupplierRequest) => {
  try {
    const { data: response } = await api.post<TSupplierResponse>(
      "/suppliers",
      data
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى إنشاء المورد");
  }
};

export const updateSupplier = async (
  id: number,
  data: TUpdateSupplierRequest
) => {
  try {
    const { data: response } = await api.put<TSupplierResponse>(
      `/suppliers/${id}`,
      data
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى تحديث المورد");
  }
};

export const getSuppliers = async (page: number, per_page: number) => {
  try {
    const { data: response } = await api.get<TSuppliersListResponse>(
      `/suppliers`,
      { params: { page, per_page } }
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى جلب الموردين");
  }
};

export const getSupplier = async (id: number) => {
  try {
    const { data: response } = await api.get<TSupplierResponse>(
      `/suppliers/${id}`
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى جلب المورد");
  }
};

export const deleteSupplier = async (id: number) => {
  try {
    const { data: response } = await api.delete<TSupplierResponse>(
      `/suppliers/${id}`
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى حذف المورد");
  }
};

export const createSupplierOrder = async (data: TCreateSupplierOrderRequest) => {
  try {
    const { data: response } = await api.post<TSupplierResponse>(
      "/suppliers/orders",
      data
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى إنشاء طلبية المورد");
  }
};

export const getSuppliersList = async () => {
  try {
    const { data: response } = await api.get<TSupplierResponse[]>(
      `/suppliers/list`
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى جلب قائمة الموردين");
  }
};






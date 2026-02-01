import {
  TCreateSupplierRequest,
  TCreateSupplierMinimalRequest,
  TCreateSupplierOrderRequest,
  TSupplierResponse,
  TUpdateSupplierRequest,
  TSuppliersListResponse,
  TSupplierOrdersListResponse,
} from "./suppliers.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";

/** استجابة إنشاء مورد من POST /suppliers/store */
type TCreateSupplierStoreResponse = {
  message?: string;
  supplier: TSupplierResponse;
};

/** إنشاء مورد (اسم وكود فقط) - POST /api/v1/suppliers/store */
export const createSupplierMinimal = async (data: TCreateSupplierMinimalRequest) => {
  try {
    const { data: response } = await api.post<TCreateSupplierStoreResponse>(
      "/suppliers/store",
      data
    );
    return response?.supplier;
  } catch (error) {
    populateError(error, "خطأ فى إنشاء المورد");
  }
};

/** إنشاء مورد مع الطلبية الأولى - POST /api/v1/suppliers/store */
export const createSupplier = async (data: TCreateSupplierRequest) => {
  try {
    const { data: response } = await api.post<TCreateSupplierStoreResponse>(
      "/suppliers/store",
      data
    );
    return response?.supplier;
  } catch (error) {
    populateError(error, "خطأ فى إنشاء المورد");
  }
};

/** تحديث مورد - PUT /api/v1/suppliers/update/{id} */
export const updateSupplier = async (
  id: number,
  data: TUpdateSupplierRequest
) => {
  try {
    const { data: response } = await api.put<TSupplierResponse>(
      `/suppliers/update/${id}`,
      data
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى تحديث المورد");
  }
};

/** قائمة الموردين (بدون تفاصيل الطلبيات) */
export const getSuppliers = async (page: number, per_page: number) => {
  try {
    const { data: response } = await api.get<TSuppliersListResponse>(
      "/suppliers",
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

/** حذف مورد - DELETE /api/v1/suppliers/delete/{id} */
export const deleteSupplier = async (id: number) => {
  try {
    const { data: response } = await api.delete<TSupplierResponse>(
      `/suppliers/delete/${id}`
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى حذف المورد");
  }
};

/** قائمة طلبيات الموردين - GET /api/v1/supplier-orders */
export const getSupplierOrders = async (page: number, per_page: number) => {
  try {
    const { data: response } = await api.get<TSupplierOrdersListResponse>(
      "/supplier-orders",
      { params: { page, per_page } }
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى جلب طلبيات الموردين");
  }
};

/** إنشاء طلبية مورد - POST /api/v1/supplier-orders/store */
export const createSupplierOrder = async (data: TCreateSupplierOrderRequest) => {
  try {
    const { data: response } = await api.post(
      "/supplier-orders/store",
      data
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى إنشاء طلبية المورد");
  }
};

/** قائمة الموردين للقائمة المنسدلة - من GET /suppliers (صفحة واحدة) */
export const getSuppliersList = async (): Promise<TSupplierResponse[] | undefined> => {
  try {
    const { data: response } = await api.get<TSuppliersListResponse>(
      "/suppliers",
      { params: { page: 1, per_page: 500 } }
    );
    return response?.data ?? [];
  } catch (error) {
    populateError(error, "خطأ فى جلب قائمة الموردين");
  }
};

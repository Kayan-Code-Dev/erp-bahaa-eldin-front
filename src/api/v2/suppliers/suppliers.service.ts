import {
  TCreateSupplierRequest,
  TCreateSupplierMinimalRequest,
  TCreateSupplierOrderRequest,
  TSupplierResponse,
  TUpdateSupplierRequest,
  TUpdateSupplierOrderRequest,
  TSuppliersListResponse,
  TSupplierOrdersListResponse,
} from "./suppliers.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";

/** Response from POST /suppliers/store */
type TCreateSupplierStoreResponse = {
  message?: string;
  supplier: TSupplierResponse;
};

/** Create supplier (name and code only) - POST /api/v1/suppliers/store */
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

/** Create supplier with first order - POST /api/v1/suppliers/store */
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

/** Update supplier - PUT /api/v1/suppliers/update/{id} */
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

/** List suppliers (paginated) - GET /api/v1/suppliers */
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

/** Delete supplier - DELETE /api/v1/suppliers/delete/{id} */
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

/** List supplier orders - GET /api/v1/supplier-orders */
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

/** Supplier orders by supplier_id - GET /api/v1/supplier-orders?supplier_id={id} */
export const getSupplierOrdersBySupplierId = async (
  supplierId: number,
  page: number,
  per_page: number
) => {
  try {
    const { data: response } = await api.get<TSupplierOrdersListResponse>(
      "/supplier-orders",
      { params: { supplier_id: supplierId, page, per_page } }
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى جلب طلبيات المورد");
  }
};

/** Create supplier order - POST /api/v1/supplier-orders/store */
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

/** Update supplier order - PUT /api/v1/supplier-orders/update/{id} */
export const updateSupplierOrder = async (
  id: number,
  data: TUpdateSupplierOrderRequest
) => {
  try {
    const { data: response } = await api.put(
      `/supplier-orders/update/${id}`,
      data
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى تحديث طلبية المورد");
  }
};

/** Suppliers list for dropdown - GET /suppliers (single page) */
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

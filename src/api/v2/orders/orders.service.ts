import { TPaginationResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import {
  TCreateOrderRequest,
  TCreateOrderWithNewClientRequest,
  TOrder,
  TReturnOrderItemRequest,
  TReturnOrderItemsRequest,
  TUpdateOrderRequest,
  TAddPaymentRequest,
} from "./orders.types";

export const createOrder = async (
  data: TCreateOrderRequest | TCreateOrderWithNewClientRequest
) => {
  try {
    const { data: responseData } = await api.post<TOrder>(`/orders`, data);
    return responseData;
  } catch (error: any) {
    populateError(error, "خطأ فى إضافة الطلب");
  }
};

export const getOrders = async (
  page: number,
  per_page: number,
  filters?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    returned?: boolean;
    overdue?: boolean;
    client_id?: string | number;
  },
) => {
  try {
    const params: Record<string, string | number | boolean> = { page, per_page };
    if (filters?.status) params.status = filters.status;
    if (filters?.date_from) params.date_from = filters.date_from;
    if (filters?.date_to) params.date_to = filters.date_to;
    if (filters?.returned === true) params.returned = 1;
    if (filters?.overdue === true) params.overdue = 1;
    if (filters?.client_id !== undefined && filters.client_id !== "" && filters.client_id != null) {
      params.client_id = typeof filters.client_id === "string" ? Number(filters.client_id) : filters.client_id;
    }

    const { data: responseData } = await api.get<TPaginationResponse<TOrder>>(
      `/orders`,
      { params },
    );
    return responseData;
  } catch (error: any) {
    populateError(error, "خطأ فى جلب الطلبات");
  }
};

export const getOrderDetails = async (id: number) => {
  try {
    const { data: responseData } = await api.get<TOrder>(`/orders/${id}`);
    return responseData;
  } catch (error: any) {
    populateError(error, "خطأ فى جلب الطلب");
  }
};

export const deleteOrder = async (id: number) => {
  try {
    await api.delete(`/orders/${id}`);
  } catch (error: any) {
    populateError(error, "خطأ فى حذف الطلب");
  }
};

// deliver, finish, cancel
export type TOrderStatus =
  | "deliver"
  | "finish"
  | "cancel"
  | "paid"
  | "returned"
  | "delivered";

export const updateOrderStatus = async (id: number, status: TOrderStatus) => {
  try {
    await api.post(`/orders/${id}/${status}`);
  } catch (error: any) {
    populateError(error, "خطأ فى تحديث حالة الطلب");
  }
};

/** Update order status via PATCH (more flexible) */
export const updateOrderStatusV2 = async (id: number, status: string) => {
  try {
    const { data: responseData } = await api.patch<TOrder>(
      `/orders/${id}/status`,
      { status },
    );
    return responseData;
  } catch (error: any) {
    populateError(error, "خطأ فى تحديث حالة الطلب");
  }
};

/** Add order payment */
export const addOrderPayment = async (id: number, data: TAddPaymentRequest) => {
  try {
    const { data: responseData } = await api.post<TOrder>(
      `/orders/${id}/payments`,
      data,
    );
    return responseData;
  } catch (error: any) {
    populateError(error, "خطأ فى إضافة الدفعة");
  }
};

/** Update order (full payload) */
export const updateOrder = async (id: number, data: TUpdateOrderRequest) => {
  try {
    const { data: responseData } = await api.put<TOrder>(`/orders/${id}`, data);
    return responseData;
  } catch (error: any) {
    populateError(error, "خطأ فى تحديث الطلب");
  }
};

/** Get order payment receipts */
export const getOrderPayments = async (id: number) => {
  try {
    const { data: responseData } = await api.get<any[]>(
      `/orders/${id}/payments`,
    );
    return responseData;
  } catch (error: any) {
    populateError(error, "خطأ فى جلب الدفعات");
  }
};

/** Update paid amount for order */
export const updateOrderPayment = async (id: number, amount: number) => {
  try {
    const { data: responseData } = await api.patch<TOrder>(
      `/orders/${id}/payment`,
      {
        paid_amount: amount,
      },
    );
    return responseData;
  } catch (error: any) {
    populateError(error, "خطأ فى تحديث المبلغ المدفوع");
  }
};

export const retrunOrderItems = async (
  id: number,
  data: TReturnOrderItemsRequest[],
) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, JSON.stringify(value));
      }
    });
    await api.post(`/orders/${id}/return`, formData);
  } catch (error: any) {
    populateError(error, "خطأ فى إرجاع الملابس");
  }
};

export const returnOrderItem = async (
  order_id: number,
  item_id: number,
  data: TReturnOrderItemRequest,
) => {
  try {
    const formData = new FormData();
    formData.append("entity_type", data.entity_type);
    formData.append("entity_id", data.entity_id.toString());
    formData.append("note", data.note);
    data.photos.forEach((photo, index) => {
      formData.append(`photos[${index}]`, photo);
    });
    await api.post(`/orders/${order_id}/items/${item_id}/return`, formData);
  } catch (error: any) {
    populateError(error, "خطأ فى إرجاع الملابس");
  }
};

export const exportOrdersToCSV = async () => {
  try {
    const { data } = await api.get(`/orders/export`, { responseType: "blob" });
    return data;
  } catch (error) {
    populateError(error, "خطأ فى تصدير الطلبات");
  }
};

/** Export deliveries to CSV */
export const exportDeliveriesToCSV = async (filters?: {
  date_from?: string;
  date_to?: string;
}) => {
  try {
    const params: any = {};
    if (filters?.date_from) params.date_from = filters.date_from;
    if (filters?.date_to) params.date_to = filters.date_to;

    const { data } = await api.get(`/orders/deliveries/export`, {
      params,
      responseType: "blob",
    });
    return data;
  } catch (error) {
    populateError(error, "خطأ فى تصدير التسليمات");
  }
};

/** Mark order as delivered */
export const markAsDelivered = async (id: number) => {
  try {
    const { data: responseData } = await api.patch<TOrder>(
      `/orders/${id}/deliver`,
    );
    return responseData;
  } catch (error: any) {
    populateError(error, "خطأ فى تسليم الطلب");
  }
};

/** Mark order as cancelled */
export const markAsCancelled = async (id: number) => {
  try {
    const { data: responseData } = await api.patch<TOrder>(
      `/orders/${id}/cancel`,
    );
    return responseData;
  } catch (error: any) {
    populateError(error, "خطأ فى إلغاء الطلب");
  }
};

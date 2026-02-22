import { TPaginationResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import {
  TCreateOrderRequest,
  TCreateOrderWithNewClientRequest,
  TOrder,
  TReturnOrderItemRequest,
  TReturnOrderFullRequest,
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
    /** Filter by invoice number */
    order_id?: string | number;
    /** General date filter (if available in API) */
    date_from?: string;
    date_to?: string;
    returned?: boolean;
    overdue?: boolean;
    delayed?: boolean;
    /** Filter by client */
    client_id?: string | number;
    /** Filter by item name */
    cloth_name?: string;
    /** Filter by item/cloth type code */
    cloth_code?: string;
    /** Filter by invoice creation date */
    invoice_date_from?: string;
    invoice_date_to?: string;
    /** Filter by rental date (visit_datetime) */
    visit_date_from?: string;
    visit_date_to?: string;
    /** Filter by delivery date (delivery_date) */
    delivery_date_from?: string;
    delivery_date_to?: string;
    /** Filter by return/occasion date (occasion_datetime) */
    return_date_from?: string;
    return_date_to?: string;
    /** Filter by employee (who created the order) */
    employee_id?: string | number;
  },
) => {
  try {
    const params: Record<string, string | number | boolean> = { page, per_page };
    if (filters?.status) params.status = filters.status;

    // General date filters (already existing)
    if (filters?.date_from) params.date_from = filters.date_from;
    if (filters?.date_to) params.date_to = filters.date_to;

    if (filters?.returned === true) params.returned = 1;
    if (filters?.overdue === true) params.overdue = 1;
    if (filters?.delayed === true) params.delayed = true;
    if (filters?.delayed === false) params.delayed = false;

    // Invoice number (sent as both id and order_id to match backend)
    if (filters?.order_id !== undefined && filters.order_id !== "" && filters.order_id != null) {
      const normalizedOrderId =
        typeof filters.order_id === "string" ? Number(filters.order_id) : filters.order_id;
      if (Number.isFinite(normalizedOrderId as number)) {
        params.id = normalizedOrderId;
        params.order_id = normalizedOrderId;
      }
    }

    // Client
    if (filters?.client_id !== undefined && filters.client_id !== "" && filters.client_id != null) {
      params.client_id = typeof filters.client_id === "string" ? Number(filters.client_id) : filters.client_id;
    }

    // Item name
    if (filters?.cloth_name && filters.cloth_name.trim() !== "") {
      params.cloth_name = filters.cloth_name.trim();
    }

    // Item/cloth type code
    if (filters?.cloth_code && filters.cloth_code.trim() !== "") {
      params.cloth_code = filters.cloth_code.trim();
    }

    // Invoice dates -> sent as date_from / date_to as per API
    if (filters?.invoice_date_from) params.date_from = filters.invoice_date_from;
    if (filters?.invoice_date_to) params.date_to = filters.invoice_date_to;

    // Rental dates
    if (filters?.visit_date_from) params.visit_date_from = filters.visit_date_from;
    if (filters?.visit_date_to) params.visit_date_to = filters.visit_date_to;

    // Delivery dates -> sent as delivery_from / delivery_to as per API
    if (filters?.delivery_date_from) params.delivery_from = filters.delivery_date_from;
    if (filters?.delivery_date_to) params.delivery_to = filters.delivery_date_to;

    // Return/Occasion dates
    if (filters?.return_date_from) params.return_date_from = filters.return_date_from;
    if (filters?.return_date_to) params.return_date_to = filters.return_date_to;

    // Employee (who created the order)
    if (filters?.employee_id !== undefined && filters.employee_id !== "" && filters.employee_id != null) {
      params.employee_id = typeof filters.employee_id === "string" ? Number(filters.employee_id) : filters.employee_id;
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

/**
 * إرجاع الطلب بالكامل: POST /orders/:id/return
 * Body: { items: [ { cloth_id, status, notes?, photo? } ] }
 */
export const returnOrderFull = async (
  id: number,
  data: TReturnOrderFullRequest,
) => {
  try {
    const normalizedItems = data.items
      .map((item) => ({
        cloth_id: Number(item.cloth_id),
        status: item.status ?? "ready_for_rent",
        notes: item.notes != null && item.notes !== "" ? item.notes : undefined,
        photo: item.photo,
      }))
      .filter((item) => Number.isFinite(item.cloth_id) && item.status);

    const hasPhotos = normalizedItems.some(
      (item) => item.photo && item.photo.length > 0
    );

    if (!hasPhotos) {
      const body = {
        items: normalizedItems.map(({ cloth_id, status, notes }) => ({
          cloth_id,
          status,
          ...(notes != null && { notes }),
        })),
      };
      const { data: responseData } = await api.post<TOrder>(
        `/orders/${id}/return`,
        body
      );
      return responseData;
    }

    const formData = new FormData();
    normalizedItems.forEach((item, i) => {
      formData.append(`items[${i}][cloth_id]`, String(item.cloth_id));
      formData.append(`items[${i}][status]`, item.status);
      if (item.notes != null) {
        formData.append(`items[${i}][notes]`, item.notes);
      }
    });
    normalizedItems.forEach((item, i) => {
      if (item.photo?.length) {
        item.photo.forEach((file) => {
          formData.append(`items[${i}][photo][]`, file);
        });
      }
    });

    const { data: responseData } = await api.post<TOrder>(
      `/orders/${id}/return`,
      formData
    );
    return responseData;
  } catch (error: any) {
    populateError(error, "خطأ فى إرجاع الطلب");
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
    populateError(error, "خطأ فى إرجاع المنتجات");
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

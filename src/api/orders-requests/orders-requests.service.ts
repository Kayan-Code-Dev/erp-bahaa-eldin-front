import { TPaginationResponse, TSingleResponse } from "../api-common.types";
import { api } from "../api-contants";
import { populateError } from "../api.utils";
import { OrderTableElement, TOrder, TOrderSchema, TOrderStatus, TOrderType } from "./orders-requests.types";

export const getOrders = async (page: number, type: TOrderType) => {
  try {
    const { data } = await api.get<{ data: TPaginationResponse<OrderTableElement> }>(
      `/branches/orders/get/${type}`,
      { params: { page } }
    );
    data.data.total_pages = Math.ceil(data.data.total / 10);
    return data.data;
  } catch (error) {
    populateError(error, "خطأ فى جلب الطلبات");
  }
};

export const getOrderDetails = async (id: string) => {
  try {
    const { data } = await api.get<TSingleResponse<TOrder>>(
      `/branches/orders/${id}/show`);
    return data.data;
  } catch (error) {
    populateError(error, "خطأ فى جلب الطلب");
  }
};

export const createOrder = async (data: TOrderSchema, order_type: TOrderType) => {
  try {
    await api.post(`/branches/orders/create/${order_type}`, data);
  } catch (error) {
    populateError(error, "خطأ فى إضافة الطلب");
  }
};

export const updateStatus = async (data: { status: TOrderStatus }, order_id: string) => {
  try {
    await api.post(`/branches/orders/${order_id}/status`, data);
  } catch (error) {
    populateError(error, "خطأ فى تحديث حالة الطلب");
  }
};
import { TPaginationResponse } from "../api-common.types";
import { api } from "../api-contants";
import { populateError } from "../api.utils";
import { TFactoryOrder } from "./factories.types";

export const getFactoryOrders = async (page: number) => {
  try {
    const { data } = await api.get<{
      data: TPaginationResponse<TFactoryOrder>;
    }>(`/employees/factories/orders`, {
      params: {
        page,
      },
    });
    data.data.total_pages = Math.ceil(data.data.total / 10);
    return data.data;
  } catch (error) {
    populateError(error, "خطأ في جلب الطلبات");
  }
};

export const getFactoryOrder = async (uuid: string) => {
  try {
    const { data } = await api.get<{
      data: TFactoryOrder;
    }>(`/employees/factories/orders_details/${uuid}`);
    return data.data;
  } catch (error) {
    populateError(error, "خطأ في جلب الطلب");
  }
};

export const acceptFactoryOrder = async (uuid: string) => {
  try {
    const { data } = await api.get<{
      data: TFactoryOrder;
    }>(`/employees/factories/orders/${uuid}/accept`);
    return data.data;
  } catch (error) {
    populateError(error, "خطأ في قبول الطلب");
  }
};

export type TStartFactoryOrderRequest = {
  expected_finish_date: string;
  production_line: string;
  notes: string;
};

export const startFactoryOrder = async (
  uuid: string,
  data: TStartFactoryOrderRequest
) => {
  try {
    await api.post(`/employees/factories/start_orders/${uuid}`, data);
  } catch (error) {
    populateError(error, "خطأ في بدء الطلب");
  }
};

export type TUpdateFactoryOrderRequest = {
  status: "in_progress" | "paused" | "completed" | "canceled";
  production_line: string;
  quantity: number;
  notes: string;
};

export const updateFactoryOrder = async (
  uuid: string,
  data: TUpdateFactoryOrderRequest
) => {
  try {
    await api.post(`/employees/factories/update_status_orders/${uuid}`, data);
  } catch (error) {
    populateError(error, "خطأ في تحديث الطلب");
  }
};

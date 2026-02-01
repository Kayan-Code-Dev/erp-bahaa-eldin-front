import { TPaginationResponse, TSingleResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import { OrderTableElement, TOrder, TOrderSchema, TOrderStatus, TOrderType } from "../orders-requests.types";
import { populateError } from "@/api/api.utils";


export const getEmployeesOrders = async (page: number, type: "purchase" | "rent" | "tailoring") => {
    try {
        const { data } = await api.get<{ data: TPaginationResponse<OrderTableElement> }>(
            `/employees/orders/get/${type}`,
            { params: { page } }
        );
        data.data.total_pages = Math.ceil(data.data.total / 10);
        return data.data;
    } catch (error) {
        populateError(error, "خطأ فى جلب الطلبات");
    }
};

export const getEmployeesOrderDetails = async (id: string) => {
    try {
        const { data } = await api.get<TSingleResponse<TOrder>>(
            `/employees/orders/${id}/show`);
        return data.data;
    } catch (error) {
        populateError(error, "خطأ فى جلب الطلب");
    }
};

export const createEmployeesOrder = async (data: TOrderSchema, order_type: TOrderType) => {
    try {
        await api.post(`/employees/orders/${order_type}`, data);
    } catch (error) {
        populateError(error, "خطأ فى إضافة الطلب");
    }
};

export const updateEmployeesStatus = async (data: { status: TOrderStatus }, order_id: string) => {
    try {
        await api.post(`/employees/orders/${order_id}/status`, data);
    } catch (error) {
        populateError(error, "خطأ فى تحديث حالة الطلب");
    }
};
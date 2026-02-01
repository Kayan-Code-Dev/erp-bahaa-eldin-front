import { TPaginationResponse, TSingleResponse } from "../api-common.types";
import { api } from "../api-contants";
import { populateError } from "../api.utils";
import { TInvoiceSchema, TWorkshop, TWorkshopTableElement } from "./workshop.types";

export const getWorkshops = async (page: number) => {
    try {
        const { data } = await api.get<{ data: TPaginationResponse<TWorkshopTableElement> }>(
            `/employees/workshops`,
            { params: { page } }
        );
        data.data.total_pages = Math.ceil(data.data.total / 10);
        return data.data;
    } catch (error) {
        populateError(error, "خطأ فى جلب الورش");
    }
};

export const getWorkshopDetails = async (id: string) => {
    try {
        const { data } = await api.get<TSingleResponse<TWorkshop>>(
            `/employees/workshops/index_details/${id}`);
        return data.data;
    } catch (error) {
        populateError(error, "خطأ فى جلب الطلب");
    }
};

export const createInvoice = async (data: TInvoiceSchema, order_id: string) => {
    try {
        await api.post(`/employees/workshops/create_invoice/${order_id}`, data);
    } catch (error) {
        populateError(error, "خطأ فى إضافة الطلب");
    }
};

export const acceptWorkshopOrder = async (order_id: string) => {
    try {
        await api.post(`/employees/workshops/accept_order/${order_id}`);
    } catch (error) {
        populateError(error, "خطأ فى قبول الطلب");
    }
};
import { z } from "zod";
import { TMeasurement, TOrderStatus, TOrderType } from "../orders-requests/orders-requests.types"

export type TWorkshopTableElement = {
    uuid: string;
    order_number: string;
    client_name: string;
    status: TOrderStatus;
    order_type: TOrderType;
    model_name?: string;
    rental_duration: number;
    delivery_date: string;
    source: string | null;
    notes: string;
    created_at: string;
}

export type TWorkshop = {
    uuid: string;
    client_name: string;
    delivery_date: string;
    phone_primary: string;
    event_date: string;
    phone_secondary: string | null;
    address: string;
    category_name: string;
    category_id: number;
    subCategory_name: string;
    subCategory_id: number;
    notes: string;
    order_status: TOrderStatus;
    order_type?: TOrderType;
    measurements: TMeasurement
    employee_name: string;
    employee_type: string;
    source?: string | null;
    message?: string;
    rental_duration?: string;
    model_name?: string;
    order_number?: string;
    visit_date?: string;
}


export const invoiceSchema = z.object({
    received_by: z.string().min(1, "اسم المستلم مطلوب"),
    received_at_date: z.string().min(1, "تاريخ الاستلام مطلوب"),
    received_at_time: z.string().min(1, "وقت الاستلام مطلوب"),
    rental_start_date: z.string().min(1, "تاريخ بداية الإيجار مطلوب"),
    rental_end_date: z.string().min(1, "تاريخ نهاية الإيجار مطلوب"),
    notes: z.string().optional(),
}).transform((data) => ({
    ...data,
    received_at: `${data.received_at_date} ${data.received_at_time}`,
}));

export type TInvoiceSchema = z.infer<typeof invoiceSchema>;
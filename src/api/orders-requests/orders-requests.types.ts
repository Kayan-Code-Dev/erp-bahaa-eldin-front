import { z } from "zod";
// New
export type OrderTableElement = {
  uuid: string,
  order_number: string,
  client_name: string,
  order_type: TOrderType,
  status: TOrderStatus,
  created_at: string,
  delivery_date: string
};

export type TMeasurement = {
  chest: string;
  waist: string;
  sleeve: string;
};

export type TOrderStatus = "pending" | "done" | "processing" | "canceled"; // you can adjust as needed
export type TOrderType = "rent" | "purchase" | "tailoring"; // you can adjust as needed

export type TOrder = {
  uuid: string;
  client_name: string;
  phone_primary: string;
  phone_secondary: string;
  address: string;
  visit_date: string; // e.g. "02-11-2025 15:00"
  source: string | null;
  order_type: TOrderType; // e.g. tailoring
  order_number: string;
  model_name?: string;
  measurements: TMeasurement;
  status: TOrderStatus;
  created_at: string; // e.g. "02-11-2025"
  delivery_date: string; // e.g. "02-11-2025"
  notes?: string;
  quantity?: string;
  event_date?: string;
  message?: string;
  sub_category?: string;
  rental_duration?: string;
  category?: string;
};

/* ------------------------------- SCHEMAS ------------------------------- */
export const measurementsSchema = z.object({
  chest: z.number({ required_error: "القياسات مطلوبة" }),
  waist: z.number({ required_error: "القياسات مطلوبة" }),
  sleeve: z.number({ required_error: "القياسات مطلوبة" }),
});

export const customizationsSchema = z.object({
  size: z.string({ required_error: "الحقل مطلوب" }).min(1, { message: "المقاس مطلوب" }),
  color: z.string({ required_error: "الحقل مطلوب" }).min(1, { message: "اللون مطلوب" }),
});

const baseOrderSchema = z.object({
  client_name: z.string({ required_error: "الحقل مطلوب" }).min(1, "اسم العميل مطلوب"),
  client_phone_primary: z.string().min(1, "رقم الجوال الأساسي مطلوب"),
  client_phone_secondary: z.string().optional(),
  client_address: z.string({ required_error: "الحقل مطلوب" }).min(1, "العنوان مطلوب"),
  visit_date_day: z.string({ required_error: "الحقل مطلوب" }).min(1),
  visit_date_time: z.string({ required_error: "الحقل مطلوب" }).min(1),
  event_date_day: z.string({ required_error: "الحقل مطلوب" }).min(1),
  event_date_time: z.string({ required_error: "الحقل مطلوب" }).min(1),
  source: z.string().optional(),
  category_id: z.string({ required_error: "الحقل مطلوب" }),
  sub_category_id: z.string({ required_error: "الحقل مطلوب" }),
  model_name: z.string().optional(),
  delivery_date: z.string({ required_error: "الحقل مطلوب" }).min(1, "تاريخ التسليم مطلوب"),
  notes: z.string().optional(),
});

// ------------------- tailoring -------------------
const tailoringSchema = baseOrderSchema.extend({
  order_type: z.literal("tailoring"),
  fabric_preference: z.string().min(1, "نوع القماش مطلوب"),
  quantity: z.number({ required_error: "الحقل مطلوب" }).min(1, "الكمية مطلوبة"),
  measurements: measurementsSchema,
});

// ------------------- rent -------------------
const rentSchema = baseOrderSchema.extend({
  order_type: z.literal("rent"),
  rental_duration: z.number({ required_error: "الحقل مطلوب" }).min(1, "مدة الإيجار مطلوبة"),
  measurements: measurementsSchema,
});

// ------------------- purchase -------------------
const purchaseSchema = baseOrderSchema.extend({
  order_type: z.literal("purchase"),
  quantity: z.number({ required_error: "الحقل مطلوب" }).min(1, "الكمية مطلوبة"),
  customizations: customizationsSchema,
});

// ------------------- unified schema -------------------
export const orderSchema = z.discriminatedUnion("order_type", [
  tailoringSchema,
  rentSchema,
  purchaseSchema,
]);

export type TOrderSchema = z.infer<typeof orderSchema>;
export type TOrderSchemaType = TOrderSchema["order_type"];



export const getOrderTypeDisplay = (type: TOrderType) => {
  if (type === "rent") return "إيجار";
  if (type === "purchase") return "شراء";
  if (type === "tailoring") return "تفصيل"; // Or tailoring/build
  return type;
};

export const getOrderStatusDisplay = (status: TOrderStatus) => {
  if (status === "pending") return "قيد الانتظار";
  if (status === "processing") return "قيد المعالجة";
  if (status === "done") return "مكتمل";
  if (status === "canceled") return "ملغي";
  return status;
};
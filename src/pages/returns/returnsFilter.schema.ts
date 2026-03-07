import * as z from "zod";

/** Zod schema for returns list filter form */
export const returnsFilterSchema = z.object({
  order_id: z.string().optional(),
  client_id: z.string().optional(),
  employee_id: z.string().optional(),
  cloth_name: z.string().optional(),
  cloth_code: z.string().optional(),
  visit_date_from: z.string().optional(),
  visit_date_to: z.string().optional(),
  delivery_date_from: z.string().optional(),
  delivery_date_to: z.string().optional(),
  return_date_from: z.string().optional(),
  return_date_to: z.string().optional(),
});

export type ReturnsFilterFormValues = z.infer<typeof returnsFilterSchema>;

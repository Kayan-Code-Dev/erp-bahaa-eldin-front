import * as z from "zod";

/** Zod schema for deliveries list filter form */
export const deliveriesFilterSchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  client_id: z.string().optional(),
});

export type DeliveriesFilterFormValues = z.infer<typeof deliveriesFilterSchema>;

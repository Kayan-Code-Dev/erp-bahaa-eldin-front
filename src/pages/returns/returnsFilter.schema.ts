import * as z from "zod";

/** Zod schema for returns list filter form */
export const returnsFilterSchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  client_id: z.string().optional(),
});

export type ReturnsFilterFormValues = z.infer<typeof returnsFilterSchema>;

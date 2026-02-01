import * as z from "zod";

/** Zod schema for overdue returns list filter form */
export const overduereturnsFilterSchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  client_id: z.string().optional(),
});

export type OverduereturnsFilterFormValues = z.infer<
  typeof overduereturnsFilterSchema
>;

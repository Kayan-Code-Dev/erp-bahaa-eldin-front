import * as z from "zod";

/** Zod schema for overdue returns list filter form (no date filter) */
export const overduereturnsFilterSchema = z.object({
  client_id: z.string().optional(),
});

export type OverduereturnsFilterFormValues = z.infer<
  typeof overduereturnsFilterSchema
>;

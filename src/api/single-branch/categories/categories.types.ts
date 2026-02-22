import z from "zod";

export type TBranchCategory = {
    id?: number;
    name: string;
    description: string;
    active?: boolean | null;
    created_at?: string;
    branch_name?: string;
}

export const branchCategorySchema = z.object({
    name: z.string().min(2, { message: "الاسم مطلوب" }),
    description: z.string().min(10, { message: " وصف قسم المنتجات مطلوب" }),
    active: z.boolean().nullable(),
});
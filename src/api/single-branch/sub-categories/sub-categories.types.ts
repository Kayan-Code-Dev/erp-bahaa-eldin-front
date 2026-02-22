import z from "zod";

export type TBranchSubCategory = {
    id?: number;
    name: string;
    category_name?: string;
    category_id?: string;
    description: string;
    active?: boolean | null;
    created_at?: string;
    branch_name?: string;
}

export const branchSubCategorySchema = z.object({
    name: z.string().min(2, { message: "الاسم مطلوب" }),
    category_id: z.string().min(1, { message: "قسم المنتجات مطلوب" }),
    description: z.string().min(10, { message: " وصف قسم المنتجات مطلوب" }),
    active: z.boolean().nullable(),
});
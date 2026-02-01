import z from "zod";

export type TBranchDepartment = {
    id?: number;
    name: string;
    code: string;
    description: string;
    active?: boolean | null;
    created_at?: string
}

export const branchDepartmentSchema = z.object({
    name: z.string().min(2, { message: "الاسم مطلوب" }),
    code: z.string().min(2, { message: "الكود مطلوب" }),
    description: z.string().min(10, { message: " وصف القسم مطلوب" }),
    active: z.boolean().nullable(),
});
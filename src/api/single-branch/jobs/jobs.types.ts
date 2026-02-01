import z from "zod";

export type TBranchJob = {
    id?: number;
    name: string;
    code: string;
    department?: string;
    department_id?: string;
    description: string;
    active?: boolean | null;
    created_at?: string
}

export const branchJobSchema = z.object({
    name: z.string().min(2, { message: "الاسم مطلوب" }),
    code: z.string().min(2, { message: "الكود مطلوب" }),
    description: z.string().min(10, { message: " وصف الوظيفة مطلوب" }),
    department_id: z.string().min(1, { message: "الوظيفة مطلوب" }),
    active: z.boolean().nullable(),
});
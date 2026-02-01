import z from "zod";

export type TBranchesManager = {
    uuid: string;
    branch_name: string;
    name?: string;
    email: string;
    phone: string;
    location: string;
    latitude?: string;
    longitude?: string;
    status: "active" | "inactive" | string;
    blocked: boolean;
    created_at: string
}

export const branchesManagerFormSchema = z.object({
    name: z.string().min(2, { message: "اسم الفرع مطلوب" }),
    email: z.string().email({ message: "بريد إلكتروني غير صالح" }),
    phone: z.string().min(8, { message: "رقم الهاتف مطلوب" }),
    location: z.string().min(2, { message: "الموقع مطلوب" }),
});
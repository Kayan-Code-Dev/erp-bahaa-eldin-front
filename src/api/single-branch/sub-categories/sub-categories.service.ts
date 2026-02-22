import { TPaginationResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import { TBranchSubCategory } from "./sub-categories.types";

export const getBranchSubCategories = async (page: number) => {
    try {
        const { data } = await api.get<{ data: TPaginationResponse<TBranchSubCategory> }>(
            `/branches/sub_categories`,
            { params: { page } }
        );
        data.data.total_pages = Math.ceil(data.data.total / 10);
        return data.data;
    } catch (error) {
        populateError(error, "خطأ فى جلب أقسام المنتجات الفرعية");
    }
};

export const createBranchSubCategory = async (data: TBranchSubCategory) => {
    try {
        await api.post(`/branches/sub_categories`, data);
    } catch (error) {
        populateError(error, "خطأ فى إضافة قسم المنتجات الفرعي");
    }
};

export const updateBranchSubCategory = async (id: string, data: TBranchSubCategory & { _method: "PUT" }) => {
    try {
        await api.post(`/branches/sub_categories/${id}`, data);
    } catch (error) {
        populateError(error, "خطأ فى تعديل قسم المنتجات الفرعي");
    }
};

export const deleteBranchSubCategory = async (id: string) => {
    try {
        await api.delete(`/branches/sub_categories/${id}`);
    } catch (error) {
        populateError(error, "خطأ فى حذف قسم المنتجات الفرعي");
    }
};
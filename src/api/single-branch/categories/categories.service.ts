import { TPaginationResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import { TBranchCategory } from "./categories.types";

export const getBranchCategories = async (page: number) => {
    try {
        const { data } = await api.get<{ data: TPaginationResponse<TBranchCategory> }>(
            `/branches/categories`,
            { params: { page } }
        );
        data.data.total_pages = Math.ceil(data.data.total / 10);
        return data.data;
    } catch (error) {
        populateError(error, "خطأ فى جلب أقسام المنتجات");
    }
};

export const createBranchCategory = async (data: TBranchCategory) => {
    try {
        await api.post(`/branches/categories`, data);
    } catch (error) {
        populateError(error, "خطأ فى إضافة قسم المنتجات");
    }
};

export const updateBranchCategory = async (id: string, data: TBranchCategory & { _method: "PUT" }) => {
    try {
        await api.post(`/branches/categories/${id}`, data);
    } catch (error) {
        populateError(error, "خطأ فى تعديل قسم المنتجات");
    }
};

export const deleteBranchCategory = async (id: string) => {
    try {
        await api.delete(`/branches/categories/${id}`);
    } catch (error) {
        populateError(error, "خطأ فى حذف قسم المنتجات");
    }
};
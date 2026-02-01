import { TPaginationResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import { TBranchDepartment } from "./departments.types";

export const getBranchDepartments = async (page: number) => {
    try {
        const { data } = await api.get<{ data: TPaginationResponse<TBranchDepartment> }>(
            `/branches/departments`,
            { params: { page } }
        );
        data.data.total_pages = Math.ceil(data.data.total / 10);
        return data.data;
    } catch (error) {
        populateError(error, "خطأ فى جلب الموظفين");
    }
};

export const createBranchDepartment = async (data: TBranchDepartment) => {
    try {
        await api.post(`/branches/departments`, data);
    } catch (error) {
        populateError(error, "خطأ فى إضافة الموظف");
    }
};

export const updateBranchDepartment = async (id: string, data: TBranchDepartment & { _method: "PUT" }) => {
    try {
        await api.post(`/branches/departments/${id}`, data);
    } catch (error) {
        populateError(error, "خطأ فى تعديل الموظف");
    }
};

export const deleteBranchDepartment = async (id: string) => {
    try {
        await api.delete(`/branches/departments/${id}`);
    } catch (error) {
        populateError(error, "خطأ فى حذف الموظف");
    }
};
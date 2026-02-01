import { TPaginationResponse, TSingleResponse } from "@/api/api-common.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import { TBranchEmployee } from "@/api/branches-manager/employees/employees.types";

export const getBranchEmployees = async (page: number) => {
    try {
        const { data } = await api.get<{ data: TPaginationResponse<TBranchEmployee> }>(
            `/branches/employees/get_my_employees`,
            { params: { page } }
        );
        data.data.total_pages = Math.ceil(data.data.total / 10);
        return data.data;
    } catch (error) {
        populateError(error, "خطأ فى جلب الموظفين");
    }
};

export const getSingleBranchEmployee = async (id: string | undefined) => {
    try {
        const { data } = await api.get<TSingleResponse<TBranchEmployee>>(
            `/branches/employees/get_employee/${id}`
        );
        return data.data;
    } catch (error) {
        populateError(error, "خطأ فى جلب الموظفين");
    }
};

export const createBranchEmployee = async (data: FormData) => {
    try {
        await api.post(`/branches/employees/create_my_employee`, data);
    } catch (error) {
        populateError(error, "خطأ فى إضافة الموظف");
    }
};

export const updateBranchEmployee = async (id: string, data: FormData) => {
    try {
        await api.post(`/branches/employees/update_my_employees/${id}`, data);
    } catch (error) {
        populateError(error, "خطأ فى تعديل الموظف");
    }
};

export const deleteBranchEmployee = async (id: string) => {
    try {
        await api.delete(`/branches/employees/delete_my_employee/${id}`);
    } catch (error) {
        populateError(error, "خطأ فى حذف الموظف");
    }
};

export const blockBranchEmployee = async (id: string) => {
    try {
        await api.post(`/branches/employees/block_my_employees/${id}`);
    } catch (error) {
        populateError(error, "خطأ في حظر الموظف");
    }
};

export const getDeletedBranchEmployees = async (page: number) => {
    try {
        const { data } = await api.get<{
            data: TPaginationResponse<TBranchEmployee>;
        }>(`/branches/employees/get_deleted_my_employees`, {
            params: { page: page },
        });
        data.data.total_pages = Math.ceil(data.data.total / 10);
        return data.data;
    } catch (error) {
        populateError(error, "خطأ في جلب الموظفين المحذوفين");
    }
};

export const restoreDeletedBranchEmployee = async (id: string) => {
    try {
        await api.get(`/branches/employees/restore_my_employees/${id}`);
    } catch (error) {
        populateError(error, "خطأ في استعادة الموظف المحذوف");
    }
};

export const forceDeleteBranchEmployee = async (id: string) => {
    try {
        await api.delete(`/branches/employees/force_delete_my_employees/${id}`);
    } catch (error) {
        populateError(error, "خطأ في حذف الموظف");
    }
};

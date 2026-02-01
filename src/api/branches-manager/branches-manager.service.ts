import { TPaginationResponse } from "../api-common.types";
import { api } from "../api-contants";
import { populateError } from "../api.utils";
import { TBranchesManager } from "./branches-manager.types";

export const getBranchesManager = async (page: number) => {
    try {
        const { data } = await api.get<{ data: TPaginationResponse<TBranchesManager> }>(
            `/branch_managers/get_my_branches`,
            { params: { page } }
        );
        data.data.total_pages = Math.ceil(data.data.total / 10);
        return data.data;
    } catch (error) {
        populateError(error, "خطأ فى جلب الفروع");
    }
};

export const getDeletedBranchesManager = async (page: number) => {
    try {
        const { data } = await api.get<{ data: TPaginationResponse<TBranchesManager> }>(
            `/branch_managers/get_deleted_my_branches`,
            { params: { page } }
        );
        data.data.total_pages = Math.ceil(data.data.total / 10);
        return data.data;
    } catch (error) {
        populateError(error, "خطأ فى جلب الفروع");
    }
};

export const createBranchesManager = async (data: FormData) => {
    try {
        await api.post(`/branch_managers/create_branches`, data);
    } catch (error) {
        populateError(error, "خطأ فى إضافة الفرع");
    }
};

export const updateBranchesManager = async (id: string, data: FormData) => {
    try {
        await api.post(`/branch_managers/update_branches/${id}`, data);
    } catch (error) {
        populateError(error, "خطأ فى تعديل الفرع");
    }
};

export const deleteBranchesManager = async (id: string) => {
    try {
        await api.delete(`/branch_managers/delete_branches/${id}`);
    } catch (error) {
        populateError(error, "خطأ فى حذف الفرع");
    }
};

export const forceDeleteBranchesManager = async (id: string) => {
    try {
        await api.delete(`/branch_managers/force_delete_my_branches/${id}`);
    } catch (error) {
        populateError(error, "خطأ فى حذف الفرع");
    }
};

export const restoreBranchesManager = async (id: string) => {
    try {
        const response = await api.get(`/branch_managers/restore_my_branches/${id}`);

        return response.data
    } catch (error) {
        populateError(error, "خطأ فى استعادة الفرع");
    }
};


export const blockBranchesManager = async (id: string) => {
    try {
        await api.post(`/branch_managers/block_my_branches/${id}`);
    } catch (error) {
        populateError(error, "خطأ في حظر الفرع");
    }
};
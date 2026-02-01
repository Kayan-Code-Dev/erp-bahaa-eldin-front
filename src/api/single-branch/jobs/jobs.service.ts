import { TPaginationResponse } from "@/api/api-common.types";
import { TBranchJob } from "./jobs.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";

export const getBranchJobs = async (page: number) => {
    try {
        const { data } = await api.get<{ data: TPaginationResponse<TBranchJob> }>(
            `/branches/jobs`,
            { params: { page } }
        );
        data.data.total_pages = Math.ceil(data.data.total / 10);
        return data.data;
    } catch (error) {
        populateError(error, "خطأ فى جلب الوظائف");
    }
};

export const createBranchJob = async (data: TBranchJob) => {
    try {
        await api.post(`/branches/jobs`, data);
    } catch (error) {
        populateError(error, "خطأ فى إضافة الوظيفة");
    }
};

export const updateBranchJob = async (id: string, data: TBranchJob & { _method: "PUT" }) => {
    try {
        await api.post(`/branches/jobs/${id}`, data);
    } catch (error) {
        populateError(error, "خطأ فى تعديل الوظيفة");
    }
};

export const deleteBranchJob = async (id: string) => {
    try {
        await api.delete(`/branches/jobs/${id}`);
    } catch (error) {
        populateError(error, "خطأ فى حذف الوظيفة");
    }
};
import { api } from "@/api/api-contants";
import {
  TCreateBranchRequest,
  TBranchResponse,
  TUpdateBranchRequest,
} from "./branches.types";
import { populateError } from "@/api/api.utils";
import { TPaginationResponse } from "@/api/api-common.types";

export const createBranch = async (data: TCreateBranchRequest) => {
  try {
    const { data: response } = await api.post<TBranchResponse>(
      "/branches",
      data
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى ارسال الطلب ");
  }
};

export const updateBranch = async (id: number, data: TUpdateBranchRequest) => {
  try {
    const { data: response } = await api.put<TBranchResponse>(
      `/branches/${id}`,
      data
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى تحديث الفرع");
  }
};

export const getBranches = async (page: number, per_page: number) => {
  try {
    const { data: response } = await api.get<
      TPaginationResponse<TBranchResponse>
    >("/branches", {
      params: {
        page,
        per_page,
      },
    });
    return response;
  } catch (error) {
    populateError(error, "خطأ فى احضار الفروع");
  }
};

export const getBranch = async (id: number) => {
  try {
    const { data: response } = await api.get<TBranchResponse>(
      `/branches/${id}`
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى احضار الفرع");
  }
};

export const deleteBranch = async (id: number) => {
  try {
    const { data: response } = await api.delete<TBranchResponse>(
      `/branches/${id}`
    );
    return response;
  } catch (error) {
    populateError(error, "خطأ فى حذف الفرع");
  }
};

// download csv file of branches
export const exportBranchesToCSV = async () => {
  try {
    const { data } = await api.get(`/branches/export`, {
      responseType: "blob",
    });
    return data;
  } catch (error) {
    populateError(error, "خطأ فى تصدير الفروع");
  }
};

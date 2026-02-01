import {
  TCachboxDailySummary,
  TCachboxRecalculateResponse,
  TCashboxesParams,
  TUpdateCashboxRequest,
} from "./cashboxes.types";
import { api } from "@/api/api-contants";
import { populateError } from "@/api/api.utils";
import { TPaginationResponse } from "@/api/api-common.types";
import { TCashbox } from "./cashboxes.types";
import { TBranchResponse } from "../branches/branches.types";

export const getCashboxes = async (params: TCashboxesParams) => {
  try {
    const { data } = await api.get<TPaginationResponse<TCashbox>>(
      "/cashboxes",
      { params }
    );
    return data;
  } catch (error) {
    populateError(error, "خطأ فى جلب الصناديق");
  }
};

export const getCashbox = async (id: number) => {
  try {
    const { data } = await api.get<TCashbox>(`/cashboxes/${id}`);
    return data;
  } catch (error) {
    populateError(error, "خطأ فى جلب الصندوق");
  }
};

export const updateCashbox = async (
  id: number,
  data: TUpdateCashboxRequest
) => {
  try {
    await api.put<TCashbox>(`/cashboxes/${id}`, data);
  } catch (error) {
    populateError(error, "خطأ فى تحديث الصندوق");
  }
};

export const getCashboxDailySummary = async (id: number, date: string) => {
  try {
    const { data } = await api.get<TCachboxDailySummary>(
      `/cashboxes/${id}/daily-summary`,
      {
        params: {
          date,
        },
      }
    );
    return data;
  } catch (error) {
    populateError(error, "خطأ فى جلب الملخص اليومي للصندوق");
  }
};

export const recalculateCashbox = async (id: number) => {
  try {
    const { data } = await api.post<TCachboxRecalculateResponse>(
      `/cashboxes/${id}/recalculate`
    );
    return data;
  } catch (error) {
    populateError(error, "خطأ فى إعادة حساب الصندوق");
  }
};

export const getCashboxByBranchId = async (branchId: number) => {
  try {
    const { data } = await api.get<{
      cashbox: TCashbox;
      branch: TBranchResponse;
      today_summary: {
        income: number;
        expense: number;
        net_change: number;
      };
    }>(`/branches/${branchId}/cashbox`);
    return data;
  } catch (error) {
    populateError(error, "خطأ فى جلب الصناديق بالفرع");
  }
};

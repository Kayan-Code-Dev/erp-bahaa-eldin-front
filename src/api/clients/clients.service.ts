import { TPaginationResponse } from "../api-common.types";
import { api } from "../api-contants";
import { populateError } from "../api.utils";
import { TClient } from "./clients.types";

export const getClients = async (page: number) => {
  try {
    const { data } = await api.get<{ data: TPaginationResponse<TClient> }>(
      `/employees/clients`,
      {
        params: {
          page,
        },
      }
    );
    data.data.total_pages = Math.ceil(data.data.total / 10);
    return data.data;
  } catch (error) {
    populateError(error, "خطأ فى جلب العملاء ");
  }
};

export type TCreateClientRequest = {
  client_name: string;
  client_phone_primary: string;
  client_phone_secondary?: string;
  client_address: string;
  visit_date: string;
  source?: string;
  event_date: string;
  notes?: string;
};

export const createClient = async (data: TCreateClientRequest) => {
  try {
    await api.post("/employees/clients", data);
  } catch (error) {
    populateError(error, "خطأ فى إضافة العميل ");
  }
};

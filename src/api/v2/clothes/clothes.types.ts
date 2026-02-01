import { TEntity } from "@/lib/types/entity.types";

export type TCreateClothesRequest = {
  code: string;
  name: string;
  description: string;
  breast_size: string;
  waist_size: string;
  sleeve_size: string;
  status: TClothesStatus;
  notes: string;
  entity_type: TEntity;
  entity_id: number;
  cloth_type_id: number;
};

export type TClothResponse = {
  code: string;
  name: string;
  description: string;
  breast_size: string;
  waist_size: string;
  sleeve_size: string;
  status: TClothesStatus;
  notes: string;
  entity_type: TEntity;
  entity_id: number;
  updated_at: string;
  created_at: string;
  id: number;
  cloth_type_id: number;
  cloth_type_name: string;
};

export type TUpdateClothesRequest = {
  code: string;
  name: string;
  status: TClothesStatus;
  entity_type: TEntity;
  entity_id: number;
  cloth_type_id: number;
};
// damaged, burned, scratched, ready_for_rent, rented, die and repairing
export type TClothesStatus =
  | "damaged"
  | "burned"
  | "scratched"
  | "ready_for_rent"
  | "rented"
  | "die"
  | "repairing";

export type TGetClothesRequestParams = {
  entity_type?: TEntity;
  entity_id?: number;
  page?: number;
  per_page?: number;
  name?: string;
  cloth_type_id?: number;
  category_id?: number;
  subcat_id?: number[];
  status?: TClothesStatus;
};

export type TClothesAvailableForDateResponse = {
  delivery_date: string;
  days_of_rent: number;
  entity_type: TEntity;
  entity_id: number;
  available_clothes: {
    id: number;
    code: string;
    name: string;
    description: string;
    status: TClothesStatus;
    cloth_type: {
      id: number;
      name: string;
    };
  }[];
  total_available: number;
};

export type TClothesUnavailableDaysRangesResponse = {
  results: {
    cloth_id: number;
    unavailable_ranges: {
      start: string;
      end: string;
    }[];
  }[];
};

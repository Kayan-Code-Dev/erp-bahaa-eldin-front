import { TInventoryResponse } from "../inventory/inventory.types";
import { TAddressResponse } from "../address/address.types";

export type TCreateBranchRequest = {
  branch_code: string;
  name: string;
  address: {
    street: string;
    building: string;
    city_id: number;
    notes: string;
  };
  inventory_name: string;
};

export type TBranchResponse = {
  branch_code: string;
  name: string;
  address_id: number;
  updated_at: string;
  created_at: string;
  id: number;
  inventory: TInventoryResponse;
  address: TAddressResponse;
};

export type TUpdateBranchRequest = Partial<TCreateBranchRequest>;



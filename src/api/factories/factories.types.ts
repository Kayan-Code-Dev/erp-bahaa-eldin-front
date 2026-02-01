export type TFactoryOrder = {
  uuid: string;
  order_number: string;
  branch_name: string;
  type_product: string;
  quantity: number;
  status: TFactoryOrderStatus;
  created_at: string;
  delivery_date: string;
  notes: string;
};

export type TFactoryOrderStatus =
  | "waiting"
  | "pending"
  | "in_progress"
  | "paused"
  | "completed"
  | "canceled";

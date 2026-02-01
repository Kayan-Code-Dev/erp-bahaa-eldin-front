export type TCreateClothesModel = {
  code: string;
  name: string;
  description: string;
  subcat_id: number[];
};

export type TClothesModel = {
  id: number;
  code: string;
  name: string;
  description: string;
  breast_size: number | null;
  waist_size: number | null;
  sleeve_size: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  subcategories: { id: number; name: string }[];
};

export type TUpdateClothesModel = Partial<TCreateClothesModel>;

import { TAddressResponse } from "../address/address.types";

export const CLIENT_SOURCES = [
  "website",
  "facebook",
  "instagram",
  "twitter",
  "referral",
  "other",
] as const;

export const CLIENT_SOURCE_LABELS = {
  website: "موقع إلكتروني",
  facebook: "فيسبوك",
  instagram: "انستقرام",
  twitter: "تويتر",
  referral: "مرجع من عميل",
  other: "أخرى",
} as const;

export type TClientSource = (typeof CLIENT_SOURCES)[number];

export type TCreateClientRequest = {
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  national_id: string;
  source: TClientSource;
  address: {
    city_id: number;
    street: string;
    building: string;
    notes: string;
  };
  phones: {
    phone: string;
  }[];
};

export type TClientResponse = {
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  national_id: string;
  source: string;
  address_id: number;
  updated_at: string;
  created_at: string;
  id: number;
  phones: { phone: string }[];

  address: TAddressResponse;
};

export type TUpdateClientRequest = Partial<TCreateClientRequest>;

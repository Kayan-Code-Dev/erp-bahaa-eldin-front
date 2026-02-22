import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

const ARABIC_NUMERALS = "٠١٢٣٤٥٦٧٨٩";
const ENGLISH_NUMERALS = "0123456789";

/** Converts Arabic-Indic numerals (٠-٩) to English (0-9) in a string */
export function toEnglishNumerals(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return s.replace(/[٠-٩]/g, (d) => ENGLISH_NUMERALS[ARABIC_NUMERALS.indexOf(d)] ?? d);
}

export const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
        const parsedDate = parseISO(dateString);
        return format(parsedDate, "d MMMM yyyy - h:mm a", { locale: ar });
    } catch {
        return dateString;
    }
};
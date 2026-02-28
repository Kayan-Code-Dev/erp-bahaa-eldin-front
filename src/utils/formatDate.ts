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
        // تنسيق التاريخ: يوم/شهر/سنة
        return format(parsedDate, "yyyy/MM/dd");
    } catch {
        return dateString;
    }
};

// دالة إضافية للتنسيق مع الوقت إذا احتجتها
export const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    try {
        const parsedDate = parseISO(dateString);
        // تنسيق التاريخ مع الوقت: يوم/شهر/سنة - ساعة:دقيقة ص/م
        return format(parsedDate, "yyyy/MM/dd - h:mm a", { locale: ar });
    } catch {
        return dateString;
    }
};
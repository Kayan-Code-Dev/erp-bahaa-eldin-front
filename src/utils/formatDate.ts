import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

export const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
        const parsedDate = parseISO(dateString);
        return format(parsedDate, "d MMMM yyyy - h:mm a", { locale: ar });
    } catch {
        return dateString;
    }
};
import { TOrder } from "@/api/v2/orders/orders.types";

const HEADER_BG = "#907457";

/** قواعد وتعليمات الإقرار — في آخر الصفحة */
const RULES_ITEMS = [
  "ميعاد استلام المنتج من 1 ظهراً حتى 7 مساءً وإحضار التأمينات اللازمة.",
  "لا يمكن استرجاع أو استبدال المنتج بعد مرور 3 أيام من تاريخ الشراء إلا في حالة وجود عيب مصنعي.",
  "يجب إحضار الفاتورة الأصلية مع البطاقة الشخصية عند الاسترجاع أو الاستبدال أو الاستلام.",
];

type Props = {
  order: TOrder;
  logoUrl?: string;
  employeeName?: string;
};

function formatDate(s: string): string {
  if (!s) return "-";
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString("ar-EG");
  } catch {
    return s;
  }
}

export function OrderReceiptAckPrint({
  order,
  logoUrl = "/app-logo.svg",
  employeeName = "-----------------------",
}: Props) {
  const c = order.client;
  const clientName = c?.name?.trim() || "-";
  const nationalId = (c as { national_id?: string })?.national_id ?? "-";
  const addressStr = c?.address
    ? [c.address.street, c.address.building].filter(Boolean).join(" - ") || "-"
    : "-";
  const items = order.items ?? [];
  const startDate = order.visit_datetime ? formatDate(order.visit_datetime) : "-";
  const endDate = order.delivery_date
    ? formatDate(order.delivery_date)
    : (items[0] as { delivery_date?: string })?.delivery_date
      ? formatDate((items[0] as { delivery_date: string }).delivery_date)
      : "-";
  const paid = String(order.paid ?? "-");
  const invoiceDate = order.created_at ? formatDate(order.created_at) : "-";

  return (
    <div
      dir="rtl"
      className="invoice-print-root w-full min-h-screen flex flex-col bg-white text-gray-900 font-semibold text-[14px] leading-snug"
      style={{ fontFamily: "'Cairo', 'Segoe UI', Arial, sans-serif" }}
    >
      {/* Header — مصغّر */}
      <header
        className="invoice-print-header w-full py-3 mb-3 text-white rounded-b-xl shadow-sm font-semibold"
        style={{ backgroundColor: HEADER_BG }}
      >
        <div className="invoice-print-header-inner flex items-center justify-between gap-6 max-w-[210mm] mx-auto px-6">
          <div className="invoice-print-header-right text-right shrink-0 space-y-0.5 text-[14px] font-semibold">
            <div className="flex items-baseline justify-end gap-2 flex-wrap">
              <span className="text-white/95 font-bold">رقم الفاتورة:</span>
              <span className="font-bold text-white">{order.id}</span>
            </div>
            <div className="font-bold text-white/95">اسم الموظف: {employeeName}</div>
            <div className="font-bold text-white/95">التاريخ: {invoiceDate}</div>
          </div>
          <div className="invoice-print-header-logo shrink-0 bg-white/10 rounded-lg p-2 flex items-center justify-center">
            <img src={logoUrl} alt="الشعار" className="invoice-logo-img max-h-14 w-auto object-contain" />
          </div>
        </div>
      </header>

      <div className="invoice-print-content flex-1 flex flex-col min-h-0 max-w-[210mm] mx-auto px-6 pb-3 w-full">
        {/* المحتوى من العنوان حتى التوقيع */}
        <div className="invoice-print-body shrink-0">
        {/* 1. عنوان الإقرار — في الأعلى */}
        <div className="invoice-print-title-wrap flex flex-col items-center justify-center text-center mb-3">
          <h1 className="invoice-print-title text-[22px] font-bold text-gray-900 tracking-tight">
            إقرار استلام
          </h1>
          <span className="invoice-print-title-line mt-1 block h-0.5 w-24 rounded-full bg-gray-400" aria-hidden />
        </div>

        {/* 2. استلمت أنا / الرقم القومي / المقيم في — من اليمين */}
        <div className="invoice-print-recipient text-right mb-3 space-y-1 text-[14px] font-semibold">
          <p className="text-gray-900">
            <span className="font-bold text-gray-700">استلمت أنا :</span>{" "}
            <span className="font-bold text-gray-900">{clientName}</span>
          </p>
          <p className="text-gray-900">
            <span className="font-bold text-gray-700">الرقم القومي :</span>{" "}
            <span className="font-bold text-gray-900">{nationalId}</span>
          </p>
          <p className="text-gray-900">
            <span className="font-bold text-gray-700">المقيم في :</span>{" "}
            <span className="font-bold text-gray-900">{addressStr}</span>
          </p>
        </div>

        {/* 3. قائمة المنتجات مرقمة */}
        <div className="invoice-print-items-list mb-3 text-[14px] font-semibold text-gray-900">
          {items.length > 0 ? (
            <ol className="list-decimal list-inside space-y-0.5">
              {items.map((item) => (
                <li key={item.id} className="font-bold">{item.name || "-"}</li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-600">—</p>
          )}
        </div>

        {/* 4. فترة التأجير */}
        <p className="invoice-print-rental text-[14px] font-semibold text-gray-900 mb-2">
          وذلك بتأجيره من تاريخ{" "}
          <span className="font-bold">{startDate}</span> حتى تاريخ{" "}
          <span className="font-bold">{endDate}</span>
        </p>

        {/* 5. إقرار الاستلام ودفع العربون */}
        <p className="invoice-print-deposit text-[14px] font-semibold text-gray-900 mb-4">
          وذلك إقرار مني بالاستلام ودفع عربون وقدره :{" "}
          <span className="font-bold">{paid} ج.م</span>
        </p>

        {/* 6. المستلم والتوقيع */}
        <div className="invoice-print-signature flex justify-end mt-2 pt-3 border-t-2 border-gray-300 space-y-3">
          <div className="invoice-print-signature-box text-right min-w-[220px] space-y-2 text-[14px] font-semibold text-gray-900">
            <p>
              <span className="font-bold">المستلم :</span>{" "}
              <span className="inline-block border-b-2 border-gray-500 min-w-[120px] align-bottom">&nbsp;</span>
            </p>
            <p>
              <span className="font-bold">التوقيع :</span>{" "}
              <span className="inline-block border-b-2 border-gray-500 min-w-[120px] align-bottom">&nbsp;</span>
            </p>
          </div>
        </div>
        </div>

        {/* 7. القواعد والتعليمات — ثابتة في آخر الصفحة مع مسافة فوق الفوتر */}
        <div className="invoice-print-rules mt-auto pt-3 pb-8 border-t-2 border-gray-200 shrink-0">
          <h2 className="invoice-print-rules-title text-[13px] font-bold text-gray-800 mb-1.5 pb-1">
            القواعد والتعليمات
          </h2>
          <div className="invoice-print-notes-box rounded-lg border-2 border-gray-200 bg-gray-50 py-2 px-3">
            <ul className="list-none space-y-0.5 text-[12px] font-semibold text-gray-800 leading-snug">
              {RULES_ITEMS.map((text, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="font-bold text-gray-600 shrink-0">{i + 1}.</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer — مصغّر */}
      <div
        className="invoice-print-footer w-full mt-auto py-2 px-4 text-center text-white rounded-t-xl text-[13px] font-bold shadow-sm shrink-0"
        style={{ backgroundColor: HEADER_BG }}
      >
        لا يرد العربون في حالة إلغاء الحجز
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-print-root, .invoice-print-root * { visibility: visible; }
          .invoice-print-root { position: absolute; left: 0; top: 0; width: 100%; padding: 0; box-sizing: border-box; page-break-inside: avoid; }
          .invoice-print-header, .invoice-print-footer { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

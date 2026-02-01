import { TOrder } from "@/api/v2/orders/orders.types";

const HEADER_BG = "#907457";

const RULES_TEXT = `إقرار من المستفيد: أقر بأنني استلمت الفاتورة من 1 إلى 7 أسماء ظاهرة وأوضح أنني مسؤول عن التأخير. 2000 جنيه لإيجار السروال و 500 للجلب. لا يجوز استبدال أو إرجاع الفواتير إلا بعد 3 أشهر. لا يسمح بإخراج الملابس من المحل في حالة غير مكتملة البيع. يلزم إحضار الفواتير الشخصية مع الفاتورة عند الاستبدال أو الإرجاع.`;

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
  const firstItem = items[0] as { delivery_date?: string; occasion_datetime?: string } | undefined;
  const startDate = order.visit_datetime ? formatDate(order.visit_datetime) : "-";
  const endDate = firstItem?.delivery_date ? formatDate(firstItem.delivery_date) : "-";
  const paid = String(order.paid ?? "-");
  const invoiceDate = order.created_at ? formatDate(order.created_at) : "-";

  return (
    <div
      dir="rtl"
      className="invoice-print-root w-full min-h-screen flex flex-col bg-white text-gray-800 text-[15px] leading-relaxed"
      style={{ fontFamily: "'Segoe UI', 'Cairo', Arial, sans-serif" }}
    >
      {/* الهيدر بنفس تنسيق الفاتورة */}
      <header
        className="invoice-print-header w-full py-6 mb-8 text-white rounded-b-2xl shadow-md"
        style={{ backgroundColor: HEADER_BG }}
      >
        <div className="invoice-print-header-inner flex items-center justify-between gap-8 max-w-[210mm] mx-auto px-8">
          <div className="invoice-print-header-right text-right shrink-0 space-y-3">
            <div className="flex items-baseline justify-end gap-2 flex-wrap">
              <span className="invoice-header-label text-lg font-semibold text-white/95">رقم الفاتورة: </span>
              <span className="invoice-header-label text-lg font-semibold text-white/95">{order.id}</span>
            </div>
            <div className="invoice-header-line text-base font-medium text-white/95">اسم الموظف: {employeeName}</div>
            <div className="invoice-header-line text-base font-medium text-white/95">التاريخ: {invoiceDate}</div>
          </div>
          <div className="invoice-print-header-logo shrink-0 bg-white/10 rounded-xl p-3 flex items-center justify-center">
            <img src={logoUrl} alt="الشعار" className="invoice-logo-img max-h-24 w-auto object-contain" />
          </div>
        </div>
      </header>

      <div className="invoice-print-content flex-1 flex flex-col max-w-[210mm] mx-auto px-8 pb-4 w-full">
        <div className="invoice-print-title-wrap flex flex-col items-center justify-center text-center mb-8 pt-2">
          <h1 className="invoice-print-title text-2xl font-bold text-gray-800 tracking-tight">
            إقرار استلام
          </h1>
          <span className="invoice-print-title-line mt-3 block h-0.5 w-24 rounded-full bg-gray-300" aria-hidden />
        </div>

        {/* Recipient info */}
        <div className="invoice-print-block mb-6 overflow-hidden rounded-xl border border-gray-200 bg-gray-50/30">
          <h2 className="invoice-print-block-title text-sm font-semibold text-gray-600 uppercase tracking-wider py-3 px-4 border-b border-gray-200 bg-gray-50/80">
            بيانات المستلم
          </h2>
          <div className="p-4 space-y-3 text-gray-700">
            <p className="font-semibold text-gray-800">استلمت انا {clientName}</p>
            <p className="text-sm"><span className="font-medium text-gray-600">الرقم القومي:</span> {nationalId}</p>
            <p className="text-sm"><span className="font-medium text-gray-600">المقيم في:</span> {addressStr}</p>
            <div className="pt-2">
              <p className="font-medium text-gray-600 text-sm mb-2">الأصناف المستلمة:</p>
              {items.length > 0 ? (
                <ul className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  {items.map((item) => (
                    <li key={item.id}>{item.name || "-"}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">—</p>
              )}
            </div>
            <p className="text-sm pt-1">وذلك بتأجير من تاريخ {startDate} حتى تاريخ {endDate}</p>
            <p className="text-sm">وذلك إقرار مني بالاستلام ودفع عربون قدره {paid}</p>
          </div>
        </div>

        {/* التوقيع */}
        <div className="invoice-print-signature flex justify-end mt-6 pt-6 border-t border-gray-200">
          <div className="invoice-print-signature-box text-left min-w-[200px]">
            <span className="font-semibold text-gray-700 block mb-2 text-sm">التوقيع</span>
            <div className="invoice-print-signature-line border-b-2 border-gray-400 h-8 mt-1" />
          </div>
        </div>

        {/* القواعد والتعليمات */}
        <div className="invoice-print-block mt-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
            القواعد والتعليمات
          </h2>
          <div className="invoice-print-notes-box rounded-lg border border-gray-200 bg-gray-50/50 py-3 px-4 text-gray-600 text-sm leading-relaxed">
            {RULES_TEXT}
          </div>
        </div>
      </div>

      {/* الفوتر بنفس تنسيق الفاتورة */}
      <div
        className="invoice-print-footer w-full mt-auto py-4 px-6 text-center text-white rounded-t-2xl text-sm font-medium shadow-md shrink-0"
        style={{ backgroundColor: HEADER_BG }}
      >
        لا يرد العربون في حالة الغاء الحجز
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-print-root, .invoice-print-root * { visibility: visible; }
          .invoice-print-root { position: absolute; left: 0; top: 0; width: 100%; padding: 0; box-sizing: border-box; page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}

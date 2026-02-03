import { TOrder } from "@/api/v2/orders/orders.types";

const HEADER_BG = "#907457";

/** قواعد وتعليمات الإقرار — مقسمة كنقاط للوضوح عند الطباعة */
const RULES_ITEMS = [
  "أقر بأنني استلمت الفاتورة والأصناف الظاهرة أدناه وأوضح أنني مسؤول عن التأخير.",
  "لا يجوز استبدال أو إرجاع الفواتير إلا بعد 3 أشهر.",
  "لا يسمح بإخراج الملابس من المحل في حالة غير مكتملة البيع.",
  "يلزم إحضار الفواتير الشخصية مع الفاتورة عند الاستبدال أو الإرجاع.",
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
      className="invoice-print-root w-full min-h-screen flex flex-col bg-white text-gray-800 text-[15px] leading-relaxed"
      style={{ fontFamily: "'Segoe UI', 'Cairo', Arial, sans-serif" }}
    >
      {/* Header */}
      <header
        className="invoice-print-header w-full py-6 mb-6 text-white rounded-b-2xl shadow-md"
        style={{ backgroundColor: HEADER_BG }}
      >
        <div className="invoice-print-header-inner flex items-center justify-between gap-8 max-w-[210mm] mx-auto px-8">
          <div className="invoice-print-header-right text-right shrink-0 space-y-2">
            <div className="flex items-baseline justify-end gap-2 flex-wrap">
              <span className="text-white/90 text-base">رقم الفاتورة:</span>
              <span className="text-lg font-bold text-white">{order.id}</span>
            </div>
            <div className="text-base font-medium text-white/95">اسم الموظف: {employeeName}</div>
            <div className="text-base font-medium text-white/95">التاريخ: {invoiceDate}</div>
          </div>
          <div className="invoice-print-header-logo shrink-0 bg-white/10 rounded-xl p-3 flex items-center justify-center">
            <img src={logoUrl} alt="الشعار" className="invoice-logo-img max-h-24 w-auto object-contain" />
          </div>
        </div>
      </header>

      <div className="invoice-print-content flex-1 flex flex-col max-w-[210mm] mx-auto px-8 pb-6 w-full">
        {/* عنوان الإقرار */}
        <div className="invoice-print-title-wrap flex flex-col items-center justify-center text-center mb-4">
          <h1 className="invoice-print-title text-3xl font-bold text-gray-900 tracking-tight">
            إقرار استلام
          </h1>
          <span className="invoice-print-title-line mt-2 block h-1 w-28 rounded-full bg-gray-300" aria-hidden />
        </div>

        {/* بيانات المستلم — بطاقة منظمة */}
        <div className="invoice-print-block mb-6 overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-sm">
          <h2 className="invoice-print-block-title text-sm font-bold text-gray-700 uppercase tracking-wider py-4 px-5 border-b-2 border-gray-200 bg-gray-50">
            بيانات المستلم
          </h2>
          <div className="p-5 space-y-4">
            <p className="text-base font-semibold text-gray-900 leading-relaxed">
              أقر أنا الموضح بياناتي أدناه بأنني استلمت الأصناف المذكورة في هذه الفاتورة، وأتعهد بالالتزام بشروط الإيجار والتعليمات المبينة في هذا الإقرار.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500 font-medium mb-0.5">الاسم الكامل</span>
                <span className="font-semibold text-gray-800">{clientName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-medium mb-0.5">الرقم القومي</span>
                <span className="font-semibold text-gray-800">{nationalId}</span>
              </div>
              <div className="flex flex-col sm:col-span-2">
                <span className="text-gray-500 font-medium mb-0.5">العنوان</span>
                <span className="font-semibold text-gray-800">{addressStr}</span>
              </div>
            </div>

            {/* الأصناف المستلمة — جدول مصغّر */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-gray-600 font-semibold text-sm mb-2">الأصناف المستلمة:</p>
              {items.length > 0 ? (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-right py-2 px-3 font-semibold text-gray-600 w-8">#</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-600">اسم الصنف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr key={item.id} className="border-t border-gray-100">
                          <td className="py-2 px-3 text-gray-600">{i + 1}</td>
                          <td className="py-2 px-3 font-medium text-gray-800">{item.name || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">—</p>
              )}
            </div>

            {/* الفترة والمبلغ */}
            <div className="pt-3 border-t border-gray-100 space-y-1 text-sm">
              <p className="text-gray-700">
                <span className="font-medium text-gray-600">فترة الإيجار:</span> من تاريخ{" "}
                <span className="font-semibold text-gray-900">{startDate}</span> حتى تاريخ{" "}
                <span className="font-semibold text-gray-900">{endDate}</span>
              </p>
              <p className="text-gray-700">
                <span className="font-medium text-gray-600">العربون المدفوع:</span>{" "}
                <span className="font-bold text-gray-900">{paid} ج.م</span>
              </p>
            </div>
          </div>
        </div>

        {/* التوقيع */}
        <div className="invoice-print-signature flex justify-end mt-8 pt-6 border-t-2 border-gray-200">
          <div className="invoice-print-signature-box text-left min-w-[220px]">
            <span className="font-bold text-gray-700 block mb-3 text-sm uppercase tracking-wider">
              توقيع المستلم
            </span>
            <div className="invoice-print-signature-line border-b-2 border-gray-500 h-10 mt-1" />
            <span className="text-xs text-gray-400 mt-1 block">(التوقيع بخط اليد)</span>
          </div>
        </div>

        {/* القواعد والتعليمات */}
        <div className="invoice-print-block mt-8">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 pb-2 border-b-2 border-gray-200">
            القواعد والتعليمات
          </h2>
          <div className="invoice-print-notes-box rounded-xl border-2 border-gray-200 bg-gray-50/80 py-4 px-5">
            <ul className="list-none space-y-2 text-gray-700 text-sm leading-relaxed">
              {RULES_ITEMS.map((text, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold text-gray-500 shrink-0">{i + 1}.</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="invoice-print-footer w-full mt-auto py-4 px-6 text-center text-white rounded-t-2xl text-sm font-semibold shadow-md shrink-0"
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

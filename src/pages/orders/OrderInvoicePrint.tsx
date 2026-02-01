import { TOrder } from "@/api/v2/orders/orders.types";

const HEADER_BG = "#907457";
const HEADER_DARK = "#7a6349";

type Props = {
  order: TOrder;
  /** مسار اللوغو (افتراضي: /app-logo.svg) */
  logoUrl?: string;
  /** اسم الموظف للعرض في الهيدر */
  employeeName?: string;
  /** عند true (نسخة الفاتورة): يعرض اسم الصنف والكود فقط، وباقي الأسعار فارغة. عند false (نسخة العميل): يعرض كل البيانات */
  hideItemPrices?: boolean;
};

const RULES_TEXT = `إقرار من المستفيد: أقر بأنني استلمت الفاتورة من 1 إلى 7 أسماء ظاهرة وأوضح أنني مسؤول عن التأخير. 2000 جنيه لإيجار السروال و 500 للجلب. لا يجوز استبدال أو إرجاع الفواتير إلا بعد 3 أشهر. لا يسمح بإخراج الملابس من المحل في حالة غير مكتملة البيع. يلزم إحضار الفواتير الشخصية مع الفاتورة عند الاستبدال أو الإرجاع.`;

// بيانات الصفوف الأولى: اسم الحقل + صنف (أول، ثاني، ...)
const INFO_ROWS: { label: string; key: string }[] = [
  { label: "اسم العروسة", key: "صنف أول" },
  { label: "هاتف العروسة", key: "صنف ثاني" },
  { label: "هاتف اضافي", key: "صنف ثالث" },
  { label: "العنوان", key: "صنف رابع" },
  { label: "ميعاد الاستلام", key: "صنف خامس" },
  { label: "ميعاد الفرح", key: "صنف سادس" },
  { label: "ميعاد الاسترجاع", key: "صنف سابع" },
];

function getInfoValues(order: TOrder): string[] {
  const c = order.client;
  const addressStr = c?.address
    ? [c.address.street, c.address.building].filter(Boolean).join(" - ") || "-"
    : "-";
  const phones = (c as { phones?: { phone: string }[] })?.phones ?? [];
  const phone1 = phones[0]?.phone ?? "-";
  const phone2 = phones[1]?.phone ?? "-";
  const name = c ? `${c.first_name ?? ""} ${(c as { middle_name?: string }).middle_name ?? ""} ${c.last_name ?? ""}`.trim() || "-" : "-";
  const items = order.items ?? [];
  const firstItem = items[0] as { delivery_date?: string; occasion_datetime?: string } | undefined;
  const visitDate = order.visit_datetime ? formatDate(order.visit_datetime) : "-";
  const occasionDate = firstItem?.occasion_datetime ? formatDate(firstItem.occasion_datetime) : "-";
  const deliveryDate = firstItem?.delivery_date ? formatDate(firstItem.delivery_date) : "-";
  return [name, phone1, phone2, addressStr, visitDate, occasionDate, deliveryDate];
}

function formatDate(s: string): string {
  if (!s) return "-";
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString("ar-EG");
  } catch {
    return s;
  }
}

function formatNumber(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const EMPTY_PRICE = "";

export function OrderInvoicePrint({
  order,
  logoUrl = "/app-logo.svg",
  employeeName = "-----------------------",
  hideItemPrices = false,
}: Props) {
  const totalPrice = order.total_price ?? 0;
  const paid = parseFloat(String(order.paid ?? 0)) || 0;
  const remaining = parseFloat(String(order.remaining ?? 0)) ?? 0;
  const infoValues = getInfoValues(order);
  const items = order.items ?? [];
  const invoiceDate = order.created_at ? formatDate(order.created_at) : formatDate(new Date().toISOString());

  return (
    <div
      dir="rtl"
      className="invoice-print-root w-full min-h-screen flex flex-col bg-white text-gray-800 text-[15px] leading-relaxed"
      style={{ fontFamily: "'Segoe UI', 'Cairo', Arial, sans-serif" }}
    >
      {/* الهيدر بعرض كامل الشاشة */}
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


        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">بيانات الطلب</h2>
          <table className="invoice-print-table invoice-print-table-info w-full border-collapse overflow-hidden rounded-xl border border-gray-200" style={{ tableLayout: "fixed" }}>
            <tbody>
              {INFO_ROWS.map(({ label, key }, i) => (
                <tr key={i} className={i % 2 === 0 ? "invoice-print-row-even bg-gray-50/80" : "bg-white"}>
                  <td className="invoice-print-td border-b border-gray-100 py-3.5 px-4 text-gray-600 font-medium" style={{ width: "35%" }}>{label}</td>
                  <td className="invoice-print-td border-b border-gray-100 py-3.5 px-4 text-gray-500 text-sm" style={{ width: "25%" }}>{key}</td>
                  <td className="invoice-print-td border-b border-gray-100 py-3.5 px-4" style={{ width: "40%" }}>{infoValues[i] ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">تفاصيل الأصناف</h2>
          <table className="invoice-print-table invoice-print-table-items w-full border-collapse overflow-hidden rounded-xl border border-gray-200" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr className="invoice-print-thead-row" style={{ backgroundColor: HEADER_DARK }}>
                <th className="invoice-print-th py-3.5 px-4 text-center font-semibold text-white text-sm" style={{ width: "8%" }}>رقم</th>
                <th className="invoice-print-th py-3.5 px-4 text-center font-semibold text-white text-sm">اسم الصنف</th>
                <th className="invoice-print-th py-3.5 px-4 text-center font-semibold text-white text-sm" style={{ width: "14%" }}>الكود</th>
                <th className="invoice-print-th py-3.5 px-4 text-center font-semibold text-white text-sm" style={{ width: "14%" }}>سعر القطعة</th>
                <th className="invoice-print-th py-3.5 px-4 text-center font-semibold text-white text-sm" style={{ width: "14%" }}>العربون</th>
                <th className="invoice-print-th py-3.5 px-4 text-center font-semibold text-white text-sm" style={{ width: "14%" }}>الباقي</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => {
                  const ext = item as { price?: number };
                  const showPrices = !hideItemPrices;
                  return (
                    <tr key={item.id} className={index % 2 === 0 ? "invoice-print-row-even bg-gray-50/50" : "bg-white"}>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-3 px-4 text-center text-sm">{index + 1}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-3 px-4 text-center text-sm">{item.name || "-"}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-3 px-4 text-center text-sm">{item.code || "-"}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-3 px-4 text-center text-sm">{showPrices && ext.price != null ? formatNumber(ext.price) : EMPTY_PRICE}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-3 px-4 text-center text-sm">{EMPTY_PRICE}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-3 px-4 text-center text-sm">{EMPTY_PRICE}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="invoice-print-td invoice-print-td-center py-6 px-4 text-center text-gray-400 text-sm">
                    لا توجد عناصر
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="invoice-print-block mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 pb-2 border-b border-gray-200">ملاحظات العميل</h2>
          <div className="invoice-print-notes-box rounded-lg border border-gray-200 bg-gray-50/50 py-3 px-4 min-h-[52px] text-gray-700 text-sm">
            {order.order_notes?.trim() || "—"}
          </div>
        </div>

        <div className="invoice-print-rules-row flex gap-6 mb-6 flex-wrap">
          <div className="invoice-print-rules-text flex-1 min-w-[240px]">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 pb-2 border-b border-gray-200">القواعد والتعليمات</h2>
            <p className="invoice-print-rules-p text-gray-600 text-sm leading-relaxed">{RULES_TEXT}</p>
          </div>
          <div className="invoice-print-totals-wrap shrink-0 w-56 rounded-xl overflow-hidden shadow-md border border-gray-200">
            <div className="invoice-print-totals-title py-2.5 px-4 text-center text-white text-sm font-bold uppercase tracking-wider" style={{ backgroundColor: HEADER_BG }}>
              ملخص المبالغ
            </div>
            <table className="invoice-print-totals-table w-full border-collapse">
              <tbody>
                <tr className="invoice-print-totals-row border-b border-gray-100">
                  <td className="invoice-print-totals-label py-3 px-4 text-sm font-semibold text-gray-600 bg-gray-50/80">المجموع</td>
                  <td className="invoice-print-totals-value py-3 px-4 text-right text-base font-bold tabular-nums text-gray-900">{hideItemPrices ? EMPTY_PRICE : formatNumber(totalPrice)}</td>
                </tr>
                <tr className="invoice-print-totals-row border-b border-gray-100">
                  <td className="invoice-print-totals-label py-3 px-4 text-sm font-semibold text-gray-600 bg-gray-50/80">العربون</td>
                  <td className="invoice-print-totals-value py-3 px-4 text-right text-sm font-semibold tabular-nums text-gray-800">{hideItemPrices ? EMPTY_PRICE : formatNumber(paid)}</td>
                </tr>
                <tr className="invoice-print-totals-row">
                  <td className="invoice-print-totals-label py-3 px-4 text-sm font-semibold text-gray-600 bg-gray-50/80">المتبقي</td>
                  <td className="invoice-print-totals-value py-3 px-4 text-right text-sm font-semibold tabular-nums text-gray-800">{hideItemPrices ? EMPTY_PRICE : formatNumber(remaining)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="invoice-print-signature flex justify-end mt-10 pt-6 border-t border-gray-200">
          <div className="invoice-print-signature-box text-left min-w-[200px]">
            <span className="font-semibold text-gray-700 block mb-2 text-sm">التوقيع</span>
            <div className="invoice-print-signature-line border-b-2 border-gray-400 h-8 mt-1" />
          </div>
        </div>
      </div>

      {/* الشريط السفلي ثابت في أسفل الصفحة */}
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

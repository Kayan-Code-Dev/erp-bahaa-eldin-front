import { TOrder } from "@/api/v2/orders/orders.types";

const HEADER_BG = "#907457";
const HEADER_DARK = "#7a6349";

type Props = {
  order: TOrder;
  /** Logo path (default: /app-logo.svg) */
  logoUrl?: string;
  /** Employee name shown in header */
  employeeName?: string;
  /** When true (invoice copy): show item name and code only, prices empty. When false (client copy): show all data */
  hideItemPrices?: boolean;
};

const RULES_TEXT = `إقرار من المستفيد: أقر بأنني استلمت الفاتورة من 1 إلى 7 أسماء ظاهرة وأوضح أنني مسؤول عن التأخير. 2000 جنيه لإيجار السروال و 500 للجلب. لا يجوز استبدال أو إرجاع الفواتير إلا بعد 3 أشهر. لا يسمح بإخراج الملابس من المحل في حالة غير مكتملة البيع. يلزم إحضار الفواتير الشخصية مع الفاتورة عند الاستبدال أو الإرجاع.`;

/* First table rows: label + placeholder key */
const INFO_ROWS: { label: string; key: string }[] = [
  { label: "اسم العروسة", key: "صنف أول" },
  { label: "هاتف العروسة", key: "صنف ثاني" },
  { label: "هاتف اضافي", key: "صنف ثالث" },
  { label: "العنوان", key: "صنف رابع" },
  { label: "ميعاد الاستلام", key: "صنف خامس" },
  { label: "ميعاد الفرح", key: "صنف سادس" },
  { label: "ميعاد الاسترجاع", key: "صنف سابع" },
];

/** Build order info values for print, supporting different API shapes */
function getInfoValues(order: TOrder): string[] {
  const c = order.client;
  if (!c) {
    return ["-", "-", "-", "-", "-", "-", "-"];
  }
  const name =
    (typeof (c as { name?: string }).name === "string" && (c as { name?: string }).name?.trim()) ||
    "-";
  const addressStr =
    c.address != null && typeof c.address === "object"
      ? [c.address.street, c.address.building].filter(Boolean).join(" - ") || "-"
      : "-";
  const rawPhones = (c as { phones?: { phone: string }[] }).phones;
  const phone1 =
    Array.isArray(rawPhones) && rawPhones[0]?.phone
      ? String(rawPhones[0].phone).trim()
      : (c as { phone_primary?: string }).phone_primary?.trim() || "-";
  const phone2 =
    Array.isArray(rawPhones) && rawPhones[1]?.phone
      ? String(rawPhones[1].phone).trim()
      : (c as { phone_secondary?: string }).phone_secondary?.trim() || "-";
  const items = order.items ?? [];
  const firstItem = items[0];
  const visitDate =
    order.visit_datetime && String(order.visit_datetime).trim()
      ? formatDate(String(order.visit_datetime))
      : "-";
  const occasionDate =
    firstItem &&
    (firstItem as { occasion_datetime?: string | null }).occasion_datetime &&
    String((firstItem as { occasion_datetime?: string }).occasion_datetime).trim()
      ? formatDate(String((firstItem as { occasion_datetime: string }).occasion_datetime))
      : "-";
  const deliveryDate =
    firstItem &&
    (firstItem as { delivery_date?: string | null }).delivery_date &&
    String((firstItem as { delivery_date?: string }).delivery_date).trim()
      ? formatDate(String((firstItem as { delivery_date: string }).delivery_date))
      : "-";
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
  const totalPriceRaw =
    order.total_price != null && order.total_price !== ""
      ? parseFloat(String(order.total_price))
      : NaN;
  const totalPrice = Number.isFinite(totalPriceRaw) ? totalPriceRaw : 0;
  const paidRaw = parseFloat(String(order.paid ?? ""));
  const paid = Number.isFinite(paidRaw) ? paidRaw : 0;
  const remainingRaw = parseFloat(String(order.remaining ?? ""));
  const remaining = Number.isFinite(remainingRaw) ? remainingRaw : 0;
  const infoValues = getInfoValues(order);
  const items = order.items ?? [];
  const invoiceDate =
    order.created_at && String(order.created_at).trim()
      ? formatDate(String(order.created_at))
      : formatDate(new Date().toISOString());

  return (
    <div
      dir="rtl"
      className="invoice-print-root w-full min-h-screen flex flex-col bg-white text-gray-800 text-[15px] leading-relaxed"
      style={{ fontFamily: "'Segoe UI', 'Cairo', Arial, sans-serif" }}
    >
      {/* Full-width header */}
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
                  const showPrices = !hideItemPrices;
                  const price =
                    item.price != null && String(item.price).trim() !== ""
                      ? formatNumber(item.price)
                      : EMPTY_PRICE;
                  const itemPaidVal =
                    (item as { item_paid?: string }).item_paid != null &&
                    String((item as { item_paid?: string }).item_paid).trim() !== ""
                      ? formatNumber(String((item as { item_paid: string }).item_paid))
                      : EMPTY_PRICE;
                  const itemRemainingVal =
                    (item as { item_remaining?: string }).item_remaining != null &&
                    String((item as { item_remaining?: string }).item_remaining).trim() !== ""
                      ? formatNumber(String((item as { item_remaining: string }).item_remaining))
                      : EMPTY_PRICE;
                  return (
                    <tr key={item.id} className={index % 2 === 0 ? "invoice-print-row-even bg-gray-50/50" : "bg-white"}>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-3 px-4 text-center text-sm">{index + 1}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-3 px-4 text-center text-sm">{item.name || "-"}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-3 px-4 text-center text-sm">{item.code || "-"}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-3 px-4 text-center text-sm">{showPrices ? price : EMPTY_PRICE}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-3 px-4 text-center text-sm">{showPrices ? itemPaidVal : EMPTY_PRICE}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-3 px-4 text-center text-sm">{showPrices ? itemRemainingVal : EMPTY_PRICE}</td>
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

      {/* Fixed bottom bar at page bottom */}
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

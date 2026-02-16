import { TOrder } from "@/api/v2/orders/orders.types";
import { OrderEmployeeName } from "@/components/custom/OrderEmployeeName";

const HEADER_BG = "#907457";
const HEADER_DARK = "#7a6349";

type Props = {
  order: TOrder;
  /** Logo path (default: /app-logo.svg) */
  logoUrl?: string;
  /** When true (invoice copy): show item name and code only, prices empty. When false (client copy): show all data */
  hideItemPrices?: boolean;
};

const RULES_TEXT = `إقرار من المستفيد: أقر بأنني استلمت الفاتورة من 1 إلى 7 أسماء ظاهرة وأوضح أنني مسؤول عن التأخير. 2000 جنيه لإيجار السروال و 500 للجلب. لا يجوز استبدال أو إرجاع الفواتير إلا بعد 3 أشهر. لا يسمح بإخراج المنتجات من المحل في حالة غير مكتملة البيع. يلزم إحضار الفواتير الشخصية مع الفاتورة عند الاستبدال أو الإرجاع.`;

/* First table: label only (no item column) */
const INFO_ROWS: { label: string }[] = [
  { label: "اسم العروسة" },
  { label: "هاتف العروسة" },
  { label: "هاتف اضافي" },
  { label: "العنوان" },
  { label: "ميعاد الاستلام" },
  { label: "ميعاد الفرح" },
  { label: "ميعاد الاسترجاع" },
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
  const visitDate =
    order.visit_datetime && String(order.visit_datetime).trim()
      ? formatDate(String(order.visit_datetime))
      : "-";
  const occasionDate =
    order.occasion_datetime && String(order.occasion_datetime).trim()
      ? formatDate(String(order.occasion_datetime))
      : "-";
  const deliveryDate =
    order.delivery_date && String(order.delivery_date).trim()
      ? formatDate(String(order.delivery_date))
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
    <article
      dir="rtl"
      lang="ar"
      className="invoice-print-root w-full min-h-screen flex flex-col bg-white text-gray-800 text-[13px] leading-relaxed"
      style={{ fontFamily: "'Segoe UI', 'Cairo', Arial, sans-serif" }}
      itemScope
      itemType="https://schema.org/Invoice"
    >
      <meta itemProp="name" content={`فاتورة - طلب رقم ${order.id}`} />
      <meta itemProp="dateCreated" content={order.created_at} />
      
      <header
        className="invoice-print-header w-full py-3 mb-3 text-white rounded-b-lg shadow-md"
        style={{ backgroundColor: HEADER_BG }}
        role="banner"
      >
        <div className="invoice-print-header-inner flex items-center justify-between gap-4 w-full px-4 min-h-18">
          <div className="invoice-print-header-right text-right shrink-0 space-y-1">
            <div className="flex items-baseline justify-end gap-2 flex-wrap">
              <span className="invoice-header-label text-sm font-medium text-white/95">رقم الفاتورة: </span>
              <span className="invoice-header-label text-sm font-bold text-white" itemProp="identifier">{order.id}</span>
            </div>
            <div className="invoice-header-line text-xs font-normal text-white/95">
              اسم الموظف:{" "}
              <span className="font-semibold">
                <OrderEmployeeName order={order} className="inline-block" />
              </span>
            </div>
            <div className="invoice-header-line text-xs font-normal text-white/95">
              التاريخ: <span className="font-semibold">{invoiceDate}</span>
            </div>
          </div>
          <div className="invoice-print-header-logo shrink-0 h-18 flex items-center justify-center bg-white/10 rounded-lg p-1.5">
            <img 
              src={logoUrl} 
              alt="شعار الشركة" 
              className="invoice-logo-img max-h-full max-w-[140px] w-auto object-contain"
              itemProp="image"
            />
          </div>
        </div>
      </header>

      <main className="invoice-print-content flex-1 flex flex-col w-full px-4 pb-4">

        <section className="invoice-print-info-block mb-4" itemScope itemType="https://schema.org/Order">
          <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 pb-1.5 border-b-2 border-gray-300">بيانات الطلب</h2>
          <table className="invoice-print-table invoice-print-table-info w-full border-collapse overflow-hidden rounded-lg border border-gray-200" style={{ tableLayout: "fixed" }}>
            <tbody>
              {INFO_ROWS.map(({ label }, i) => (
                <tr key={i} className={i % 2 === 0 ? "invoice-print-row-even bg-gray-50/80" : "bg-white"}>
                  <th scope="row" className="invoice-print-td border-b border-gray-100 py-2.5 px-3 text-gray-700 font-semibold text-sm text-right" style={{ width: "32%" }}>{label}</th>
                  <td className="invoice-print-td border-b border-gray-100 py-2.5 px-3 text-gray-900 font-normal text-sm" style={{ width: "68%" }}>{infoValues[i] ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-4">
          <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 pb-1.5 border-b-2 border-gray-300">تفاصيل الأصناف</h2>
          <table className="invoice-print-table invoice-print-table-items w-full border-collapse overflow-hidden rounded-lg border border-gray-200" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr className="invoice-print-thead-row" style={{ backgroundColor: HEADER_DARK }}>
                <th scope="col" className="invoice-print-th py-2.5 px-3 text-center font-bold text-white text-sm" style={{ width: "10%" }}>رقم</th>
                <th scope="col" className="invoice-print-th py-2.5 px-3 text-center font-bold text-white text-sm">الكود</th>
                <th scope="col" className="invoice-print-th py-2.5 px-3 text-center font-bold text-white text-sm" style={{ width: "18%" }}>سعر القطعة</th>
                <th scope="col" className="invoice-print-th py-2.5 px-3 text-center font-bold text-white text-sm" style={{ width: "18%" }}>العربون</th>
                <th scope="col" className="invoice-print-th py-2.5 px-3 text-center font-bold text-white text-sm" style={{ width: "18%" }}>الباقي</th>
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
                    <tr key={item.id} className={index % 2 === 0 ? "invoice-print-row-even bg-gray-50/50" : "bg-white"} itemScope itemType="https://schema.org/Product">
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-2.5 px-3 text-center text-sm font-medium">{index + 1}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-2.5 px-3 text-center text-sm font-normal">{item.code || "-"}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-2.5 px-3 text-center text-sm font-semibold">{showPrices ? price : EMPTY_PRICE}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-2.5 px-3 text-center text-sm font-semibold">{showPrices ? itemPaidVal : EMPTY_PRICE}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-2.5 px-3 text-center text-sm font-semibold">{showPrices ? itemRemainingVal : EMPTY_PRICE}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="invoice-print-td invoice-print-td-center py-4 px-3 text-center text-gray-500 text-sm font-normal">
                    لا توجد عناصر
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="invoice-print-block mb-4">
          <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 pb-1.5 border-b-2 border-gray-300">ملاحظات العميل</h2>
          <div className="invoice-print-notes-box rounded-lg border border-gray-200 bg-gray-50/50 py-3 px-4 min-h-[40px] text-gray-800 text-sm font-normal">
            {order.order_notes?.trim() || "—"}
          </div>
        </section>

        <section className="invoice-print-rules-row flex gap-4 mb-4 flex-wrap">
          <aside className="invoice-print-rules-text flex-1 min-w-[200px]">
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 pb-1.5 border-b-2 border-gray-300">القواعد والتعليمات</h2>
            <p className="invoice-print-rules-p text-gray-700 text-xs leading-relaxed font-normal">{RULES_TEXT}</p>
          </aside>
          <div className="invoice-print-totals-wrap shrink-0 w-44 rounded-lg overflow-hidden shadow-md border border-gray-200">
            <header className="invoice-print-totals-title py-2.5 px-3 text-center text-white text-sm font-bold uppercase tracking-wider" style={{ backgroundColor: HEADER_BG }}>
              ملخص المبالغ
            </header>
            <table className="invoice-print-totals-table w-full border-collapse">
              <tbody>
                <tr className="invoice-print-totals-row border-b border-gray-100">
                  <th scope="row" className="invoice-print-totals-label py-2.5 px-3 text-sm font-semibold text-gray-700 bg-gray-50/80 text-right">المجموع</th>
                  <td className="invoice-print-totals-value py-2.5 px-3 text-right text-sm font-bold tabular-nums text-gray-900" itemProp="totalPaymentDue">{hideItemPrices ? EMPTY_PRICE : formatNumber(totalPrice)}</td>
                </tr>
                <tr className="invoice-print-totals-row border-b border-gray-100">
                  <th scope="row" className="invoice-print-totals-label py-2.5 px-3 text-sm font-semibold text-gray-700 bg-gray-50/80 text-right">العربون</th>
                  <td className="invoice-print-totals-value py-2.5 px-3 text-right text-sm font-semibold tabular-nums text-gray-800">{hideItemPrices ? EMPTY_PRICE : formatNumber(paid)}</td>
                </tr>
                <tr className="invoice-print-totals-row">
                  <th scope="row" className="invoice-print-totals-label py-2.5 px-3 text-sm font-semibold text-gray-700 bg-gray-50/80 text-right">المتبقي</th>
                  <td className="invoice-print-totals-value py-2.5 px-3 text-right text-sm font-semibold tabular-nums text-gray-800">{hideItemPrices ? EMPTY_PRICE : formatNumber(remaining)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="invoice-print-signature flex justify-end mt-5 pt-5 border-t-2 border-gray-300">
          <div className="invoice-print-signature-box text-left min-w-[160px]">
            <span className="font-semibold text-gray-700 block mb-2 text-sm">التوقيع</span>
            <div className="invoice-print-signature-line border-b-2 border-gray-400 h-7 mt-0" />
          </div>
        </section>
      </main>

      <footer
        className="invoice-print-footer w-full mt-auto py-3 px-4 text-center text-white rounded-t-lg text-sm font-semibold shadow-md shrink-0"
        style={{ backgroundColor: HEADER_BG }}
        role="contentinfo"
      >
        لا يرد العربون في حالة الغاء الحجز
      </footer>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-print-root, .invoice-print-root * { visibility: visible; }
          .invoice-print-root {
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            max-width: 100%; 
            padding: 0; 
            box-sizing: border-box;
            page-break-inside: avoid; 
            page-break-after: avoid;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Ensure proper font rendering */
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          /* Header when printing: logo at same height as header and clearer size */
          .invoice-print-header { 
            padding-top: 0.4rem !important; 
            padding-bottom: 0.4rem !important; 
            margin-bottom: 0.35rem !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .invoice-print-header-inner { 
            padding-left: 0.5rem !important; 
            padding-right: 0.5rem !important; 
            gap: 0.5rem !important; 
            min-height: 4rem !important; 
          }
          .invoice-print-header .invoice-header-label, 
          .invoice-print-header .invoice-header-line { 
            font-size: 9px !important; 
          }
          .invoice-print-header-logo { 
            padding: 0.25rem !important; 
            height: 4rem !important; 
            min-height: 4rem !important; 
            max-height: 4rem !important; 
          }
          .invoice-logo-img { 
            max-height: 100% !important; 
            height: 100% !important; 
            width: auto !important; 
            max-width: 160px !important; 
            object-fit: contain !important; 
            object-position: center !important; 
          }
          /* Shrink order data table only when printing */
          .invoice-print-info-block { margin-bottom: 0.5rem !important; }
          .invoice-print-info-block h2 { 
            font-size: 9px !important; 
            margin-bottom: 0.25rem !important; 
            padding-bottom: 0.25rem !important; 
          }
          .invoice-print-table-info .invoice-print-td { 
            padding: 0.2rem 0.4rem !important; 
            font-size: 9px !important; 
          }
          /* Hide screen-only elements */
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
          }
        }
      `}</style>
    </article>
  );
}

import { TOrder } from "@/api/v2/orders/orders.types";
import {
  getOrderCurrencyInfo,
  getOrderTotalsWithVat,
  getItemSubcategoryDisplay,
  getOrderTypeLabel,
} from "@/api/v2/orders/order.utils";
import { OrderEmployeeName } from "@/components/custom/OrderEmployeeName";
import { formatPhone } from "@/utils/formatPhone";

const HEADER_BG = "#5170ff";
const HEADER_DARK = "#3f5ae0";

type Props = {
  order: TOrder;
  /** Logo path (default: /dressnmore-logo.jpg) */
  logoUrl?: string;
  /** When true (invoice copy): show item name and code only, prices empty. When false (client copy): show all data */
  hideItemPrices?: boolean;
};


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
  const phone1 = formatPhone(
    Array.isArray(rawPhones) && rawPhones[0]?.phone ? rawPhones[0].phone : (c as { phone_primary?: string }).phone_primary,
    "-"
  );
  const phone2 = formatPhone(
    Array.isArray(rawPhones) && rawPhones[1]?.phone ? rawPhones[1].phone : (c as { phone_secondary?: string }).phone_secondary,
    "-"
  );
  const receiveDate =
    order.delivery_date && String(order.delivery_date).trim()
      ? formatDate(String(order.delivery_date))
      : "-";
  const occasionDate =
    order.occasion_datetime && String(order.occasion_datetime).trim()
      ? formatDate(String(order.occasion_datetime))
      : "-";
  const returnDate =
    order.visit_datetime && String(order.visit_datetime).trim()
      ? formatDate(String(order.visit_datetime))
      : "-";
  return [name, phone1, phone2, addressStr, receiveDate, occasionDate, returnDate];
}

function formatDate(s: string): string {
  if (!s) return "-";
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    // Format as YYYY-MM-DD (English numbers)
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return s;
  }
}

function formatNumber(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const MEASUREMENT_LABELS: { key: string; label: string }[] = [
  { key: "breast_size", label: "مقاس الصدر" },
  { key: "waist_size", label: "مقاس الخصر" },
  { key: "sleeve_size", label: "مقاس الأكمام" },
  { key: "sleeve_length", label: "طول الكم" },
  { key: "forearm", label: "الساعد" },
  { key: "shoulder_width", label: "عرض الكتف" },
  { key: "cuffs", label: "الأساور" },
  { key: "waist", label: "الخصر" },
  { key: "chest_length", label: "طول الصدر" },
  { key: "total_length", label: "الطول الكلي" },
  { key: "hinch", label: "الورك" },
  { key: "dress_size", label: "مقاس الفستان" },
];

function getItemMeasurements(item: Record<string, any>): { label: string; value: string }[] {
  return MEASUREMENT_LABELS
    .filter(({ key }) => item[key] != null && String(item[key]).trim() !== "")
    .map(({ key, label }) => ({ label, value: String(item[key]).trim() }));
}

function hasAnyMeasurements(items: Record<string, any>[]): boolean {
  return items.some(item => getItemMeasurements(item).length > 0);
}

const EMPTY_PRICE = "";

export function OrderInvoicePrint({
  order,
  logoUrl = "/dressnmore-logo.jpg",
  hideItemPrices = false,
}: Props) {
  const infoValues = getInfoValues(order);
  const items = order.items ?? [];
  const invoiceDate =
    order.created_at && String(order.created_at).trim()
      ? formatDate(String(order.created_at))
      : formatDate(new Date().toISOString());

  const printDate = formatDate(new Date().toISOString());
  const printTime = new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: false });

  // Branch logo: use branch image if available, otherwise fallback to app logo
  const branchImage =
    (order.inventory?.inventoriable as any)?.image_url ??
    (order.inventory?.inventoriable as any)?.image ??
    null;
  const effectiveLogoUrl = branchImage || logoUrl || "/dressnmore-logo.jpg";

  const { currency_symbol } = getOrderCurrencyInfo(order as any);
  const { totalWithVat } = getOrderTotalsWithVat(order as any);

  const paid = parseFloat(String((order as any).paid ?? 0).replace(/,/g, "")) || 0;
  const remaining =
    parseFloat(String((order as any).remaining ?? "").replace(/,/g, "")) ||
    Math.max(0, Math.round((totalWithVat - paid) * 100) / 100);

  return (
    <article
      dir="rtl"
      lang="ar"
      className="invoice-print-root w-full max-w-[148mm] min-h-[198mm] flex flex-col bg-white text-gray-800 text-[10px] leading-snug"
      style={{ fontFamily: "'Segoe UI', 'Cairo', Arial, sans-serif" }}
      itemScope
      itemType="https://schema.org/Invoice"
    >
      <meta itemProp="name" content={`فاتورة - طلب رقم ${order.id}`} />
      <meta itemProp="dateCreated" content={order.created_at} />
      
      <div className="invoice-print-top-date w-full px-2 pb-0.5 text-left text-[8px] text-gray-600" dir="ltr">
        تاريخ الطباعة: {printDate} - {printTime}
      </div>
      
      <header
        className="invoice-print-header w-full py-1.5 mb-1 text-white rounded-b shadow-sm"
        style={{ backgroundColor: HEADER_BG }}
        role="banner"
      >
        <div className="invoice-print-header-inner flex items-center justify-between gap-2 w-full px-2 min-h-8">
          <div className="invoice-print-header-right text-right shrink-0 space-y-0.5 text-[9px]">
            <div className="flex items-baseline justify-end gap-1 flex-wrap">
              <span className="invoice-header-label font-medium text-white/95">رقم الفاتورة: </span>
              <span className="invoice-header-label font-bold text-white" itemProp="identifier" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{order.id}</span>
            </div>
            <div className="invoice-header-line text-[8px] font-normal text-white/95">
              اسم الموظف:{" "}
              <span className="font-semibold">
                <OrderEmployeeName order={order} className="inline-block" />
              </span>
            </div>
            <div className="invoice-header-line text-[8px] font-normal text-white/95">
              التاريخ: <span className="font-semibold">{invoiceDate}</span>
            </div>
            <div className="invoice-header-line text-[8px] font-normal text-white/95">
              نوع الفاتورة: <span className="font-semibold">{getOrderTypeLabel(order.order_type)}</span>
            </div>
          </div>
          <div className="invoice-print-header-logo shrink-0 w-10 h-10 flex items-center justify-center rounded-full overflow-hidden bg-white shadow-md ring-2 ring-white/80">
            <img 
              src={effectiveLogoUrl} 
              alt="شعار الشركة" 
              className="invoice-logo-img w-full h-full object-cover"
              itemProp="image"
            />
          </div>
        </div>
      </header>

      <main className="invoice-print-content flex-1 flex flex-col w-full px-2 pb-1 min-h-0 overflow-hidden">

        <section className="invoice-print-section invoice-print-info-block mb-1" itemScope itemType="https://schema.org/Order">
          <h2 className="invoice-print-section-title text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-0.5 pb-0.5 border-b border-gray-200">بيانات الطلب</h2>
          <table className="invoice-print-table invoice-print-table-info w-full border-collapse overflow-hidden rounded border border-gray-200" style={{ tableLayout: "fixed" }}>
            <tbody>
              {INFO_ROWS.map(({ label }, i) => (
                <tr key={i} className={i % 2 === 0 ? "invoice-print-row-even bg-gray-50/80" : "bg-white"}>
                  <th scope="row" className="invoice-print-td border-b border-gray-100 py-1 px-2 text-gray-700 font-semibold text-[9px] text-right" style={{ width: "32%" }}>{label}</th>
                  <td className="invoice-print-td border-b border-gray-100 py-1 px-2 text-gray-900 font-normal text-[9px]" style={{ width: "68%", fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                    {(label === "هاتف العروسة" || label === "هاتف اضافي") && infoValues[i] !== "-" ? (
                      <span dir="ltr" className="inline-block text-right">{infoValues[i]}</span>
                    ) : (
                      infoValues[i] ?? "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="invoice-print-section mb-1">
          <h2 className="invoice-print-section-title text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-0.5 pb-0.5 border-b border-gray-200">تفاصيل الأصناف</h2>
          <table className="invoice-print-table invoice-print-table-items w-full border-collapse overflow-hidden rounded border border-gray-200" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "6%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "23%" }} />
              <col style={{ width: "23%" }} />
            </colgroup>
            <thead>
              <tr className="invoice-print-thead-row" style={{ backgroundColor: HEADER_DARK }}>
                <th scope="col" className="invoice-print-th py-1 px-1 text-center font-bold text-white text-[8px]">الرقم</th>
                <th scope="col" className="invoice-print-th py-1 px-1 text-center font-bold text-white text-[8px]">المنتج الفرعي</th>
                <th scope="col" className="invoice-print-th py-1 px-1 text-center font-bold text-white text-[8px]">كود المنتج</th>
                <th scope="col" className="invoice-print-th py-1 px-1 text-center font-bold text-white text-[8px]">سعر القطعة</th>
                <th scope="col" className="invoice-print-th py-1 px-1 text-center font-bold text-white text-[8px]">المدفوع</th>
                <th scope="col" className="invoice-print-th py-1 px-1 text-center font-bold text-white text-[8px]">المتبقي</th>
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
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-1 px-1 text-center text-[9px] font-medium" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{index + 1}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-1 px-1 text-center text-[9px] font-normal">
                        {getItemSubcategoryDisplay(item as Record<string, any>) || "-"}
                      </td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-1 px-1 text-center text-[9px] font-normal" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{item.code || "-"}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-1 px-1 text-center text-[9px] font-semibold" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{showPrices ? price : EMPTY_PRICE}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-1 px-1 text-center text-[9px] font-semibold" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{showPrices ? itemPaidVal : EMPTY_PRICE}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-1 px-1 text-center text-[9px] font-semibold" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{showPrices ? itemRemainingVal : EMPTY_PRICE}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="invoice-print-td invoice-print-td-center py-2 px-2 text-center text-gray-500 text-[9px] font-normal">
                    لا توجد عناصر
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {!hideItemPrices && (
        <section className="invoice-print-section mb-1">
          <h2 className="invoice-print-section-title text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-0.5 pb-0.5 border-b border-gray-200">
            ملخص الفاتورة
          </h2>
          <table className="invoice-print-table w-full border-collapse overflow-hidden rounded border border-gray-200">
            <tbody>
              <tr className="bg-gray-50/80">
                <th
                  scope="row"
                  className="invoice-print-td border-b border-gray-100 py-1 px-2 text-gray-700 font-semibold text-[9px] text-right"
                  style={{ width: "40%" }}
                >
                  السعر
                </th>
                <td
                  className="invoice-print-td border-b border-gray-100 py-1 px-2 text-gray-900 font-semibold text-[9px]"
                  style={{
                    width: "60%",
                    fontVariantNumeric: "tabular-nums",
                    fontFamily: "'Segoe UI', Arial, sans-serif",
                  }}
                  dir="ltr"
                >
                  {totalWithVat.toLocaleString()} {currency_symbol}
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="invoice-print-td border-b border-gray-100 py-1 px-2 text-gray-700 font-semibold text-[9px] text-right"
                >
                  المدفوع
                </th>
                <td
                  className="invoice-print-td border-b border-gray-100 py-1 px-2 text-gray-900 font-semibold text-[9px]"
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    fontFamily: "'Segoe UI', Arial, sans-serif",
                  }}
                  dir="ltr"
                >
                  {paid.toLocaleString()} {currency_symbol}
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="invoice-print-td py-1 px-2 text-gray-700 font-semibold text-[9px] text-right"
                >
                  المتبقي
                </th>
                <td
                  className="invoice-print-td py-1 px-2 text-gray-900 font-semibold text-[9px]"
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    fontFamily: "'Segoe UI', Arial, sans-serif",
                  }}
                  dir="ltr"
                >
                  {remaining.toLocaleString()} {currency_symbol}
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        )}

        {hasAnyMeasurements(items) && (() => {
          const activeMeasurementKeys = MEASUREMENT_LABELS.filter(({ key }) =>
            items.some(item => (item as Record<string, any>)[key] != null && String((item as Record<string, any>)[key]).trim() !== "")
          );
          const itemColWidth = 38;
          const measureColWidth = activeMeasurementKeys.length > 0 ? (100 - itemColWidth) / activeMeasurementKeys.length : 0;
          return (
          <section className="invoice-print-section invoice-print-block invoice-print-measurements-section mb-1">
            <h2 className="invoice-print-section-title text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1 pb-1 border-b border-gray-200">جدول المقاسات</h2>
            <div className="invoice-print-measurements-wrap overflow-hidden rounded border border-gray-200">
              <table className="invoice-print-table invoice-print-table-measurements w-full border-collapse" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: `${itemColWidth}%` }} />
                  {activeMeasurementKeys.map(({ key }) => (
                    <col key={key} style={{ width: `${measureColWidth}%` }} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="invoice-print-thead-row invoice-print-measurements-thead" style={{ backgroundColor: HEADER_DARK }}>
                    <th scope="col" className="invoice-print-th invoice-print-mth invoice-print-mth-item py-1 px-2 text-center font-bold text-white text-[7px] border-b border-white/20">الصنف / الكود</th>
                    {activeMeasurementKeys.map(({ key, label }) => (
                      <th key={key} scope="col" className="invoice-print-th invoice-print-mth py-1 px-1 text-center font-bold text-white text-[7px] border-b border-l border-white/20 whitespace-nowrap">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? "invoice-print-row-even invoice-print-mrow bg-gray-50/80" : "invoice-print-mrow bg-white"}>
                        <td className="invoice-print-td invoice-print-mtd invoice-print-mtd-item border-b border-gray-200 py-1 px-2 text-center text-[8px] font-semibold text-gray-800">{item.code || (item as { name?: string }).name || "-"}</td>
                        {activeMeasurementKeys.map(({ key }) => (
                          <td key={key} className="invoice-print-td invoice-print-mtd border-b border-l border-gray-100 py-1 px-1 text-center text-[8px] font-normal" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                            {(item as Record<string, any>)[key] != null && String((item as Record<string, any>)[key]).trim() !== ""
                              ? String((item as Record<string, any>)[key]).trim()
                              : "—"}
                          </td>
                        ))}
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          ); })() }

        {order.order_notes?.trim() && (
          <section className="invoice-print-section invoice-print-block mb-1">
            <h2 className="invoice-print-section-title text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1 pb-1 border-b border-gray-200">ملاحظات العميل</h2>
            <div className="invoice-print-notes-box rounded border border-gray-200 bg-gray-50/50 py-2 px-2 min-h-[24px] text-gray-800 text-[9px] font-normal">
              {order.order_notes.trim()}
            </div>
          </section>
        )}



        <section className="invoice-print-signature flex justify-end mt-auto pt-1 border-t border-gray-300 shrink-0">
          <div className="invoice-print-signature-box text-left min-w-[80px]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 text-[9px]">التوقيع:</span>
              <span className="inline-block min-w-[60px] h-4 border-b border-gray-400">&nbsp;</span>
            </div>
          </div>
        </section>
      </main>

      <footer
        className="invoice-print-footer w-full py-1 px-2 text-center text-white rounded-t text-[8px] font-semibold shrink-0 min-w-0"
        style={{ backgroundColor: HEADER_BG }}
        role="contentinfo"
      >
        <span className="block">لا يرد العربون في حالة إلغاء الحجز</span><br />
        <span className="block mt-0.5">يجب إحضار الفاتورة الأصلية مع البطاقة الشخصية عند الإرجاع أو الاستلام أو الاستبدال.</span>
      </footer>

      <style>{`
  /* page size */
  @page {
    size: A5 portrait;
    margin: 4mm;
  }
  
  @media print {
    body * { visibility: hidden; }
    .invoice-print-root, 
    .invoice-print-root * { visibility: visible; }
    
    .invoice-print-root {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      max-width: 148mm;
      height: 202mm !important;
      min-height: 0 !important;
      padding: 0;
      margin: 0 auto;
      box-sizing: border-box;
      page-break-inside: avoid !important;
      page-break-after: avoid !important;
      page-break-before: avoid !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      direction: rtl !important;
      text-align: right !important;
      background: white;
      box-shadow: none;
      overflow: hidden;
    }
    
    .invoice-print-header-inner,
    .invoice-print-content {
      max-width: 138mm;
      margin: 0 auto;
      padding: 0 3mm;
      width: 100%;
      box-sizing: border-box;
    }
    
    .invoice-print-root {
      display: flex !important;
      flex-direction: column !important;
    }
    
    .invoice-print-content {
      flex: 1 !important;
      display: flex !important;
      flex-direction: column !important;
      height: auto !important;
      max-height: none !important;
    }
    
    * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      direction: rtl !important;
      text-align: right !important;
      font-family: 'Segoe UI', 'Cairo', Arial, sans-serif !important;
    }
    
    [dir="ltr"], 
    [dir="ltr"] * {
      direction: ltr !important;
      text-align: left !important;
    }
    
    .invoice-print-top-date {
      font-size: 8px !important;
      color: #4b5563 !important;
      padding: 0 2mm 0.5mm !important;
      text-align: left !important;
      direction: ltr !important;
    }
    
    .invoice-print-header { 
      padding: 1mm 0 !important; 
      margin-bottom: 1mm !important;
      background-color: #5170ff !important;
      border-radius: 2mm !important;
      flex-shrink: 0 !important;
    }
    
    .invoice-print-header-inner { 
      padding: 0 2mm !important; 
      gap: 2mm !important; 
      min-height: 12mm !important; 
    }
    
    .invoice-print-header .invoice-header-label, 
    .invoice-print-header .invoice-header-line { 
      font-size: 9px !important; 
      color: rgba(255,255,255,0.95) !important;
    }
    
    .invoice-print-header-logo { 
      width: 12mm !important; 
      height: 12mm !important; 
      min-width: 12mm !important;
      min-height: 12mm !important;
      padding: 0 !important; 
      background: #fff !important;
      border-radius: 50% !important;
      overflow: hidden !important;
      box-shadow: 0 2px 6px rgba(0,0,0,0.12) !important;
      border: 1.5px solid rgba(255,255,255,0.9) !important;
    }
    
    .invoice-logo-img { 
      width: 100% !important; 
      height: 100% !important; 
      object-fit: cover !important; 
    }
    
    .invoice-print-section-title {
      font-size: 10px !important;
      font-weight: 700 !important;
      color: #4b5563 !important;
      letter-spacing: 0.5px !important;
      margin-bottom: 1mm !important;
      padding-bottom: 0.5mm !important;
      border-bottom: 1.5px solid #e5e7eb !important;
    }
    
    .invoice-print-info-block { 
      margin-bottom: 1mm !important; 
      flex-shrink: 0 !important;
    }
    
    .invoice-print-table-info {
      border: 1px solid #e5e7eb !important;
      border-radius: 2mm !important;
      overflow: hidden !important;
    }
    
    .invoice-print-table-info .invoice-print-td { 
      padding: 0.75mm 1mm !important; 
      font-size: 9px !important; 
      border-bottom: 1px solid #f3f4f6 !important;
    }
    
    .invoice-print-table-info th {
      background: #f9fafb !important;
      font-weight: 600 !important;
      color: #1f2937 !important;
    }
    
    .invoice-print-section.mb-5 {
      margin-bottom: 2mm !important;
      flex-shrink: 0 !important;
    }
    
    .invoice-print-table-items {
      border: 1px solid #e5e7eb !important;
      border-radius: 2mm !important;
      overflow: hidden !important;
    }
    
    .invoice-print-table-items .invoice-print-th {
      background: #3f5ae0 !important;
      color: white !important;
      padding: 1mm 0.5mm !important;
      font-size: 8px !important;
      font-weight: 700 !important;
      text-align: center !important;
    }
    
    .invoice-print-table-items .invoice-print-td {
      padding: 0.5mm 0.5mm !important;
      font-size: 8px !important;
      border-bottom: 1px solid #f3f4f6 !important;
      text-align: center !important;
    }
    
    .invoice-print-row-even {
      background: #f9fafb !important;
    }
    
    .invoice-print-measurements-section {
      margin-bottom: 1mm !important;
      flex-shrink: 0 !important;
    }
    
    .invoice-print-measurements-wrap {
      border: 1px solid #e5e7eb !important;
      border-radius: 2mm !important;
      overflow: hidden !important;
    }
    
    .invoice-print-measurements-thead th {
      background: #3f5ae0 !important;
      color: white !important;
      padding: 0.75mm 0.5mm !important;
      font-size: 7px !important;
      font-weight: 700 !important;
      border-left: 1px solid rgba(255,255,255,0.2) !important;
      text-align: center !important;
    }
    
    .invoice-print-mth-item { 
      border-left: none !important; 
    }
    
    .invoice-print-mtd {
      padding: 0.75mm 0.5mm !important;
      font-size: 7px !important;
      border-bottom: 1px solid #f3f4f6 !important;
      text-align: center !important;
    }
    
    .invoice-print-mtd-item {
      font-weight: 600 !important;
      background: #f9fafb !important;
    }
    
    .invoice-print-mrow td.invoice-print-mtd { 
      border-left: 1px solid #f3f4f6 !important; 
    }
    
    .invoice-print-notes-box {
      border: 1px solid #e5e7eb !important;
      border-radius: 2mm !important;
      background: #f9fafb !important;
      padding: 1mm 1.5mm !important;
      font-size: 8px !important;
      color: #1f2937 !important;
      min-height: 6mm !important;
    }
    

    
    .invoice-print-rules-text {
      border: 1px solid #e5e7eb !important;
      border-radius: 2mm !important;
      background: #f9fafb !important;
    }
    
    .invoice-print-rules-p {
      padding: 1.5mm 2mm !important;
      font-size: 9px !important;
      line-height: 1.5 !important;
      color: #374151 !important;
      white-space: pre-line !important;
    }
    
    .invoice-print-signature {
      margin-top: 0 !important;
      padding-top: 1mm !important;
      border-top: 1px solid #d1d5db !important;
      flex-shrink: 0 !important;
    }
    
    .invoice-print-signature-box > div {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: 3mm !important;
    }
    
    .invoice-print-signature-box span.font-semibold {
      font-size: 10px !important;
      color: #374151 !important;
    }
    
    .invoice-print-signature-box span[class*="min-w"] {
      min-width: 45mm !important;
      height: 4mm !important;
      display: inline-block !important;
      border-bottom: 1px solid #9ca3af !important;
    }
    
    .invoice-print-footer {
      background: #5170ff !important;
      color: white !important;
      padding: 1mm 2mm !important;
      font-size: 8px !important;
      font-weight: 600 !important;
      text-align: center !important;
      border-radius: 2mm 2mm 0 0 !important;
      margin-top: auto !important;
      page-break-before: avoid !important;
      line-height: 1.4 !important;
      flex-shrink: 0 !important;
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
    }
    
    .invoice-print-root {
      page-break-after: avoid !important;
    }
    .invoice-print-signature,
    .invoice-print-footer {
      page-break-before: avoid !important;
    }
    
    [style*="font-variant-numeric: tabular-nums"] {
      font-feature-settings: "tnum" !important;
    }
    
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }
    
    .invoice-print-table-items tbody tr:last-child td {
      border-bottom: none !important;
    }
    
    .invoice-print-table-measurements tbody tr:last-child td {
      border-bottom: none !important;
    }
    
    .invoice-print-td,
    .invoice-print-th {
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      white-space: normal !important;
    }
    
    .invoice-print-row-even {
      background: #f9fafb !important;
    }
  }
`}</style>
    </article>
  );
}

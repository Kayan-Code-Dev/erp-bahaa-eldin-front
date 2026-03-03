import { TOrder } from "@/api/v2/orders/orders.types";
import { getOrderTypeLabel } from "@/api/v2/orders/order.utils";
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

  // Branch logo: use branch image if available, otherwise fallback to app logo
  const branchImage =
    (order.inventory?.inventoriable as any)?.image_url ??
    (order.inventory?.inventoriable as any)?.image ??
    null;
  const effectiveLogoUrl = branchImage || logoUrl;

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
              <span className="invoice-header-label text-sm font-bold text-white" itemProp="identifier" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{order.id}</span>
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
          <div className="invoice-print-header-logo shrink-0 h-18 flex items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-white/60 px-4 py-2">
            <img 
              src={effectiveLogoUrl} 
              alt="شعار الشركة" 
              className="invoice-logo-img h-14 max-h-full max-w-[150px] w-auto object-contain"
              itemProp="image"
            />
          </div>
        </div>
      </header>

      <main className="invoice-print-content flex-1 flex flex-col w-full px-4 pb-4">

        <section className="invoice-print-section invoice-print-info-block mb-5" itemScope itemType="https://schema.org/Order">
          <h2 className="invoice-print-section-title text-xs font-bold text-gray-600 uppercase tracking-wider mb-2.5 pb-2 border-b-2 border-gray-200">بيانات الطلب</h2>
          <table className="invoice-print-table invoice-print-table-info w-full border-collapse overflow-hidden rounded-xl border border-gray-200 shadow-sm" style={{ tableLayout: "fixed" }}>
            <tbody>
              {INFO_ROWS.map(({ label }, i) => (
                <tr key={i} className={i % 2 === 0 ? "invoice-print-row-even bg-gray-50/80" : "bg-white"}>
                  <th scope="row" className="invoice-print-td border-b border-gray-100 py-2.5 px-4 text-gray-700 font-semibold text-sm text-right" style={{ width: "32%" }}>{label}</th>
                  <td className="invoice-print-td border-b border-gray-100 py-2.5 px-4 text-gray-900 font-normal text-sm" style={{ width: "68%", fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
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

        <section className="invoice-print-section mb-5">
          <h2 className="invoice-print-section-title text-xs font-bold text-gray-600 uppercase tracking-wider mb-2.5 pb-2 border-b-2 border-gray-200">تفاصيل الأصناف</h2>
          <table className="invoice-print-table invoice-print-table-items w-full border-collapse overflow-hidden rounded-xl border border-gray-200 shadow-sm" style={{ tableLayout: "fixed" }}>
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
                <th scope="col" className="invoice-print-th py-3 px-2 text-center font-bold text-white text-sm">الرقم</th>
                <th scope="col" className="invoice-print-th py-3 px-2 text-center font-bold text-white text-sm">نوع المنتج</th>
                <th scope="col" className="invoice-print-th py-3 px-2 text-center font-bold text-white text-sm">كود المنتج</th>
                <th scope="col" className="invoice-print-th py-3 px-2 text-center font-bold text-white text-sm">سعر القطعة</th>
                <th scope="col" className="invoice-print-th py-3 px-2 text-center font-bold text-white text-sm">المدفوع</th>
                <th scope="col" className="invoice-print-th py-3 px-2 text-center font-bold text-white text-sm">المتبقي</th>
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
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-2.5 px-3 text-center text-sm font-medium" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{index + 1}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-2.5 px-3 text-center text-sm font-normal">{getOrderTypeLabel(item.type)}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-2.5 px-3 text-center text-sm font-normal" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{item.code || "-"}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-2.5 px-3 text-center text-sm font-semibold" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{showPrices ? price : EMPTY_PRICE}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-2.5 px-3 text-center text-sm font-semibold" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{showPrices ? itemPaidVal : EMPTY_PRICE}</td>
                      <td className="invoice-print-td invoice-print-td-center border-b border-gray-100 py-2.5 px-3 text-center text-sm font-semibold" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{showPrices ? itemRemainingVal : EMPTY_PRICE}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="invoice-print-td invoice-print-td-center py-4 px-3 text-center text-gray-500 text-sm font-normal">
                    لا توجد عناصر
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {hasAnyMeasurements(items) && (() => {
          const activeMeasurementKeys = MEASUREMENT_LABELS.filter(({ key }) =>
            items.some(item => (item as Record<string, any>)[key] != null && String((item as Record<string, any>)[key]).trim() !== "")
          );
          const itemColWidth = 38;
          const measureColWidth = activeMeasurementKeys.length > 0 ? (100 - itemColWidth) / activeMeasurementKeys.length : 0;
          return (
          <section className="invoice-print-section invoice-print-block invoice-print-measurements-section mb-5">
            <h2 className="invoice-print-section-title text-xs font-bold text-gray-600 uppercase tracking-wider mb-2.5 pb-2 border-b-2 border-gray-200">جدول المقاسات</h2>
            <div className="invoice-print-measurements-wrap overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table className="invoice-print-table invoice-print-table-measurements w-full border-collapse" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: `${itemColWidth}%` }} />
                  {activeMeasurementKeys.map(({ key }) => (
                    <col key={key} style={{ width: `${measureColWidth}%` }} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="invoice-print-thead-row invoice-print-measurements-thead" style={{ backgroundColor: HEADER_DARK }}>
                    <th scope="col" className="invoice-print-th invoice-print-mth invoice-print-mth-item py-2.5 px-3 text-center font-bold text-white text-xs border-b border-white/20">الصنف / الكود</th>
                    {activeMeasurementKeys.map(({ key, label }) => (
                      <th key={key} scope="col" className="invoice-print-th invoice-print-mth py-2 px-1.5 text-center font-bold text-white text-xs border-b border-l border-white/20 whitespace-nowrap">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? "invoice-print-row-even invoice-print-mrow bg-gray-50/80" : "invoice-print-mrow bg-white"}>
                        <td className="invoice-print-td invoice-print-mtd invoice-print-mtd-item border-b border-gray-200 py-2 px-3 text-center text-xs font-semibold text-gray-800">{item.code || (item as { name?: string }).name || "-"}</td>
                        {activeMeasurementKeys.map(({ key }) => (
                          <td key={key} className="invoice-print-td invoice-print-mtd border-b border-l border-gray-100 py-2 px-2 text-center text-xs font-normal" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
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
          <section className="invoice-print-section invoice-print-block mb-5">
            <h2 className="invoice-print-section-title text-xs font-bold text-gray-600 uppercase tracking-wider mb-2.5 pb-2 border-b-2 border-gray-200">ملاحظات العميل</h2>
            <div className="invoice-print-notes-box rounded-xl border border-gray-200 bg-gray-50/50 py-3 px-4 min-h-[40px] text-gray-800 text-sm font-normal shadow-sm">
              {order.order_notes.trim()}
            </div>
          </section>
        )}



        <section className="invoice-print-signature flex justify-end mt-5 pt-5 border-t-2 border-gray-300">
          <div className="invoice-print-signature-box text-left min-w-[160px]">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700 text-sm">التوقيع:</span>
              <span className="inline-block min-w-[200px] h-6">&nbsp;</span>
            </div>
          </div>
        </section>
      </main>

      <footer
        className="invoice-print-footer w-full mt-auto py-3 px-4 text-center text-white rounded-t-lg text-sm font-semibold shadow-md shrink-0"
        style={{ backgroundColor: HEADER_BG }}
        role="contentinfo"
      >
        لا يرد العربون في حالة الغاء الحجز
        <br/>
        يجب إحضار الفاتورة الأصلية مع البطاقة الشخصية عند الإرجاع أو الاستلام أو الاستبدال.
      </footer>

      <style>{`
  /* ===== تعريف حجم الصفحة ===== */
  @page {
    size: A5;
    margin: 5mm;
  }
  
  @media print {
    /* ===== إخفاء كل شيء خارج الفاتورة ===== */
    body * { visibility: hidden; }
    .invoice-print-root, 
    .invoice-print-root * { visibility: visible; }
    
    /* ===== الحاوية الرئيسية ===== */
    .invoice-print-root {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      max-width: 148mm;
      height: 210mm !important;        /* ارتفاع ثابت بدلاً من min-height */
      min-height: 0 !important;         /* إلغاء min-height */
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
      overflow: hidden;                /* منع التدفق إلى صفحة جديدة */
    }
    
    /* ===== المحتوى الداخلي ===== */
    .invoice-print-header-inner,
    .invoice-print-content {
      max-width: 138mm;
      margin: 0 auto;
      padding: 0 3mm;
      width: 100%;
      box-sizing: border-box;
    }
    
    /* ===== جعل المحتوى يملأ الصفحة بالكامل ===== */
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
    
    /* ===== تنسيقات عامة ===== */
    * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      direction: rtl !important;
      text-align: right !important;
      font-family: 'Segoe UI', 'Cairo', Arial, sans-serif !important;
    }
    
    /* ===== العناصر الإنجليزية ===== */
    [dir="ltr"], 
    [dir="ltr"] * {
      direction: ltr !important;
      text-align: left !important;
    }
    
    /* ===== الهيدر ===== */
    .invoice-print-header { 
      padding: 1.5mm 0 !important; 
      margin-bottom: 2mm !important;
      background-color: #5170ff !important;
      border-radius: 2mm !important;
      flex-shrink: 0 !important;        /* منع التقلص */
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
      padding: 0.5mm !important; 
      height: 12mm !important; 
      background: rgba(255,255,255,0.1) !important;
      border-radius: 1.5mm !important;
    }
    
    .invoice-logo-img { 
      max-height: 100% !important; 
      max-width: 35mm !important; 
      object-fit: contain !important; 
    }
    
    /* ===== عناوين الأقسام ===== */
    .invoice-print-section-title {
      font-size: 10px !important;
      font-weight: 700 !important;
      color: #4b5563 !important;
      letter-spacing: 0.5px !important;
      margin-bottom: 1mm !important;
      padding-bottom: 0.5mm !important;
      border-bottom: 1.5px solid #e5e7eb !important;
    }
    
    /* ===== جدول البيانات ===== */
    .invoice-print-info-block { 
      margin-bottom: 2mm !important; 
      flex-shrink: 0 !important;
    }
    
    .invoice-print-table-info {
      border: 1px solid #e5e7eb !important;
      border-radius: 2mm !important;
      overflow: hidden !important;
    }
    
    .invoice-print-table-info .invoice-print-td { 
      padding: 1mm 1.5mm !important; 
      font-size: 9px !important; 
      border-bottom: 1px solid #f3f4f6 !important;
    }
    
    .invoice-print-table-info th {
      background: #f9fafb !important;
      font-weight: 600 !important;
      color: #1f2937 !important;
    }
    
    /* ===== جدول الأصناف ===== */
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
      padding: 0.75mm 0.5mm !important;
      font-size: 8px !important;
      border-bottom: 1px solid #f3f4f6 !important;
      text-align: center !important;
    }
    
    .invoice-print-row-even {
      background: #f9fafb !important;
    }
    
    /* ===== جدول المقاسات ===== */
    .invoice-print-measurements-section {
      page-break-inside: avoid !important;
      margin-bottom: 2mm !important;
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
    
    /* ===== ملاحظات العميل ===== */
    .invoice-print-notes-box {
      border: 1px solid #e5e7eb !important;
      border-radius: 2mm !important;
      background: #f9fafb !important;
      padding: 1.5mm 2mm !important;
      font-size: 9px !important;
      color: #1f2937 !important;
      min-height: 8mm !important;
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
    
    /* ===== التوقيع ===== */
    .invoice-print-signature {
      margin-top: 1mm !important;
      padding-top: 1mm !important;
      border-top: 2px solid #d1d5db !important;
      page-break-inside: avoid !important;
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
    
    /* ===== الفوتر ===== */
    .invoice-print-footer {
      background: #5170ff !important;
      color: white !important;
      padding: 1.5mm 3mm !important;
      font-size: 9px !important;
      font-weight: 600 !important;
      text-align: center !important;
      border-radius: 2mm 2mm 0 0 !important;
      margin-top: auto !important;       /* دفع الفوتر للأسفل */
      page-break-inside: avoid !important;
      line-height: 1.6 !important;
      flex-shrink: 0 !important;
    }
    
    /* ===== منع التقسيم بين الصفحات ===== */
    .invoice-print-section,
    .invoice-print-table,
    .invoice-print-measurements-section,
    .invoice-print-notes-box,
    .invoice-print-rules-text,
    .invoice-print-signature,
    .invoice-print-footer {
      page-break-inside: avoid !important;
      page-break-after: avoid !important;
      page-break-before: avoid !important;
    }
    
    /* ===== تحسين ظهور الأرقام ===== */
    [style*="font-variant-numeric: tabular-nums"] {
      font-feature-settings: "tnum" !important;
    }
    
    /* ===== إخفاء العناصر غير الضرورية ===== */
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
    
    /* ===== تحسين الظهور في حالة وجود أكثر من صنف ===== */
    .invoice-print-table-items tbody tr:last-child td {
      border-bottom: none !important;
    }
    
    .invoice-print-table-measurements tbody tr:last-child td {
      border-bottom: none !important;
    }
    
    /* ===== ضمان عدم تجاوز المحتوى ===== */
    .invoice-print-td,
    .invoice-print-th {
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      white-space: normal !important;
    }
    
    /* ===== تحسين التباعد للصفوف الفردية ===== */
    .invoice-print-row-even {
      background: #f9fafb !important;
    }
  }
`}</style>
    </article>
  );
}

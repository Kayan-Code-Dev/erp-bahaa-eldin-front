import { TOrder } from "@/api/v2/orders/orders.types";
import { OrderEmployeeName } from "@/components/custom/OrderEmployeeName";
import { formatPhone } from "@/utils/formatPhone";

const HEADER_BG = "#907457";

/** Receipt acknowledgment rules and instructions — at the bottom of the page */
const RULES_ITEMS = [
  "• ميعاد استلام الفستان من 1 ظهراً حتى 7 مساءً وإحضار 2000 جنيه تأمين للزفاف و 500 للسواريه.",
  "• لا يمكن استرجاع أو استبدال الفساتين بعد مرور 3 أيام من تاريخ الشراء إلا في حالة وجود عيب مصنعي.",
  "• يجب إحضار الفاتورة الأصلية مع البطاقة الشخصية عند الإرجاع أو الاستلام أو الاستبدال.",
];

type Props = {
  order: TOrder;
  logoUrl?: string;
};

function formatDate(s: string): string {
  if (!s) return "-";
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return s;
  }
}

export function OrderReceiptAckPrint({
  order,
  logoUrl = "/app-logo.svg",
}: Props) {
  const c = order.client;
  const clientName = c?.name?.trim() || "-";
  const nationalId = (c as { national_id?: string })?.national_id ?? "-";
  const addressStr = c?.address
    ? [c.address.street, c.address.building].filter(Boolean).join(" - ") || "-"
    : "-";
  const phones = c?.phones?.filter(p => p.phone?.trim()) || [];
  const phoneStr = phones.length > 0
    ? phones.map(p => {
      const phoneType = p.type === 'mobile' ? 'موبايل' : p.type === 'whatsapp' ? 'واتساب' : p.type || 'هاتف';
      const num = formatPhone(p.phone, "");
      return num ? `${num} (${phoneType})` : "";
    }).filter(Boolean).join(" - ")
    : null;
  const items = order.items ?? [];
  const startDate = order.visit_datetime ? formatDate(order.visit_datetime) : "-";
  const endDate = order.delivery_date
    ? formatDate(order.delivery_date)
    : (items[0] as { delivery_date?: string })?.delivery_date
      ? formatDate((items[0] as { delivery_date: string }).delivery_date)
      : "-";
  const paid = order.paid != null ? String(order.paid) : "-";
  const invoiceDate = order.created_at ? formatDate(order.created_at) : "-";

  return (
    <article
      dir="rtl"
      lang="ar"
      className="invoice-print-root w-full min-h-screen flex flex-col bg-white text-gray-900 text-[12px] leading-relaxed"
      style={{ fontFamily: "'Cairo', 'Segoe UI', Arial, sans-serif" }}
      itemScope
      itemType="https://schema.org/Receipt"
    >
      <meta itemProp="name" content={`إقرار استلام - طلب رقم ${order.id}`} />
      <meta itemProp="dateCreated" content={order.created_at} />

      {/* Header — minimized for A5 */}
      <header
        className="invoice-print-header w-full py-2 mb-2 text-white rounded-b-lg shadow-sm"
        style={{ backgroundColor: HEADER_BG }}
        role="banner"
      >
        <div className="invoice-print-header-inner flex items-center justify-between gap-4 max-w-[148mm] mx-auto px-4">
          <div className="invoice-print-header-right text-right shrink-0 space-y-0.5 text-[11px]">
            <div className="flex items-baseline justify-end gap-2 flex-wrap">
              <span className="text-white/95 font-medium">رقم الفاتورة:</span>
              <span className="font-bold text-white" itemProp="identifier" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{order.id}</span>
            </div>
            <div className="text-white/95 font-medium">
              اسم الموظف:{" "}
              <span className="font-semibold">
                <OrderEmployeeName order={order} className="inline-block" />
              </span>
            </div>
            <div className="text-white/95 font-medium">
              التاريخ: <span className="font-semibold">{invoiceDate}</span>
            </div>
          </div>
          <div className="invoice-print-header-logo shrink-0 bg-white/10 rounded-lg p-1.5 flex items-center justify-center">
            <img
              src={logoUrl}
              alt="شعار الشركة"
              className="invoice-logo-img max-h-10 w-auto object-contain"
              itemProp="image"
            />
          </div>
        </div>
      </header>

      <main className="invoice-print-content flex-1 flex flex-col min-h-0 max-w-[148mm] mx-auto px-4 pb-2 w-full">
        {/* Content from title to signature */}
        <section className="invoice-print-body shrink-0">
          {/* 1. Receipt acknowledgment title — at the top */}
          <header className="invoice-print-title-wrap flex flex-col items-center justify-center text-center mb-3">
            <h1 className="invoice-print-title text-[20px] font-bold text-gray-900 tracking-tight mb-1">
              إقرار استلام
            </h1>
            <span className="invoice-print-title-line mt-1 block h-0.5 w-20 rounded-full bg-gray-400" aria-hidden />
          </header>

          {/* 2. I received / National ID / Resident in / Phone — from the right */}
          <section className="invoice-print-recipient text-right mb-3 space-y-1 text-[12px]" itemScope itemType="https://schema.org/Person">
            <p className="text-gray-900">
              <span className="font-semibold text-gray-700">استلمت أنا :</span>{" "}
              <span className="font-bold text-gray-900" itemProp="name">{clientName}</span>
            </p>
            <p className="text-gray-900">
              <span className="font-semibold text-gray-700">الرقم القومي :</span>{" "}
              <span className="font-normal text-gray-900" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{nationalId}</span>
            </p>
            <p className="text-gray-900">
              <span className="font-semibold text-gray-700">المقيم في :</span>{" "}
              <span className="font-normal text-gray-900" itemProp="address">{addressStr}</span>
            </p>
            {phoneStr && (
              <p className="text-gray-900">
                <span className="font-semibold text-gray-700">رقم الهاتف :</span>{" "}
                <span dir="ltr" className="font-normal text-gray-900 inline-block text-right" itemProp="telephone" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{phoneStr}</span>
              </p>
            )}
          </section>

          {/* 3. Numbered products list */}
          <section className="invoice-print-items-list mb-3 text-[12px] text-gray-900">
            <h2 className="sr-only">قائمة المنتجات</h2>
            {items.length > 0 ? (
              <ol className="list-decimal list-inside space-y-0.5" itemProp="itemListElement" itemScope itemType="https://schema.org/ItemList">
                {items.map((item) => (
                  <li key={item.id} className="font-medium" itemProp="itemListElement" itemScope itemType="https://schema.org/Product">
                    <span itemProp="name">{(item as { name?: string }).name ?? item.code ?? "-"}</span>
                    {item.code && (
                      <span className="text-gray-600 font-normal"> ({item.code})</span>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-500 font-normal">—</p>
            )}
          </section>

          {/* 4. Rental period */}
          <p className="invoice-print-rental text-[12px] text-gray-900 mb-2">
            وذلك بتأجيره من تاريخ{" "}
            <time className="font-semibold" dateTime={order.visit_datetime || undefined}>{startDate}</time> حتى تاريخ{" "}
            <time className="font-semibold" dateTime={order.delivery_date || undefined}>{endDate}</time>
          </p>

          {/* 5. Receipt acknowledgment and deposit payment */}
          <p className="invoice-print-deposit text-[12px] text-gray-900 mb-3">
            وذلك إقرار مني بالاستلام ودفع عربون وقدره :{" "}
            <span className="font-bold text-gray-900" itemProp="totalPaymentDue" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Segoe UI', Arial, sans-serif" }}>{paid} ج.م</span>
          </p>

          {/* 6. Recipient and signature */}
          <section className="invoice-print-signature flex justify-end mt-3 pt-3 border-t-2 border-gray-300">
            <div className="invoice-print-signature-box text-right min-w-[180px] space-y-2 text-[12px] text-gray-900">
              <p className="flex items-center justify-end gap-3">
                <span className="font-semibold text-gray-700">المستلم:</span>
                <span className="inline-block min-w-[150px] h-5 border-b border-gray-400">&nbsp;</span>
              </p>
              <p className="flex items-center justify-end gap-3">
                <span className="font-semibold text-gray-700">التوقيع:</span>
                <span className="inline-block min-w-[150px] h-5 border-b border-gray-400">&nbsp;</span>
              </p>
            </div>
          </section>
        </section>

        {/* 7. Rules and instructions — fixed at the bottom of the page */}
        <aside className="invoice-print-rules mt-auto pt-3 pb-4 border-t-2 border-gray-200 shrink-0">
          <h2 className="invoice-print-rules-title text-[12px] font-bold text-gray-800 mb-1 pb-1">
            القواعد والتعليمات
          </h2>
          <div className="invoice-print-notes-box rounded-lg border border-gray-200 bg-gray-50 py-2 px-3">
            <ul className="list-none space-y-1.5 text-[11px] text-gray-800 leading-relaxed">
              {RULES_ITEMS.map((text, i) => (
                <li key={i} className="font-normal">
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>

      {/* Footer — minimized for A5 */}
      <footer
        className="invoice-print-footer w-full mt-auto py-2 px-3 text-center text-white rounded-t-md text-[11px] font-semibold shadow-md shrink-0"
        style={{ backgroundColor: HEADER_BG }}
        role="contentinfo"
      >
        لا يرد العربون في حالة الغاء الحجز • يجب إحضار الفاتورة الأصلية مع البطاقة الشخصية
      </footer>

      <style>{`
        @page {
          size: A5;
          margin: 5mm;
        }
        @media print {
          body * { visibility: hidden; }
          .invoice-print-root, .invoice-print-root * { visibility: visible; }
          .invoice-print-root { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 148mm;
            min-height: 210mm;
            padding: 0; 
            margin: 0;
            box-sizing: border-box; 
            page-break-inside: avoid;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .invoice-print-header, .invoice-print-footer { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
          /* Ensure proper font rendering */
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
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
          /* Improve spacing for A5 */
          .invoice-print-notes-box ul {
            display: flex !important;
            flex-direction: column !important;
            gap: 4px !important;
          }
          .invoice-print-signature-box span[class*="border-b"] {
            min-width: 150px !important;
            height: 20px !important;
          }
        }
      `}</style>
    </article>
  );
}
import { TOrder } from "@/api/v2/orders/orders.types";
import { OrderEmployeeName } from "@/components/custom/OrderEmployeeName";

const HEADER_BG = "#907457";

/** Receipt acknowledgment rules and instructions — at the bottom of the page */
const RULES_ITEMS = [
  "ميعاد استلام المنتج من 1 ظهراً حتى 7 مساءً وإحضار التأمينات اللازمة.",
  "لا يمكن استرجاع أو استبدال المنتج بعد مرور 3 أيام من تاريخ الشراء إلا في حالة وجود عيب مصنعي.",
  "يجب إحضار الفاتورة الأصلية مع البطاقة الشخصية عند الاسترجاع أو الاستبدال أو الاستلام.",
];

type Props = {
  order: TOrder;
  logoUrl?: string;
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
        return `${p.phone} (${phoneType})`;
      }).join(" - ")
    : null;
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
    <article
      dir="rtl"
      lang="ar"
      className="invoice-print-root w-full min-h-screen flex flex-col bg-white text-gray-900 text-[14px] leading-relaxed"
      style={{ fontFamily: "'Cairo', 'Segoe UI', Arial, sans-serif" }}
      itemScope
      itemType="https://schema.org/Receipt"
    >
      <meta itemProp="name" content={`إقرار استلام - طلب رقم ${order.id}`} />
      <meta itemProp="dateCreated" content={order.created_at} />
      
      {/* Header — minimized */}
      <header
        className="invoice-print-header w-full py-3 mb-3 text-white rounded-b-xl shadow-sm"
        style={{ backgroundColor: HEADER_BG }}
        role="banner"
      >
        <div className="invoice-print-header-inner flex items-center justify-between gap-6 max-w-[210mm] mx-auto px-6">
          <div className="invoice-print-header-right text-right shrink-0 space-y-0.5 text-[14px]">
            <div className="flex items-baseline justify-end gap-2 flex-wrap">
              <span className="text-white/95 font-medium">رقم الفاتورة:</span>
              <span className="font-bold text-white" itemProp="identifier">{order.id}</span>
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
          <div className="invoice-print-header-logo shrink-0 bg-white/10 rounded-lg p-2 flex items-center justify-center">
            <img 
              src={logoUrl} 
              alt="شعار الشركة" 
              className="invoice-logo-img max-h-14 w-auto object-contain"
              itemProp="image"
            />
          </div>
        </div>
      </header>

      <main className="invoice-print-content flex-1 flex flex-col min-h-0 max-w-[210mm] mx-auto px-6 pb-3 w-full">
        {/* Content from title to signature */}
        <section className="invoice-print-body shrink-0">
        {/* 1. Receipt acknowledgment title — at the top */}
        <header className="invoice-print-title-wrap flex flex-col items-center justify-center text-center mb-4">
          <h1 className="invoice-print-title text-[24px] font-bold text-gray-900 tracking-tight mb-2">
            إقرار استلام
          </h1>
          <span className="invoice-print-title-line mt-1 block h-0.5 w-24 rounded-full bg-gray-400" aria-hidden />
        </header>

        {/* 2. I received / National ID / Resident in / Phone — from the right */}
        <section className="invoice-print-recipient text-right mb-4 space-y-1.5 text-[14px]" itemScope itemType="https://schema.org/Person">
          <p className="text-gray-900">
            <span className="font-semibold text-gray-700">استلمت أنا :</span>{" "}
            <span className="font-bold text-gray-900" itemProp="name">{clientName}</span>
          </p>
          <p className="text-gray-900">
            <span className="font-semibold text-gray-700">الرقم القومي :</span>{" "}
            <span className="font-normal text-gray-900">{nationalId}</span>
          </p>
          <p className="text-gray-900">
            <span className="font-semibold text-gray-700">المقيم في :</span>{" "}
            <span className="font-normal text-gray-900" itemProp="address">{addressStr}</span>
          </p>
          {phoneStr && (
            <p className="text-gray-900">
              <span className="font-semibold text-gray-700">رقم الهاتف :</span>{" "}
              <span className="font-normal text-gray-900" itemProp="telephone">{phoneStr}</span>
            </p>
          )}
        </section>

        {/* 3. Numbered products list */}
        <section className="invoice-print-items-list mb-4 text-[14px] text-gray-900">
          <h2 className="sr-only">قائمة المنتجات</h2>
          {items.length > 0 ? (
            <ol className="list-decimal list-inside space-y-1" itemProp="itemListElement" itemScope itemType="https://schema.org/ItemList">
              {items.map((item, index) => (
                <li key={item.id} className="font-medium" itemProp="itemListElement" itemScope itemType="https://schema.org/Product">
                  <span itemProp="name">{item.name || "-"}</span>
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
        <p className="invoice-print-rental text-[14px] text-gray-900 mb-3">
          وذلك بتأجيره من تاريخ{" "}
          <time className="font-semibold" dateTime={order.visit_datetime || undefined}>{startDate}</time> حتى تاريخ{" "}
          <time className="font-semibold" dateTime={order.delivery_date || undefined}>{endDate}</time>
        </p>

        {/* 5. Receipt acknowledgment and deposit payment */}
        <p className="invoice-print-deposit text-[14px] text-gray-900 mb-5">
          وذلك إقرار مني بالاستلام ودفع عربون وقدره :{" "}
          <span className="font-bold text-gray-900" itemProp="totalPaymentDue">{paid} ج.م</span>
        </p>

        {/* 6. Recipient and signature */}
        <section className="invoice-print-signature flex justify-end mt-4 pt-4 border-t-2 border-gray-300">
          <div className="invoice-print-signature-box text-right min-w-[220px] space-y-3 text-[14px] text-gray-900">
            <p>
              <span className="font-semibold text-gray-700">المستلم :</span>{" "}
              <span className="inline-block border-b-2 border-gray-500 min-w-[120px] align-bottom h-6">&nbsp;</span>
            </p>
            <p>
              <span className="font-semibold text-gray-700">التوقيع :</span>{" "}
              <span className="inline-block border-b-2 border-gray-500 min-w-[120px] align-bottom h-6">&nbsp;</span>
            </p>
          </div>
        </section>
        </section>

        {/* 7. Rules and instructions — fixed at the bottom of the page with spacing above footer */}
        <aside className="invoice-print-rules mt-auto pt-4 pb-8 border-t-2 border-gray-200 shrink-0">
          <h2 className="invoice-print-rules-title text-[14px] font-bold text-gray-800 mb-2 pb-1.5">
            القواعد والتعليمات
          </h2>
          <div className="invoice-print-notes-box rounded-lg border-2 border-gray-200 bg-gray-50 py-3 px-4">
            <ul className="list-none space-y-1 text-[13px] text-gray-800 leading-relaxed">
              {RULES_ITEMS.map((text, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold text-gray-700 shrink-0">{i + 1}.</span>
                  <span className="font-normal">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>

      {/* Footer — minimized */}
      <footer
        className="invoice-print-footer w-full mt-auto py-3 px-4 text-center text-white rounded-t-xl text-[13px] font-semibold shadow-sm shrink-0"
        style={{ backgroundColor: HEADER_BG }}
        role="contentinfo"
      >
        لا يرد العربون في حالة إلغاء الحجز
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
            padding: 0; 
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
        }
      `}</style>
    </article>
  );
}
 
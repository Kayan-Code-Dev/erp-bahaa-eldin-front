import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { TOrder } from "@/api/v2/orders/orders.types";
import { useGetOrderDetailsQueryOptions } from "@/api/v2/orders/orders.hooks";
import { OrderInvoicePrint } from "./OrderInvoicePrint";
import { useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Invoice styles when copying to print window */
const INVOICE_PRINT_STYLES = `
  @page { 
    size: A4; 
    margin: 10mm;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  * { 
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  body { 
    margin: 0; 
    padding: 12px; 
    font-family: 'Segoe UI', 'Cairo', Arial, sans-serif; 
    direction: rtl;
    font-weight: 400;
    line-height: 1.6;
    color: #1f2937;
  }
  .invoice-print-root { 
    display: flex; 
    flex-direction: column; 
    min-height: 100vh; 
    background: #fff; 
    color: #1f2937; 
    font-size: 15px; 
    line-height: 1.6; 
    page-break-inside: avoid; 
    width: 100%;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-print-header { 
    width: 100%; 
    flex-shrink: 0; 
    padding: 24px 0; 
    background: #907457 !important; 
    color: #fff; 
    border-bottom-left-radius: 1rem; 
    border-bottom-right-radius: 1rem; 
    margin-bottom: 32px; 
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-print-header-inner { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    gap: 32px; 
    max-width: 210mm; 
    margin: 0 auto; 
    padding: 0 32px; 
  }
  .invoice-print-content { 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    max-width: 210mm; 
    margin: 0 auto; 
    padding: 0 32px 16px; 
    width: 100%; 
  }
  .invoice-print-header-right { 
    text-align: right; 
    flex-shrink: 0; 
  }
  .invoice-print-header-right .invoice-header-label { 
    font-size: 18px; 
    font-weight: 500; 
    color: rgba(255,255,255,0.95); 
  }
  .invoice-print-header-right .invoice-header-number { 
    font-size: 28px; 
    font-weight: 700; 
    letter-spacing: -0.025em; 
  }
  .invoice-print-header-right .invoice-header-line { 
    font-size: 16px; 
    font-weight: 400; 
    color: rgba(255,255,255,0.95); 
  }
  .invoice-print-header-right > * + * { margin-top: 12px; }
  .invoice-print-header-logo { 
    flex-shrink: 0; 
    background: rgba(255,255,255,0.1); 
    border-radius: 12px; 
    padding: 12px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
  }
  .invoice-print-header-logo img, .invoice-logo-img { 
    max-height: 96px; 
    width: auto; 
    object-fit: contain; 
  }
  .invoice-print-title { 
    font-size: 24px; 
    font-weight: 700; 
    text-align: center; 
    margin-bottom: 8px; 
    color: #1f2937; 
  }
  .invoice-print-root h2 { 
    font-size: 11px; 
    font-weight: 700; 
    color: #6b7280; 
    text-transform: uppercase; 
    letter-spacing: 0.05em; 
    margin-bottom: 12px; 
    padding-bottom: 8px; 
    border-bottom: 2px solid #e5e7eb; 
  }
  .invoice-print-table { 
    width: 100%; 
    border-collapse: collapse; 
    margin-bottom: 24px; 
    table-layout: fixed; 
    border: 1px solid #e5e7eb; 
    border-radius: 12px; 
    overflow: hidden; 
    page-break-inside: avoid; 
  }
  .invoice-print-table td, .invoice-print-table th { 
    padding: 14px 16px; 
    border-bottom: 1px solid #f3f4f6; 
  }
  .invoice-print-td { 
    padding: 14px 16px; 
    border-bottom: 1px solid #f3f4f6; 
    font-weight: 400;
  }
  .invoice-print-th { 
    text-align: center; 
    font-weight: 600; 
    font-size: 13px; 
    padding: 14px 16px; 
  }
  .invoice-print-thead-row th { 
    background: #7a6349 !important; 
    color: #fff; 
    font-weight: 700;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-print-row-even td { 
    background: rgba(249,250,251,0.8) !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-print-td-center { 
    text-align: center; 
    font-size: 14px; 
  }
  .invoice-print-td-bold { font-weight: 600; }
  .invoice-print-td .font-medium { font-weight: 500; }
  .invoice-print-td .font-semibold { font-weight: 600; }
  .invoice-print-td .font-bold { font-weight: 700; }
  .invoice-print-td .font-normal { font-weight: 400; }
  .invoice-print-block { 
    margin-bottom: 24px; 
    page-break-inside: avoid; 
  }
  .invoice-print-notes-box { 
    font-size: 14px; 
    font-weight: 400;
    border: 1px solid #e5e7eb; 
    padding: 12px 16px; 
    min-height: 52px; 
    border-radius: 8px; 
    background: rgba(249,250,251,0.5); 
    color: #374151; 
    line-height: 1.7;
  }
  .invoice-print-rules-row { 
    display: flex; 
    gap: 24px; 
    margin-bottom: 24px; 
    flex-wrap: wrap; 
    page-break-inside: avoid; 
  }
  .invoice-print-rules-text { 
    flex: 1; 
    min-width: 240px; 
  }
  .invoice-print-rules-p { 
    font-size: 13px; 
    font-weight: 400;
    line-height: 1.7; 
    color: #4b5563; 
  }
  .invoice-print-totals-wrap { 
    flex-shrink: 0; 
    width: 224px; 
    border-radius: 12px; 
    overflow: hidden; 
    border: 1px solid #e5e7eb; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.06); 
  }
  .invoice-print-totals-title { 
    padding: 10px 16px; 
    text-align: center; 
    color: #fff !important; 
    font-size: 12px; 
    font-weight: 700; 
    text-transform: uppercase; 
    letter-spacing: 0.05em; 
    background: #907457 !important; 
    background-color: #907457 !important; 
    -webkit-print-color-adjust: exact !important; 
    print-color-adjust: exact !important; 
  }
  .invoice-print-totals-table { 
    width: 100%; 
    border-collapse: collapse; 
  }
  .invoice-print-totals-row { 
    border-bottom: 1px solid #f3f4f6; 
  }
  .invoice-print-totals-row:last-child { 
    border-bottom: none; 
  }
  .invoice-print-totals-label { 
    padding: 12px 16px; 
    font-size: 13px; 
    font-weight: 600; 
    color: #4b5563; 
    background: rgba(249,250,251,0.8); 
  }
  .invoice-print-totals-value { 
    padding: 12px 16px; 
    text-align: right; 
    font-variant-numeric: tabular-nums; 
    font-weight: 600; 
    color: #111827; 
  }
  .invoice-print-totals-table .invoice-print-totals-value:first-of-type { 
    font-size: 15px; 
    font-weight: 700; 
  }
  .invoice-print-signature { 
    display: flex; 
    justify-content: flex-end; 
    margin-top: 40px; 
    padding-top: 24px; 
    border-top: 2px solid #e5e7eb; 
    page-break-inside: avoid; 
  }
  .invoice-print-signature-box { 
    text-align: left; 
    min-width: 200px; 
  }
  .invoice-print-signature-box .font-semibold { 
    font-weight: 600; 
    display: block; 
    margin-bottom: 8px; 
    font-size: 14px; 
    color: #374151; 
  }
  .invoice-print-signature-line { 
    border-bottom: 2px solid #9ca3af; 
    height: 32px; 
    margin-top: 4px; 
  }
  .invoice-print-footer { 
    margin-top: auto; 
    flex-shrink: 0; 
    width: 100%; 
    padding: 16px 24px; 
    text-align: center; 
    color: #fff; 
    background: #907457 !important; 
    border-top-left-radius: 1rem; 
    border-top-right-radius: 1rem; 
    font-size: 14px; 
    font-weight: 600; 
    box-shadow: 0 -4px 6px -1px rgba(0,0,0,0.1);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  @media print {
    .invoice-print-header, .invoice-print-footer, .invoice-print-totals-title { 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important; 
    }
    .invoice-print-thead-row th, .invoice-print-row-even td { 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important; 
    }
    .invoice-print-root { 
      page-break-after: avoid; 
      page-break-inside: avoid; 
      box-shadow: none;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body, html { 
      height: auto; 
      overflow: visible; 
    }
    .invoice-print-footer { 
      position: fixed; 
      bottom: 0; 
      left: 0; 
      right: 0; 
      width: 100%; 
      margin: 0; 
    }
    body { padding-bottom: 56px; }
    /* Prevent page breaks inside important sections */
    .invoice-print-info-block,
    .invoice-print-signature,
    .invoice-print-rules-row {
      page-break-inside: avoid;
    }
    /* Ensure proper color printing */
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`;

type Props = {
  order: TOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copyLabel?: string; // Shown in modal title only; content is the same
};

export function OrderInvoicePrintModal({
  order,
  open,
  onOpenChange,
  copyLabel,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const { data: orderDetails, isPending } = useQuery({
    ...useGetOrderDetailsQueryOptions(order?.id ?? 0),
    enabled: open && !!order?.id,
  });

  const orderToPrint = orderDetails ?? order;

  const handlePrint = () => {
    if (!orderToPrint) return;
    const printContent = document.getElementById("invoice-print-content");
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title></title>
          <style>${INVOICE_PRINT_STYLES}</style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    let printed = false;
    const doPrint = () => {
      if (printed) return;
      printed = true;
      printWindow.print();
      printWindow.close();
    };
    printWindow.onload = () => setTimeout(doPrint, 300);
    setTimeout(doPrint, 1500);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {copyLabel ?? "طباعة الفاتورة"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {copyLabel ?? "طباعة الفاتورة"}
          </DialogDescription>
        </DialogHeader>
        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : orderToPrint ? (
          <>
            <div id="invoice-print-content" ref={printRef} className="print-invoice-root">
              <OrderInvoicePrint
                order={orderToPrint}
                hideItemPrices={copyLabel !== "نسخة العميل"}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                إغلاق
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="ml-2 h-4 w-4" />
                طباعة
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { TOrder } from "@/api/v2/orders/orders.types";
import { useGetOrderDetailsQueryOptions } from "@/api/v2/orders/orders.hooks";
import { OrderInvoicePrint } from "./OrderInvoicePrint";
import { useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Invoice styles when copying to print window — A5 single page */
const INVOICE_PRINT_STYLES = `
  @page { 
    size: A5 portrait; 
    margin: 4mm;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  * { 
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  html, body { 
    margin: 0 !important; 
    padding: 0 !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: hidden !important;
  }
  body { 
    font-family: 'Segoe UI', 'Cairo', Arial, sans-serif; 
    direction: rtl;
    font-weight: 400;
    line-height: 1.4;
    color: #1f2937;
    width: 148mm;
  }
  .invoice-print-root { 
    display: flex; 
    flex-direction: column; 
    width: 100%;
    max-width: 148mm;
    height: 202mm !important;
    max-height: 202mm !important;
    min-height: 0 !important;
    background: #fff; 
    color: #1f2937; 
    font-size: 10px; 
    line-height: 1.35; 
    page-break-inside: avoid !important;
    page-break-after: avoid !important;
    overflow: hidden !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-print-header { 
    width: 100%; 
    flex-shrink: 0; 
    padding: 4px 0; 
    background: #5170ff !important; 
    color: #fff; 
    border-radius: 2px; 
    margin-bottom: 4px; 
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-print-header-inner { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    gap: 8px; 
    max-width: 136mm; 
    margin: 0 auto; 
    padding: 0 4px; 
  }
  .invoice-print-content { 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    max-width: 136mm; 
    margin: 0 auto; 
    padding: 0 4px 4px; 
    width: 100%; 
    overflow: hidden;
    min-height: 0;
  }
  .invoice-print-header-right { 
    text-align: right; 
    flex-shrink: 0; 
  }
  .invoice-print-header-right .invoice-header-label { 
    font-size: 9px; 
    font-weight: 500; 
    color: rgba(255,255,255,0.95); 
  }
  .invoice-print-header-right .invoice-header-number { 
    font-size: 12px; 
    font-weight: 700; 
    letter-spacing: -0.025em; 
  }
  .invoice-print-header-right .invoice-header-line { 
    font-size: 8px; 
    font-weight: 400; 
    color: rgba(255,255,255,0.95); 
  }
  .invoice-print-header-right > * + * { margin-top: 1px; }
  .invoice-print-header-logo { 
    flex-shrink: 0; 
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    background: #ffffff; 
    border-radius: 50%; 
    padding: 0; 
    overflow: hidden;
    display: flex; 
    align-items: center; 
    justify-content: center; 
    box-shadow: 0 2px 6px rgba(0,0,0,0.12);
    border: 2px solid rgba(255,255,255,0.9);
  }
  .invoice-print-header-logo img, .invoice-logo-img { 
    width: 100%;
    height: 100%;
    object-fit: cover; 
  }
  .invoice-print-title { 
    font-size: 24px; 
    font-weight: 700; 
    text-align: center; 
    margin-bottom: 8px; 
    color: #1f2937; 
  }
  .invoice-print-root h2 { 
    font-size: 8px; 
    font-weight: 700; 
    color: #6b7280; 
    text-transform: uppercase; 
    letter-spacing: 0.05em; 
    margin-bottom: 2px; 
    padding-bottom: 2px; 
    border-bottom: 1px solid #e5e7eb; 
  }
  .invoice-print-table { 
    width: 100%; 
    border-collapse: collapse; 
    margin-bottom: 4px; 
    table-layout: fixed; 
    border: 1px solid #e5e7eb; 
    border-radius: 2px; 
    overflow: hidden; 
    page-break-inside: avoid; 
  }
  .invoice-print-table td, .invoice-print-table th { 
    padding: 2px 3px; 
    border-bottom: 1px solid #f3f4f6; 
    font-size: 8px;
  }
  .invoice-print-td { 
    padding: 14px 16px; 
    border-bottom: 1px solid #f3f4f6; 
    font-weight: 400;
  }
  .invoice-print-th { 
    text-align: center; 
    font-weight: 600; 
    font-size: 8px; 
    padding: 2px 3px; 
  }
  .invoice-print-thead-row th { 
    background: #3f5ae0 !important; 
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
    font-size: 8px; 
  }
  .invoice-print-td-bold { font-weight: 600; }
  .invoice-print-td .font-medium { font-weight: 500; }
  .invoice-print-td .font-semibold { font-weight: 600; }
  .invoice-print-td .font-bold { font-weight: 700; }
  .invoice-print-td .font-normal { font-weight: 400; }
  .invoice-print-block { 
    margin-bottom: 4px; 
    page-break-inside: avoid; 
  }
  .invoice-print-measurements-wrap {
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    page-break-inside: avoid;
  }
  .invoice-print-table-measurements {
    table-layout: auto;
    width: 100%;
    page-break-inside: avoid;
  }
  .invoice-print-measurements-thead th {
    background: #3f5ae0 !important;
    color: #fff;
    padding: 2px 6px;
    font-size: 7px;
    border-left: 1px solid rgba(255,255,255,0.2);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-print-mth-item { border-left: none !important; }
  .invoice-print-mtd, .invoice-print-mth {
    padding: 2px 4px;
    font-size: 7px;
  }
  .invoice-print-mtd-item {
    font-weight: 600;
    min-width: 90px;
  }
  .invoice-print-mrow td {
    border-bottom: 1px solid #e5e7eb;
  }
  .invoice-print-notes-box { 
    font-size: 8px; 
    font-weight: 400;
    border: 1px solid #e5e7eb; 
    padding: 3px 4px; 
    min-height: 16px; 
    border-radius: 2px; 
    background: rgba(249,250,251,0.5); 
    color: #374151; 
    line-height: 1.4;
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
    background: #5170ff !important; 
    background-color: #5170ff !important; 
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
    margin-top: 4px; 
    padding-top: 4px; 
    border-top: 1px solid #e5e7eb; 
    page-break-inside: avoid; 
  }
  .invoice-print-signature-box { 
    text-align: left; 
    min-width: 80px; 
  }
  .invoice-print-signature-box .font-semibold { 
    font-weight: 600; 
    display: block; 
    margin-bottom: 2px; 
    font-size: 9px; 
    color: #374151; 
  }
  .invoice-print-signature-line { 
    border-bottom: 1px solid #9ca3af; 
    height: 12px; 
    margin-top: 2px; 
  }
  .invoice-print-footer { 
    margin-top: auto; 
    flex-shrink: 0; 
    width: 100%; 
    padding: 3px 4px; 
    text-align: center; 
    color: #fff; 
    background: #5170ff !important; 
    border-radius: 2px 2px 0 0; 
    font-size: 8px; 
    font-weight: 600; 
    line-height: 1.3;
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
    html { 
      height: 100% !important; 
      overflow: hidden !important;
    }
    body { 
      height: 99% !important; 
      min-height: 0 !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .invoice-print-footer { 
      margin-top: auto;
    }
    /* Keep signature and footer on same page */
    .invoice-print-signature { page-break-before: avoid; }
    .invoice-print-footer { page-break-before: avoid; }
    /* avoid blank second page */
    body > *:last-child { page-break-after: avoid !important; }
    .invoice-print-measurements-wrap {
      border: 1px solid #d1d5db !important;
      border-radius: 6px !important;
    }
    .invoice-print-measurements-thead th {
      background: #7a6349 !important;
      color: #fff !important;
      padding: 4px 6px !important;
      font-size: 9px !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .invoice-print-mtd, .invoice-print-mth {
      padding: 4px 6px !important;
      font-size: 9px !important;
    }
    .invoice-print-mtd-item { min-width: 70px; }
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

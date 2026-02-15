import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { TOrder } from "@/api/v2/orders/orders.types";
import { useGetOrderDetailsQueryOptions } from "@/api/v2/orders/orders.hooks";
import { OrderReceiptAckPrint } from "./OrderReceiptAckPrint";
import { useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Receipt acknowledgment styles when copying to print window */
const ACK_PRINT_STYLES = `
  @page { size: A4; margin: 8mm; }
  body { margin: 0; padding: 8px; font-family: 'Cairo', 'Segoe UI', Arial, sans-serif; direction: rtl; font-size: 14px; font-weight: 600; }
  * { box-sizing: border-box; }
  .invoice-print-root { display: flex; flex-direction: column; min-height: 100vh; background: #fff; color: #111827; font-size: 14px; font-weight: 600; line-height: 1.45; page-break-inside: avoid; width: 100%; }
  .invoice-print-header { width: 100%; flex-shrink: 0; padding: 12px 0; background: #907457; color: #fff; font-weight: 600; border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.08); }
  .invoice-print-header-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; max-width: 210mm; margin: 0 auto; padding: 0 24px; }
  .invoice-print-content { flex: 1; display: flex; flex-direction: column; min-height: 0; max-width: 210mm; margin: 0 auto; padding: 0 24px 12px; width: 100%; }
  .invoice-print-body { flex-shrink: 0; }
  .invoice-print-header-right { text-align: right; flex-shrink: 0; font-size: 14px; font-weight: 600; }
  .invoice-print-header-right > * + * { margin-top: 4px; }
  .invoice-print-header-right .font-bold { font-weight: 700; }
  .invoice-print-header-logo { flex-shrink: 0; background: rgba(255,255,255,0.1); border-radius: 8px; padding: 8px; display: flex; align-items: center; justify-content: center; }
  .invoice-print-header-logo img, .invoice-logo-img { max-height: 56px; width: auto; object-fit: contain; }
  .invoice-print-title-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; margin-bottom: 12px; padding: 0; }
  .invoice-print-title { font-size: 22px; font-weight: 700; color: #111827; letter-spacing: -0.02em; margin: 0; }
  .invoice-print-title-line { display: block; margin-top: 4px; height: 2px; width: 96px; border-radius: 9999px; background: #9ca3af; }
  .invoice-print-recipient { text-align: right; margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #111827; }
  .invoice-print-recipient.space-y-1 > * + * { margin-top: 4px; }
  .invoice-print-recipient .font-bold { font-weight: 700; }
  .invoice-print-items-list { margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #111827; }
  .invoice-print-items-list ol { list-style-type: decimal; list-style-position: inside; padding: 0; margin: 0; }
  .invoice-print-items-list li { margin-bottom: 2px; font-weight: 700; }
  .invoice-print-rental { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #111827; }
  .invoice-print-rental .font-bold { font-weight: 700; }
  .invoice-print-deposit { font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #111827; }
  .invoice-print-deposit .font-bold { font-weight: 700; }
  .invoice-print-rules { margin-top: auto; padding-top: 12px; padding-bottom: 32px; border-top: 2px solid #e5e7eb; flex-shrink: 0; page-break-inside: avoid; }
  .invoice-print-rules-title { font-size: 13px; font-weight: 700; color: #1f2937; }
  .invoice-print-block { margin-bottom: 12px; page-break-inside: avoid; }
  .invoice-print-block-title { padding: 8px 12px; font-size: 10px; font-weight: 700; color: #374151; background: #f9fafb; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; letter-spacing: 0.05em; }
  .invoice-print-notes-box { font-size: 12px; font-weight: 600; border: 2px solid #e5e7eb; padding: 8px 12px; border-radius: 8px; background: #f9fafb; color: #1f2937; line-height: 1.5; }
  .invoice-print-notes-box ul { list-style: none; margin: 0; padding: 0; }
  .invoice-print-notes-box li { display: flex; gap: 6px; margin-bottom: 4px; font-weight: 600; }
  .invoice-print-notes-box li:last-child { margin-bottom: 0; }
  .invoice-print-notes-box li .font-bold { font-weight: 700; }
  .invoice-print-signature { display: flex; justify-content: flex-end; margin-top: 8px; padding-top: 12px; border-top: 2px solid #d1d5db; page-break-inside: avoid; }
  .invoice-print-signature-box { text-align: right; min-width: 220px; font-size: 14px; font-weight: 600; color: #111827; }
  .invoice-print-signature-box.space-y-2 > * + * { margin-top: 8px; }
  .invoice-print-signature-box .font-bold { font-weight: 700; }
  .invoice-print-signature-box .border-b-2 { border-bottom: 2px solid #6b7280; }
  .invoice-print-signature-line { border-bottom: 2px solid #6b7280; height: 32px; margin-top: 2px; }
  .invoice-print-footer { margin-top: auto; flex-shrink: 0; width: 100%; padding: 8px 16px; text-align: center; color: #fff; background: #907457; border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; font-size: 13px; font-weight: 700; box-shadow: 0 -2px 4px rgba(0,0,0,0.08); }
  .invoice-print-block .rounded-xl { border-radius: 0.75rem; }
  .invoice-print-block .rounded-lg { border-radius: 6px; }
  .invoice-print-block .border { border-width: 1px; }
  .invoice-print-block .border-2 { border-width: 2px; }
  .invoice-print-block .border-gray-200 { border-color: #e5e7eb; }
  .invoice-print-block > div:last-child { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
  .invoice-print-block .grid { display: grid; gap: 4px 16px; }
  .invoice-print-block .sm\\:col-span-2 { grid-column: 1 / -1; }
  .invoice-print-block .space-y-2 > * + * { margin-top: 8px; }
  .invoice-print-block .space-y-4 > * + * { margin-top: 16px; }
  .invoice-print-block .space-y-1 > * + * { margin-top: 4px; }
  .invoice-print-block .pt-2 { padding-top: 8px; }
  .invoice-print-block .pt-3 { padding-top: 12px; }
  .invoice-print-block .border-t { border-top: 1px solid #f3f4f6; }
  .invoice-print-items-table, .invoice-print-block table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .invoice-print-block thead tr { background: #f9fafb; }
  .invoice-print-block th { text-align: right; padding: 4px 8px; font-weight: 600; color: #4b5563; }
  .invoice-print-block td { padding: 4px 8px; border-top: 1px solid #f3f4f6; }
  .invoice-print-block tbody tr:first-child td { border-top: none; }
  @media (min-width: 400px) {
    .invoice-print-block .sm\\:grid-cols-2 { grid-template-columns: 1fr 1fr; }
  }
  @media print {
    .invoice-print-header, .invoice-print-footer { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .invoice-print-root { page-break-after: avoid; page-break-inside: avoid; box-shadow: none; min-height: 100vh; }
    .invoice-print-content { min-height: 230mm; }
    body, html { height: auto; overflow: visible; }
    .invoice-print-footer { position: fixed; bottom: 0; left: 0; right: 0; width: 100%; margin: 0; }
    body { padding-bottom: 130px; }
  }
`;

type Props = {
  order: TOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrderReceiptAckPrintModal({
  order,
  open,
  onOpenChange,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const { data: orderDetails, isPending } = useQuery({
    ...useGetOrderDetailsQueryOptions(order?.id ?? 0),
    enabled: open && !!order?.id,
  });

  const orderToPrint = orderDetails ?? order;

  const handlePrint = () => {
    if (!orderToPrint) return;
    const printContent = document.getElementById("ack-print-content");
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title></title>
          <style>${ACK_PRINT_STYLES}</style>
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
        <DialogTitle className="text-base font-semibold">
          طباعة إقرار استلام
        </DialogTitle>
        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : orderToPrint ? (
          <>
            <div id="ack-print-content" ref={printRef} className="print-invoice-root">
              <OrderReceiptAckPrint order={orderToPrint} />
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

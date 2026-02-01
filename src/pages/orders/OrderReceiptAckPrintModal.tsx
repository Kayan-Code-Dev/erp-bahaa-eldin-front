import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { TOrder } from "@/api/v2/orders/orders.types";
import { useGetOrderDetailsQueryOptions } from "@/api/v2/orders/orders.hooks";
import { OrderReceiptAckPrint } from "./OrderReceiptAckPrint";
import { useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Receipt acknowledgment styles when copying to print window (same layout as invoice) */
const ACK_PRINT_STYLES = `
  @page { size: A4; margin: 10mm; }
  body { margin: 0; padding: 12px; font-family: 'Segoe UI', 'Cairo', Arial, sans-serif; direction: rtl; }
  * { box-sizing: border-box; }
  .invoice-print-root { display: flex; flex-direction: column; min-height: 100vh; background: #fff; color: #1f2937; font-size: 15px; line-height: 1.6; page-break-inside: avoid; width: 100%; }
  .invoice-print-header { width: 100%; flex-shrink: 0; padding: 24px 0; background: #907457; color: #fff; border-bottom-left-radius: 1rem; border-bottom-right-radius: 1rem; margin-bottom: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
  .invoice-print-header-inner { display: flex; align-items: center; justify-content: space-between; gap: 32px; max-width: 210mm; margin: 0 auto; padding: 0 32px; }
  .invoice-print-content { flex: 1; display: flex; flex-direction: column; max-width: 210mm; margin: 0 auto; padding: 0 32px 16px; width: 100%; }
  .invoice-print-header-right { text-align: right; flex-shrink: 0; }
  .invoice-print-header-right .invoice-header-label { font-size: 18px; font-weight: 600; color: rgba(255,255,255,0.95); }
  .invoice-print-header-right .invoice-header-line { font-size: 16px; font-weight: 500; color: rgba(255,255,255,0.95); }
  .invoice-print-header-right > * + * { margin-top: 12px; }
  .invoice-print-header-logo { flex-shrink: 0; background: rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; display: flex; align-items: center; justify-content: center; }
  .invoice-print-header-logo img, .invoice-logo-img { max-height: 96px; width: auto; object-fit: contain; }
  .invoice-print-title-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; margin-bottom: 32px; padding-top: 8px; }
  .invoice-print-title { font-size: 26px; font-weight: 700; color: #1f2937; letter-spacing: -0.02em; margin: 0; }
  .invoice-print-title-line { display: block; margin-top: 12px; height: 2px; width: 96px; border-radius: 9999px; background: #d1d5db; }
  .invoice-print-root h2 { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
  .invoice-print-block { margin-bottom: 24px; page-break-inside: avoid; }
  .invoice-print-block-title { padding: 12px 16px; font-size: 12px; font-weight: 600; color: #4b5563; background: rgba(249,250,251,0.8); border-bottom: 1px solid #e5e7eb; }
  .invoice-print-notes-box { font-size: 14px; border: 1px solid #e5e7eb; padding: 12px 16px; border-radius: 8px; background: rgba(249,250,251,0.5); color: #374151; line-height: 1.6; }
  .invoice-print-signature { display: flex; justify-content: flex-end; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; page-break-inside: avoid; }
  .invoice-print-signature-box { text-align: left; min-width: 200px; }
  .invoice-print-signature-box .font-semibold { font-weight: 600; display: block; margin-bottom: 8px; font-size: 14px; color: #374151; }
  .invoice-print-signature-line { border-bottom: 2px solid #9ca3af; height: 32px; margin-top: 4px; }
  .invoice-print-footer { margin-top: auto; flex-shrink: 0; width: 100%; padding: 16px 24px; text-align: center; color: #fff; background: #907457; border-top-left-radius: 1rem; border-top-right-radius: 1rem; font-size: 14px; font-weight: 500; box-shadow: 0 -4px 6px -1px rgba(0,0,0,0.1); }
  @media print {
    .invoice-print-header, .invoice-print-footer { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .invoice-print-root { page-break-after: avoid; page-break-inside: avoid; box-shadow: none; }
    body, html { height: auto; overflow: visible; }
    .invoice-print-footer { position: fixed; bottom: 0; left: 0; right: 0; width: 100%; margin: 0; }
    body { padding-bottom: 56px; }
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
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
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

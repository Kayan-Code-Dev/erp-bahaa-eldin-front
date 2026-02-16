import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { TOrder } from "@/api/v2/orders/orders.types";
import { useGetOrderDetailsQueryOptions } from "@/api/v2/orders/orders.hooks";
import { OrderReceiptAckPrint } from "./OrderReceiptAckPrint";
import { useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Receipt acknowledgment styles when copying to print window */
const ACK_PRINT_STYLES = `
  @page { 
    size: A4; 
    margin: 8mm;
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
    padding: 8px; 
    font-family: 'Cairo', 'Segoe UI', Arial, sans-serif; 
    direction: rtl; 
    font-size: 14px; 
    font-weight: 400;
    line-height: 1.6;
    color: #111827;
  }
  .invoice-print-root { 
    display: flex; 
    flex-direction: column; 
    min-height: 100vh; 
    background: #fff; 
    color: #111827; 
    font-size: 14px; 
    line-height: 1.6; 
    page-break-inside: avoid; 
    width: 100%;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-print-header { 
    width: 100%; 
    flex-shrink: 0; 
    padding: 12px 0; 
    background: #907457 !important; 
    color: #fff; 
    font-weight: 500; 
    border-bottom-left-radius: 0.75rem; 
    border-bottom-right-radius: 0.75rem; 
    margin-bottom: 12px; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-print-header-inner { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    gap: 24px; 
    max-width: 210mm; 
    margin: 0 auto; 
    padding: 0 24px; 
  }
  .invoice-print-content { 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    min-height: 0; 
    max-width: 210mm; 
    margin: 0 auto; 
    padding: 0 24px 12px; 
    width: 100%; 
  }
  .invoice-print-body { flex-shrink: 0; }
  .invoice-print-header-right { 
    text-align: right; 
    flex-shrink: 0; 
    font-size: 14px; 
    font-weight: 400; 
  }
  .invoice-print-header-right > * + * { margin-top: 4px; }
  .invoice-print-header-right .font-bold { font-weight: 700; }
  .invoice-print-header-right .font-semibold { font-weight: 600; }
  .invoice-print-header-right .font-medium { font-weight: 500; }
  .invoice-print-header-logo { 
    flex-shrink: 0; 
    background: rgba(255,255,255,0.1); 
    border-radius: 8px; 
    padding: 8px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
  }
  .invoice-print-header-logo img, .invoice-logo-img { 
    max-height: 56px; 
    width: auto; 
    object-fit: contain; 
  }
  .invoice-print-title-wrap { 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    text-align: center; 
    margin-bottom: 16px; 
    padding: 0; 
  }
  .invoice-print-title { 
    font-size: 24px; 
    font-weight: 700; 
    color: #111827; 
    letter-spacing: -0.02em; 
    margin: 0 0 8px 0; 
  }
  .invoice-print-title-line { 
    display: block; 
    margin-top: 4px; 
    height: 2px; 
    width: 96px; 
    border-radius: 9999px; 
    background: #9ca3af; 
  }
  .invoice-print-recipient { 
    text-align: right; 
    margin-bottom: 16px; 
    font-size: 14px; 
    font-weight: 400; 
    color: #111827; 
    line-height: 1.8;
  }
  .invoice-print-recipient.space-y-1 > * + * { margin-top: 6px; }
  .invoice-print-recipient .font-bold { font-weight: 700; }
  .invoice-print-recipient .font-semibold { font-weight: 600; }
  .invoice-print-recipient .font-normal { font-weight: 400; }
  .invoice-print-items-list { 
    margin-bottom: 16px; 
    font-size: 14px; 
    font-weight: 400; 
    color: #111827; 
  }
  .invoice-print-items-list ol { 
    list-style-type: decimal; 
    list-style-position: inside; 
    padding: 0; 
    margin: 0; 
  }
  .invoice-print-items-list li { 
    margin-bottom: 4px; 
    font-weight: 500; 
    line-height: 1.6;
  }
  .invoice-print-rental { 
    font-size: 14px; 
    font-weight: 400; 
    margin-bottom: 12px; 
    color: #111827; 
    line-height: 1.7;
  }
  .invoice-print-rental .font-bold { font-weight: 700; }
  .invoice-print-rental .font-semibold { font-weight: 600; }
  .invoice-print-deposit { 
    font-size: 14px; 
    font-weight: 400; 
    margin-bottom: 20px; 
    color: #111827; 
    line-height: 1.7;
  }
  .invoice-print-deposit .font-bold { font-weight: 700; }
  .invoice-print-rules { 
    margin-top: auto; 
    padding-top: 16px; 
    padding-bottom: 32px; 
    border-top: 2px solid #e5e7eb; 
    flex-shrink: 0; 
    page-break-inside: avoid; 
  }
  .invoice-print-rules-title { 
    font-size: 14px; 
    font-weight: 700; 
    color: #1f2937; 
    margin-bottom: 8px;
  }
  .invoice-print-notes-box { 
    font-size: 13px; 
    font-weight: 400; 
    border: 2px solid #e5e7eb; 
    padding: 12px 16px; 
    border-radius: 8px; 
    background: #f9fafb; 
    color: #1f2937; 
    line-height: 1.7; 
  }
  .invoice-print-notes-box ul { 
    list-style: none; 
    margin: 0; 
    padding: 0; 
  }
  .invoice-print-notes-box li { 
    display: flex; 
    gap: 8px; 
    margin-bottom: 6px; 
    font-weight: 400; 
  }
  .invoice-print-notes-box li:last-child { margin-bottom: 0; }
  .invoice-print-notes-box li .font-bold { font-weight: 700; }
  .invoice-print-signature { 
    display: flex; 
    justify-content: flex-end; 
    margin-top: 16px; 
    padding-top: 16px; 
    border-top: 2px solid #d1d5db; 
    page-break-inside: avoid; 
  }
  .invoice-print-signature-box { 
    text-align: right; 
    min-width: 220px; 
    font-size: 14px; 
    font-weight: 400; 
    color: #111827; 
  }
  .invoice-print-signature-box.space-y-2 > * + * { margin-top: 12px; }
  .invoice-print-signature-box .font-bold { font-weight: 700; }
  .invoice-print-signature-box .font-semibold { font-weight: 600; }
  .invoice-print-signature-box .border-b-2 { border-bottom: 2px solid #6b7280; }
  .invoice-print-signature-line { 
    border-bottom: 2px solid #6b7280; 
    height: 32px; 
    margin-top: 2px; 
  }
  .invoice-print-footer { 
    margin-top: auto; 
    flex-shrink: 0; 
    width: 100%; 
    padding: 12px 16px; 
    text-align: center; 
    color: #fff; 
    background: #907457 !important; 
    border-top-left-radius: 0.75rem; 
    border-top-right-radius: 0.75rem; 
    font-size: 13px; 
    font-weight: 600; 
    box-shadow: 0 -2px 4px rgba(0,0,0,0.08);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  @media print {
    .invoice-print-header, .invoice-print-footer { 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important; 
    }
    .invoice-print-root { 
      page-break-after: avoid; 
      page-break-inside: avoid; 
      box-shadow: none; 
      min-height: 100vh;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .invoice-print-content { min-height: 230mm; }
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
    body { padding-bottom: 130px; }
    /* Prevent page breaks inside important sections */
    .invoice-print-title-wrap,
    .invoice-print-recipient,
    .invoice-print-signature {
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
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            طباعة إقرار استلام
          </DialogTitle>
          <DialogDescription className="sr-only">
            طباعة إقرار استلام
          </DialogDescription>
        </DialogHeader>
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

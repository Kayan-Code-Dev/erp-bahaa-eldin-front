import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { TOrder } from "@/api/v2/orders/orders.types";
import { useGetOrderDetailsQueryOptions } from "@/api/v2/orders/orders.hooks";
import { OrderReceiptAckPrint } from "./OrderReceiptAckPrint";
import { useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/** Receipt acknowledgment styles for A5 print */
const ACK_PRINT_STYLES = `
  @page { 
    size: A5; 
    margin: 6mm;
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
    padding: 6px; 
    font-family: 'Cairo', 'Segoe UI', Arial, sans-serif; 
    direction: rtl; 
    font-size: 12px; 
    font-weight: 400;
    line-height: 1.4;
    color: #111827;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }
  .invoice-print-root { 
    display: flex; 
    flex-direction: column; 
    min-height: 0; 
    background: #fff; 
    color: #111827; 
    font-size: 12px; 
    line-height: 1.4; 
    page-break-inside: avoid; 
    width: 100%;
    max-width: 148mm;
    margin: 0 auto;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-print-header { 
    width: 100%; 
    flex-shrink: 0; 
    padding: 8px 0; 
    background: #907457 !important; 
    color: #fff; 
    font-weight: 500; 
    border-bottom-left-radius: 0.5rem; 
    border-bottom-right-radius: 0.5rem; 
    margin-bottom: 8px; 
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-print-header-inner { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    gap: 12px; 
    max-width: 148mm; 
    margin: 0 auto; 
    padding: 0 12px; 
  }
  .invoice-print-content { 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    min-height: 0; 
    max-width: 148mm; 
    margin: 0 auto; 
    padding: 0 12px 8px; 
    width: 100%; 
  }
  .invoice-print-body { flex-shrink: 0; }
  .invoice-print-header-right { 
    text-align: right; 
    flex-shrink: 0; 
    font-size: 11px; 
    font-weight: 400; 
  }
  .invoice-print-header-right > * + * { margin-top: 2px; }
  .invoice-print-header-right .font-bold { font-weight: 700; }
  .invoice-print-header-right .font-semibold { font-weight: 600; }
  .invoice-print-header-right .font-medium { font-weight: 500; }
  .invoice-print-header-logo { 
    flex-shrink: 0; 
    background: rgba(255,255,255,0.1); 
    border-radius: 6px; 
    padding: 6px; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
  }
  .invoice-print-header-logo img, .invoice-logo-img { 
    max-height: 40px; 
    width: auto; 
    object-fit: contain; 
  }
  .invoice-print-title-wrap { 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    text-align: center; 
    margin-bottom: 8px; 
    padding: 0; 
  }
  .invoice-print-title { 
    font-size: 18px; 
    font-weight: 700; 
    color: #111827; 
    letter-spacing: -0.02em; 
    margin: 0 0 4px 0; 
  }
  .invoice-print-title-line { 
    display: block; 
    margin-top: 2px; 
    height: 2px; 
    width: 64px; 
    border-radius: 9999px; 
    background: #9ca3af; 
  }
  .invoice-print-recipient { 
    text-align: right; 
    margin-bottom: 8px; 
    font-size: 12px; 
    font-weight: 400; 
    color: #111827; 
    line-height: 1.5;
  }
  .invoice-print-recipient .font-bold { font-weight: 700; }
  .invoice-print-recipient .font-semibold { font-weight: 600; }
  .invoice-print-recipient .font-normal { font-weight: 400; }
  .invoice-print-items-list { 
    margin-bottom: 8px; 
    font-size: 12px; 
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
    margin-bottom: 2px; 
    font-weight: 500; 
    line-height: 1.4;
  }
  .invoice-print-rental { 
    font-size: 12px; 
    font-weight: 400; 
    margin-bottom: 8px; 
    color: #111827; 
    line-height: 1.5;
  }
  .invoice-print-deposit { 
    font-size: 12px; 
    font-weight: 400; 
    margin-bottom: 12px; 
    color: #111827; 
    line-height: 1.5;
  }
  .invoice-print-rules { 
    margin-top: auto; 
    padding-top: 8px; 
    padding-bottom: 16px; 
    border-top: 1px solid #e5e7eb; 
    flex-shrink: 0; 
    page-break-inside: avoid; 
  }
  .invoice-print-rules-title { 
    font-size: 11px; 
    font-weight: 700; 
    color: #1f2937; 
    margin-bottom: 4px;
  }
  .invoice-print-notes-box { 
    font-size: 10px; 
    font-weight: 400; 
    border: 1px solid #e5e7eb; 
    padding: 8px 12px; 
    border-radius: 6px; 
    background: #f9fafb; 
    color: #1f2937; 
    line-height: 1.4;
    word-wrap: break-word;
    overflow-wrap: break-word;
    min-width: 0;
  }
  .invoice-print-notes-box ul { list-style: none; margin: 0; padding: 0; }
  .invoice-print-notes-box li { margin-bottom: 4px; font-weight: 400; word-wrap: break-word; overflow-wrap: break-word; }
  .invoice-print-notes-box li:last-child { margin-bottom: 0; }
  .invoice-print-signature { 
    display: flex; 
    justify-content: flex-end; 
    margin-top: 8px; 
    padding-top: 8px; 
    border-top: 1px solid #d1d5db; 
    page-break-inside: avoid; 
  }
  .invoice-print-signature-box { 
    text-align: right; 
    min-width: 120px; 
    font-size: 12px; 
    font-weight: 400; 
    color: #111827; 
  }
  .invoice-print-signature-box .font-semibold { font-weight: 600; }
  .invoice-print-footer { 
    margin-top: auto; 
    flex-shrink: 0; 
    width: 100%; 
    padding: 8px 12px; 
    text-align: center; 
    color: #fff; 
    background: #907457 !important; 
    border-top-left-radius: 0.5rem; 
    border-top-right-radius: 0.5rem; 
    font-size: 11px; 
    font-weight: 600; 
    box-shadow: 0 -1px 3px rgba(0,0,0,0.08);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    word-wrap: break-word;
    overflow-wrap: break-word;
    min-width: 0;
  }
  @media print {
    @page { size: A5; margin: 6mm; }
    .invoice-print-header, .invoice-print-footer { 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important; 
    }
    .invoice-print-root { 
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      page-break-after: avoid; 
      page-break-inside: avoid; 
      box-shadow: none; 
      width: 148mm !important;
      max-width: 148mm !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .invoice-print-header-inner,
    .invoice-print-content { max-width: 148mm !important; }
    .invoice-print-root,
    .invoice-print-content,
    .invoice-print-notes-box,
    .invoice-print-footer { overflow: hidden !important; }
    .invoice-print-notes-box ul,
    .invoice-print-notes-box li,
    .invoice-print-footer { word-wrap: break-word !important; overflow-wrap: break-word !important; }
    body, html { height: auto; overflow: visible; }
    .invoice-print-title-wrap,
    .invoice-print-recipient,
    .invoice-print-signature { page-break-inside: avoid; }
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

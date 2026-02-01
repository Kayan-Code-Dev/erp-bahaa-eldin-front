import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreateSupplierOrderForm } from "./CreateSupplierOrderForm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSupplierId?: string;
};

export function CreateSupplierOrderModal({
  open,
  onOpenChange,
  initialSupplierId,
}: Props) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة طلبية مورد</DialogTitle>
          <DialogDescription>
            املأ البيانات لإضافة طلبية جديدة للمورد مع أصناف الملابس.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-2">
          <CreateSupplierOrderForm
            mode="modal"
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            initialSupplierId={initialSupplierId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

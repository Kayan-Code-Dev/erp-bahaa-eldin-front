import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Props = {
  alertTitle: string;
  alertMessage: ReactNode;
  handleConfirmation: (onCloseModal: () => void) => void;
  isPending: boolean;
  pendingLabel: string;
  confirmLabel: string;
  
  // --- Updated Props ---
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  // ---
  
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
};

export function ControlledConfirmationModal({
  alertTitle,
  alertMessage,
  handleConfirmation,
  isPending,
  pendingLabel,
  confirmLabel,
  open,
  onOpenChange,
  cancelLabel = "إلغاء",
  variant = "destructive",
  confirmButtonClassName,
  cancelButtonClassName,
}: Props) {
  return (
    // Now controlled by parent state
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            {alertTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {alertMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className={cancelButtonClassName}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            // Pass the onOpenChange(false) as the callback
            onClick={() => handleConfirmation(() => onOpenChange(false))}
            disabled={isPending}
            className={cn(
              variant === "destructive" &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              confirmButtonClassName
            )}
          >
            {isPending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
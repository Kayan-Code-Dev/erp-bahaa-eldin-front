import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import ClothesTableContent from "./ClothesTableContent";
import { CreateClothModal } from "./CreateClothModal";
import { useExportClothesToCSVMutationOptions } from "@/api/v2/clothes/clothes.hooks";

function Clothes() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Export Mutation
  const { mutate: exportClothesToCSV, isPending: isExporting } = useMutation(
    useExportClothesToCSVMutationOptions()
  );

  // --- Export Handler ---
  const handleExport = () => {
    exportClothesToCSV(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `products-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("تم تصدير المنتجات بنجاح");
      },
      onError: (error: any) => {
        toast.error("خطأ أثناء تصدير المنتجات. الرجاء المحاولة مرة أخرى.", {
          description: error.message,
        });
      },
    });
  };

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المنتجات</h1>
          <p className="text-muted-foreground">
            إدارة وعرض جميع المنتجات في النظام
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="ml-2 h-4 w-4" />
            {isExporting ? "جاري التصدير..." : "تصدير إلى CSV"}
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة منتج
          </Button>
        </div>
      </div>

      <ClothesTableContent />

      <CreateClothModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}

export default Clothes;

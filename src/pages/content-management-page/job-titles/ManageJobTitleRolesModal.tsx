import {
    useGetJobTitleRolesQueryOptions,
    useSyncJobTitleRolesMutationOptions,
} from "@/api/v2/content-managment/job-titles/job-titles.hooks";
import { TJobTitle } from "@/api/v2/content-managment/job-titles/job-titles.types";
import { RolesSelect } from "@/components/custom/roles-select";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Schema for the form
const formSchema = z.object({
  role_ids: z.array(z.string()).optional(),
});

type Props = {
  jobTitle: TJobTitle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ManageJobTitleRolesModal({
  jobTitle,
  open,
  onOpenChange,
}: Props) {
  const { mutate: syncRoles, isPending: isSyncing } = useMutation(
    useSyncJobTitleRolesMutationOptions()
  );

  // Fetch current roles for the job title
  const { data: currentRoles, isPending: isLoadingRoles } = useQuery({
    ...useGetJobTitleRolesQueryOptions(jobTitle?.id || 0),
    enabled: !!jobTitle?.id && open,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role_ids: [],
    },
  });

  // Load current roles into form when modal opens or roles data changes
  useEffect(() => {
    if (currentRoles && open) {
      const roleIds = currentRoles.map((role) => String(role.id));
      form.reset({
        role_ids: roleIds,
      });
    }
  }, [currentRoles, form, open]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!jobTitle) return;

    const roleIds = (values.role_ids || []).map((id) => Number(id));

    syncRoles(
      { id: jobTitle.id, role_ids: roleIds },
      {
        onSuccess: () => {
          toast.success("تم تحديث الصلاحيات بنجاح", {
            description: `تم تحديث صلاحيات المسمية الوظيفية "${jobTitle.name}" بنجاح.`,
          });
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error("حدث خطأ أثناء تحديث الصلاحيات", {
            description: error.message,
          });
        },
      }
    );
  };

  const isPending = isLoadingRoles || isSyncing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md min-h-[50vh]">
        <DialogHeader>
          <DialogTitle className="text-center">
            إدارة صلاحيات المسمية الوظيفية
          </DialogTitle>
          <DialogDescription className="text-center">
            {jobTitle
              ? `إدارة صلاحيات المسمية الوظيفية "${jobTitle.name}"`
              : "إدارة الصلاحيات"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingRoles ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="mr-2">جاري تحميل الصلاحيات...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Current Roles Display */}
              {currentRoles && currentRoles.length > 0 && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <FormLabel className="text-sm font-medium mb-2 block">
                    الصلاحيات الحالية ({currentRoles.length})
                  </FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {currentRoles.map((role) => (
                      <span
                        key={role.id}
                        className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Roles Select */}
              <FormField
                control={form.control}
                name="role_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الصلاحيات</FormLabel>
                    <FormControl>
                      <RolesSelect
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="اختر الصلاحيات..."
                        allowClear={true}
                        multi={true}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      يمكنك اختيار عدة صلاحيات للمسمية الوظيفية
                    </p>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}


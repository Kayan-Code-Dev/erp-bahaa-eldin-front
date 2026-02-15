import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { TRole } from "@/api/v2/content-managment/roles/roles.types";
import {
  usePermissionsListQueryOptions,
  usePermissionsByRoleIdQueryOptions,
  useTogglePermissionForRoleMutationOptions,
} from "@/api/v2/content-managment/permissions/permissions.hooks";

type Props = {
  role: TRole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ViewRolePermissionsModal({ role, open, onOpenChange }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingPermission, setTogglingPermission] = useState<string | null>(
    null
  );

  // Fetch all permissions
  const { data: allPermissions, isPending: isLoadingAllPermissions } = useQuery(
    usePermissionsListQueryOptions()
  );

  // Fetch role permissions
  const { data: rolePermissions, isPending: isLoadingRolePermissions } =
    useQuery({
      ...usePermissionsByRoleIdQueryOptions(role?.id || 0),
      enabled: !!role?.id && open,
    });

  // Toggle mutation
  const { mutate: togglePermission } = useMutation(
    useTogglePermissionForRoleMutationOptions()
  );

  // Create a Set of role permission names for quick lookup
  const rolePermissionNames = useMemo(() => {
    if (!rolePermissions) return new Set<string>();
    return new Set(rolePermissions.map((perm) => perm.name));
  }, [rolePermissions]);

  // Filter permissions by search query
  const filteredPermissions = useMemo(() => {
    if (!allPermissions) return [];
    if (!searchQuery.trim()) return allPermissions;
    const query = searchQuery.toLowerCase();
    return allPermissions.filter(
      (perm) =>
        perm.name.toLowerCase().includes(query) ||
        perm.display_name?.toLowerCase().includes(query) ||
        perm.description?.toLowerCase().includes(query)
    );
  }, [allPermissions, searchQuery]);

  const handleToggle = (permissionName: string) => {
    if (!role || togglingPermission) return; // Prevent clicks while one is processing

    setTogglingPermission(permissionName);

    togglePermission(
      { roleId: role.id, permission: permissionName },
      {
        onSettled: () => {
          setTogglingPermission(null); // Clear the loading state
        },
      }
    );
  };

  const isPending = isLoadingAllPermissions || isLoadingRolePermissions;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearchQuery(""); // Reset search when closing
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            اذونات الدور: {role?.name}
          </DialogTitle>
          <DialogDescription className="text-center">
            قائمة بجميع الاذونات. الصلاحيات الممنوحة للدور باللون الأخضر.
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="py-2">
          <div className="relative">
            <Input
              placeholder="ابحث باسم الاذن..."
              className="pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Permissions List */}
        <div className="py-4">
          {isPending ? (
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          ) : filteredPermissions && filteredPermissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filteredPermissions.map((perm) => {
                const isGranted = rolePermissionNames.has(perm.name);
                const isToggling = togglingPermission === perm.name;

                return (
                  <Badge
                    key={perm.id}
                    variant="secondary"
                    onClick={() => handleToggle(perm.name)}
                    className={cn(
                      "cursor-pointer p-2 transition-all",
                      // If granted, make it green
                      isGranted &&
                        "bg-green-600 text-white hover:bg-green-600/80",
                      // If any are toggling, dim the ones that are NOT
                      togglingPermission &&
                        !isToggling &&
                        "opacity-50 pointer-events-none"
                    )}
                  >
                    {isToggling ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      perm.display_name || perm.name
                    )}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              {searchQuery
                ? "لا توجد اذونات تطابق البحث."
                : "لا توجد اذونات متاحة."}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useGeneralStore } from "@/state-stores/general-state-store";
import { useEffect } from "react";
import { useLocation } from "react-router";
import { sidebarLabels } from "./constants";
import SidebarItem from "./sidebar-item";
import useSidebarLabel, { useSidebarPermissions } from "./useSidebarLabel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/api/v2/account/account.hooks";
import { useAuthStore } from "@/zustand-stores/auth.store";

function MobileSidebar() {
  const location = useLocation();
  const { pathname } = location;
  const permissions = useSidebarPermissions();
  const filteredLabels = useSidebarLabel(sidebarLabels, permissions);
  const { data: profile } = useProfile();
  const loginData = useAuthStore((s) => s.loginData);
  const avatarUrl = profile?.avatar_url ?? profile?.avatar ?? null;
  const displayName = profile?.name ?? loginData?.user?.name ?? "";
  const userInitials = (displayName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const currentPageIndex = filteredLabels.findIndex(
    (item) => item.path === pathname
  );

  useEffect(() => {
    useGeneralStore.setState({ currentPage: currentPageIndex });
  }, [pathname, currentPageIndex]);

  return (
    <div className="p-4 h-full bg-white">
      <div className="flex flex-col items-center gap-3 py-4 pb-5 border-b border-border/60">
        <div className="relative flex items-center justify-center rounded-xl p-1.5 bg-linear-to-b from-muted/50 to-muted/20 ring-1 ring-border/50 shadow-sm">
          <Avatar className="h-20 w-20 rounded-xl overflow-hidden border-2 border-background shadow-inner">
            <AvatarImage src={avatarUrl ?? undefined} alt="صورة المستخدم" className="object-cover" />
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-2xl font-semibold w-full h-full flex items-center justify-center">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
        {displayName && (
          <p className="text-center text-sm font-medium text-foreground truncate w-full px-1" title={displayName}>
            {displayName}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-4 pt-4">
        {filteredLabels.map((item) => (
          <SidebarItem
            key={item.path + item.label}
            icon={item.icon}
            iconComponent={item.iconComponent}
            label={item.label}
            path={item.path}
            level={item.level}
            subItems={item.subItems}
          />
        ))}
      </div>
    </div>
  );
}

export default MobileSidebar;

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router";
import { SidebarNav } from "./SideBarNav";
import { sidebarLabels } from "../sidebar/constants";
import { cn } from "@/lib/utils";
import useSidebarLabel, { useSidebarPermissions } from "../sidebar/useSidebarLabel";
import { useProfile } from "@/api/v2/account/account.hooks";
import { useAuthStore } from "@/zustand-stores/auth.store";

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const navigate = useNavigate();

  const permissions = useSidebarPermissions();
  const filteredLabels = useSidebarLabel(sidebarLabels, permissions);

  const { data: profile } = useProfile();
  const loginData = useAuthStore((s) => s.loginData);
  const logout = useAuthStore((s) => s.logout);

  const logoUrl =
    (profile as any)?.logo_url ?? (profile as any)?.logo ?? null;
  const defaultLogoUrl = "/dressnmore-logo.jpg";
  const sidebarImageUrl = logoUrl ?? defaultLogoUrl;
  const displayName = profile?.name ?? loginData?.user?.name ?? "dressnmore";
  const userInitials = (displayName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <Sidebar
      side="right"
      variant="floating"
      collapsible="icon"
      data-app-sidebar
      className={cn(
        "w-68 text-sidebar-foreground",
        "md:*:data-[slot=sidebar-container]:px-0",
        "md:**:data-[sidebar=sidebar]:bg-white md:**:data-[sidebar=sidebar]:border-0",
        "md:**:data-[sidebar=sidebar]:shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)]",
        "md:**:data-[sidebar=sidebar]:rounded-none"
      )}
    >
      <SidebarHeader className="px-4 pt-4 pb-3 flex flex-col gap-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pt-3">
        {/* User profile + toggle */}
        <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-slate-200 shrink-0">
            <AvatarImage src={sidebarImageUrl ?? undefined} alt={displayName} className="object-cover" />
            <AvatarFallback className="rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-semibold text-slate-900 tracking-tight truncate">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                حساب المستخدم
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="size-7 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {open ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Collapsed icon mode — avatar only */}
        <div className="hidden group-data-[collapsible=icon]:flex w-full flex-col items-center gap-2">
          <Avatar className="h-8 w-8 rounded-full overflow-hidden ring-1 ring-slate-200">
            <AvatarImage src={sidebarImageUrl ?? undefined} alt={displayName} className="object-cover" />
            <AvatarFallback className="rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="size-7 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="فتح القائمة"
          >
            <PanelRightOpen className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-1 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200/70">
        <SidebarNav items={filteredLabels} />
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 px-3 py-2.5 group-data-[collapsible=icon]:px-1.5">
        <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="إعدادات الحساب"
              onClick={() => navigate("/account")}
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50"
              onClick={handleLogout}
              title="تسجيل الخروج"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

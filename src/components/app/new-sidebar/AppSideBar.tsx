import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, LogOut } from "lucide-react";
import { SidebarNav } from "./SideBarNav";
import { sidebarLabels } from "../sidebar/constants";
import useSidebarLabel, { useSidebarPermissions } from "../sidebar/useSidebarLabel";
import { useProfile } from "@/api/v2/account/account.hooks";
import { useAuthStore } from "@/zustand-stores/auth.store";

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const [pinned, setPinned] = useState(false);

  const permissions = useSidebarPermissions();
  const filteredLabels = useSidebarLabel(sidebarLabels, permissions);

  const { data: profile } = useProfile();
  const loginData = useAuthStore((s) => s.loginData);
  const logout = useAuthStore((s) => s.logout);

  const avatarUrl = profile?.avatar_url ?? profile?.avatar ?? null;
  const displayName = profile?.name ?? loginData?.user?.name ?? "dressnmore";

  const handleToggle = () => {
    if (open) {
      if (pinned) {
        setOpen(false);
        setPinned(false);
      } else {
        setPinned(true);
      }
    } else {
      setOpen(true);
      setPinned(true);
    }
  };

  const handleMouseEnter = () => {
    if (!open) {
      setOpen(true);
      setPinned(false);
    }
  };

  const handleMouseLeave = () => {
    if (!pinned) setOpen(false);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <Sidebar
      side="right"
      collapsible="icon"
      data-app-sidebar
      data-open-by={open ? (pinned ? "button" : "hover") : undefined}
      className={cn(
        "w-80 border-l bg-sidebar text-sidebar-foreground",
        "shadow-[0_0_30px_rgba(15,23,42,0.14)]"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* HEADER */}
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3 flex flex-col gap-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        {/* زر الفتح/الإغلاق */}
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-semibold tracking-[0.15em] uppercase text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
            dressnmore
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className={cn(
              "size-8 shrink-0 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              open && pinned && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
            )}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            title={open ? "إغلاق القائمة" : "فتح القائمة"}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* هوية المستخدم / اللوغو */}
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
          <div className="relative flex items-center justify-center rounded-xl p-1.5 bg-linear-to-b from-sidebar-accent/40 to-sidebar-accent/10 ring-1 ring-sidebar-border/60 shadow-sm">
            <Avatar className="h-12 w-12 rounded-xl overflow-hidden border border-background/80 shadow-inner">
              <AvatarImage src={avatarUrl ?? undefined} alt="صورة المستخدم" className="object-cover" />
              <AvatarFallback className="rounded-xl bg-muted/50 w-full h-full flex items-center justify-center p-2">
                <img
                  src="/dressnmore-logo.jpg"
                  alt="شعار dressnmore"
                  className="w-full h-full object-contain opacity-90 dark:invert"
                />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className="text-sm font-semibold text-sidebar-foreground truncate"
              title={displayName}
            >
              {displayName}
            </span>
            <span className="text-[11px] text-sidebar-foreground/60">
              لوحة التحكم
            </span>
          </div>
        </div>

        {/* نسخة مضغوطة للأيقونة فقط */}
        <div className="hidden group-data-[collapsible=icon]:flex justify-center items-center">
          <div className="flex items-center justify-center rounded-lg p-0.5 ring-1 ring-sidebar-border/50 bg-sidebar-accent/20">
            <Avatar className="h-9 w-9 rounded-lg overflow-hidden border border-background/80">
              <AvatarImage src={avatarUrl ?? undefined} alt="صورة المستخدم" className="object-cover" />
              <AvatarFallback className="rounded-lg bg-muted/50 w-full h-full flex items-center justify-center p-1">
                <img
                  src="/dressnmore-logo.jpg"
                  alt="شعار dressnmore"
                  className="w-full h-full object-contain opacity-90 dark:invert"
                />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </SidebarHeader>

      {/* المحتوى (القائمة) */}
      <SidebarContent className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 scrollbar-thin scrollbar-track-sidebar-accent/20 scrollbar-thumb-sidebar-border/70">
        <SidebarNav items={filteredLabels} />
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="border-t border-sidebar-border px-3 py-2 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <span className="text-[11px] text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
            © {new Date().getFullYear()} dressnmore
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
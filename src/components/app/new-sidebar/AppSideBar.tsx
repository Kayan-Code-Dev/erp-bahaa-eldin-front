import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import appLogo from "@/assets/app-logo.svg";
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
  const avatarUrl = profile?.avatar_url ?? profile?.avatar ?? null;
  const displayName = profile?.name ?? loginData?.user?.name ?? "";

  const handleButtonClick = () => {
    if (open) {
      if (pinned) {
        setOpen(false);
        setPinned(false);
      } else {
        setPinned(true); /* مفتوح بالهوفر → الضغط يثبته مفتوحاً */
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

  return (
    <Sidebar
      side="right"
      collapsible="icon"
      data-app-sidebar
      data-open-by={open ? (pinned ? "button" : "hover") : undefined}
      className="w-80 border-l border-sidebar-border bg-sidebar text-sidebar-foreground"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarHeader className="border-b border-sidebar-border p-2 flex flex-col gap-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleButtonClick}
          className={cn(
            "size-9 shrink-0 rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            open && pinned && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          )}
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          title={open ? "إغلاق القائمة" : "فتح القائمة"}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="h-px bg-sidebar-border shrink-0 group-data-[collapsible=icon]:hidden" />
        {/* عرض مفتوح: صورة/لوغو مع اسم المستخدم */}
        <div className="flex flex-col items-center gap-3 py-2 group-data-[collapsible=icon]:hidden">
          <div className="relative flex items-center justify-center rounded-xl p-1.5 bg-linear-to-b from-sidebar-accent/40 to-sidebar-accent/10 ring-1 ring-sidebar-border/60 shadow-sm">
            <Avatar className="h-20 w-20 rounded-xl overflow-hidden border-2 border-background shadow-inner">
              <AvatarImage src={avatarUrl ?? undefined} alt="صورة المستخدم" className="object-cover" />
              <AvatarFallback className="rounded-xl bg-muted/50 w-full h-full flex items-center justify-center p-2">
                <img src={appLogo} alt="شعار التطبيق" className="w-full h-full object-contain opacity-80 dark:opacity-90 dark:invert" />
              </AvatarFallback>
            </Avatar>
          </div>
          {displayName && (
            <p className="text-center text-sm font-medium text-sidebar-foreground truncate w-full px-1" title={displayName}>
              {displayName}
            </p>
          )}
        </div>
        {/* عرض مضغوط: أيقونة صغيرة */}
        <div className="hidden group-data-[collapsible=icon]:flex justify-center items-center py-1">
          <div className="flex items-center justify-center rounded-lg p-0.5 ring-1 ring-sidebar-border/50 bg-sidebar-accent/20">
            <Avatar className="h-9 w-9 rounded-lg overflow-hidden border border-background/80">
              <AvatarImage src={avatarUrl ?? undefined} alt="صورة المستخدم" className="object-cover" />
              <AvatarFallback className="rounded-lg bg-muted/50 w-full h-full flex items-center justify-center p-1">
                <img src={appLogo} alt="شعار التطبيق" className="w-full h-full object-contain opacity-80 dark:invert" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:items-center scrollbar-thin scrollbar-track-sidebar-accent/50 scrollbar-thumb-sidebar-border">
        <SidebarNav items={filteredLabels} />
      </SidebarContent>
    </Sidebar>
  );
}

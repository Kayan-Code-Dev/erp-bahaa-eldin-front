import { useMemo, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Menu, LogOut, Search } from "lucide-react";
import { SidebarNav } from "./SideBarNav";
import { sidebarLabels, SidebarLabel } from "../sidebar/constants";
import useSidebarLabel, { useSidebarPermissions } from "../sidebar/useSidebarLabel";
import { useProfile } from "@/api/v2/account/account.hooks";
import { useAuthStore } from "@/zustand-stores/auth.store";

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const [pinned, setPinned] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const permissions = useSidebarPermissions();
  const filteredLabels = useSidebarLabel(sidebarLabels, permissions);

  const { data: profile } = useProfile();
  const loginData = useAuthStore((s) => s.loginData);
  const logout = useAuthStore((s) => s.logout);

  const avatarUrl = profile?.avatar_url ?? profile?.avatar ?? null;
  const displayName = profile?.name ?? loginData?.user?.name ?? "dressnmore";
  const userInitials = (displayName || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

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

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const visibleLabels: SidebarLabel[] = useMemo(() => {
    if (!normalizedQuery) return filteredLabels;

    const filterItems = (items: SidebarLabel[]): SidebarLabel[] => {
      const result: SidebarLabel[] = [];

      items.forEach((item) => {
        const matchSelf = item.label.toLowerCase().includes(normalizedQuery);
        const children = item.subItems ? filterItems(item.subItems) : [];

        if (matchSelf || children.length) {
          const nextItem: SidebarLabel = {
            ...item,
            subItems: children.length ? children : item.subItems,
          };
          result.push(nextItem);
        }
      });

      return result;
    };

    return filterItems(filteredLabels);
  }, [filteredLabels, normalizedQuery]);

  return (
    <Sidebar
      side="right"
      variant="floating"
      collapsible="icon"
      data-app-sidebar
      data-open-by={open ? (pinned ? "button" : "hover") : undefined}
      className={cn(
        "w-80 text-sidebar-foreground",
        "md:*:data-[slot=sidebar-container]:px-2",
        "md:**:data-[sidebar=sidebar]:bg-sidebar md:**:data-[sidebar=sidebar]:border-sidebar-border/70",
        "md:**:data-[sidebar=sidebar]:shadow-[0_18px_40px_rgba(15,23,42,0.45)]"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* HEADER بأسلوب مشابه لـ Zoho: شريط علوي بسيط مع بروفايل المستخدم وزر القائمة */}
      <SidebarHeader className="border-b border-sidebar-border/60 px-3 pt-3 pb-2 flex flex-col gap-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        {/* وضع السايدبار المفتوح: بروفايل + زر قائمة على الحافة */}
        <div className="flex items-center justify-between w-full gap-2 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-9 w-9 rounded-xl overflow-hidden border border-sidebar-border/70 bg-sidebar-accent/20 shadow-inner">
              <AvatarImage src={avatarUrl ?? undefined} alt="صورة المستخدم" className="object-cover" />
              <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-sm font-semibold w-full h-full flex items-center justify-center">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span
                className="text-sm font-semibold tracking-tight truncate"
                title={displayName}
              >
                {displayName}
              </span>
              <span className="text-[11px] text-sidebar-foreground/60">
                حساب المستخدم
              </span>
            </div>
          </div>

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

        {/* وضع الأيقونة فقط: زر القائمة في المنتصف داخل الهيدر الضيق */}
        <div className="hidden group-data-[collapsible=icon]:flex w-full items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="size-9 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            title={open ? "إغلاق القائمة" : "فتح القائمة"}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      {/* المحتوى (القائمة) مع بطاقة مساحة العمل + مربع البحث بتصميم مختلف كلياً */}
      <SidebarContent className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 scrollbar-thin scrollbar-track-sidebar-accent/20 scrollbar-thumb-sidebar-border/70">
        {/* بطاقة مساحة العمل الاحترافية */}
        <div className="px-1.5 mb-3 mt-1 w-full space-y-2 group-data-[collapsible=icon]:hidden">
          <div className="rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/25 shadow-sm overflow-hidden">
            <div className="flex items-center justify-start gap-2 px-3 py-2.5 bg-[linear-gradient(to_left,rgba(144,116,87,0.18),transparent)]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.35),transparent_60%),rgba(15,23,42,0.12)] border border-sidebar-border/70 shadow-inner text-[13px] font-semibold text-sidebar-foreground">
                  DM
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-medium text-sidebar-foreground/60">
                    مساحة العمل
                  </span>
                  <span className="text-xs font-semibold truncate">
                    Dressnmore Workspace
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* شريط البحث فقط بدون زر الإضافة */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 rounded-xl bg-sidebar-accent/30 border border-sidebar-border/60 px-2.5 py-1.5 shadow-sm">
              <Search className="w-3.5 h-3.5 text-sidebar-foreground/45 shrink-0" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في القوائم"
                className="h-6 border-0 bg-transparent px-0 text-[12px] placeholder:text-sidebar-foreground/45 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
              />
            </div>
          </div>
        </div>

        {/* القائمة الرئيسية */}
        <SidebarNav items={visibleLabels} />
      </SidebarContent>

      {/* FOOTER بسيط لزر تسجيل الخروج */}
      <SidebarFooter className="border-t border-sidebar-border/60 px-3 py-2 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center w-full">
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
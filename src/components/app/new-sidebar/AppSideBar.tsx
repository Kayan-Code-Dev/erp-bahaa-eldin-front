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
import { cn } from "@/lib/utils";
import { PanelRightClose, PanelRightOpen, LogOut, Search, Settings, X } from "lucide-react";
import { useNavigate } from "react-router";
import { SidebarNav } from "./SideBarNav";
import { sidebarLabels, SidebarLabel } from "../sidebar/constants";
import useSidebarLabel, { useSidebarPermissions } from "../sidebar/useSidebarLabel";
import { useProfile } from "@/api/v2/account/account.hooks";
import { useAuthStore } from "@/zustand-stores/auth.store";

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

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
    setOpen(!open);
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
      className={cn(
        "w-68 text-sidebar-foreground",
        "md:*:data-[slot=sidebar-container]:px-0",
        "md:**:data-[sidebar=sidebar]:bg-white md:**:data-[sidebar=sidebar]:border-0",
        "md:**:data-[sidebar=sidebar]:shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)]",
        "md:**:data-[sidebar=sidebar]:rounded-none"
      )}
    >
      {/* HEADER — بروفايل المستخدم + بحث + زر toggle */}
      <SidebarHeader className="px-4 pt-4 pb-3 flex flex-col gap-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pt-3">
        {/* User profile + toggle */}
        <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="h-9 w-9 rounded-lg overflow-hidden ring-1 ring-slate-200 shrink-0">
              <AvatarImage src={avatarUrl ?? undefined} alt={displayName} className="object-cover" />
              <AvatarFallback className="rounded-lg bg-main-gold/10 text-main-gold text-[11px] font-semibold">
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
          <Avatar className="h-8 w-8 rounded-lg overflow-hidden ring-1 ring-slate-200">
            <AvatarImage src={avatarUrl ?? undefined} alt={displayName} className="object-cover" />
            <AvatarFallback className="rounded-lg bg-main-gold/10 text-main-gold text-[10px] font-semibold">
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

        {/* Search */}
        <div className="w-full group-data-[collapsible=icon]:hidden">
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg px-2.5 h-8 transition-all duration-150",
              searchFocused
                ? "bg-white ring-1 ring-main-gold/40 shadow-sm"
                : "bg-slate-50 hover:bg-slate-100"
            )}
          >
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="بحث..."
              className="flex-1 bg-transparent border-0 outline-none text-[12px] text-slate-700 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </SidebarHeader>

      {/* CONTENT — القائمة بدون أي عناصر إضافية */}
      <SidebarContent className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-1 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200/70">
        <SidebarNav items={visibleLabels} />
      </SidebarContent>

      {/* FOOTER — إعدادات + تسجيل خروج */}
      <SidebarFooter className="border-t border-slate-100 px-3 py-2.5 group-data-[collapsible=icon]:px-1.5">
        <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="إعدادات الحساب"
              onClick={() => navigate("/dashboard/account")}
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

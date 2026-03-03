import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { includeRoute } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router";
import { SidebarLabel } from "../sidebar/constants";
import CollapsibleSubItem from "./CollapsibleSubItem";

// Define the prop types
type SidebarNavProps = {
  items: SidebarLabel[];
  keyPrefix?: string;
};

export function SidebarNav({ items, keyPrefix = "nav" }: SidebarNavProps) {
  const { pathname } = useLocation();

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center gap-0.5 mt-1">
      {items.map((item, index) => {
        const active = includeRoute(pathname, item.path, item.level);
        const uniqueKey = `${keyPrefix}-${index}-${item.label}`;
        const isTopLevel = item.level === 1;
        // --- 1. RENDER ITEM WITH SUB-MENU (يشبه مجموعات Zoho القابلة للطي) ---
        if (item.subItems) {
          return (
            <CollapsibleSubItem key={uniqueKey} item={item} keyPrefix={uniqueKey} />
          );
        }

        // --- 2. RENDER SIMPLE ITEM (NO SUB-MENU) ---
        return (
          <SidebarMenuItem
            key={uniqueKey}
            className="py-0.5 px-2 group-data-[collapsible=icon]:w-fit group-data-[collapsible=icon]:mx-auto"
          >
            <SidebarMenuButton
              asChild
              isActive={active}
              className={cn(
                "w-full justify-start text-[13px] rounded-md px-1.5 py-1.5 text-sidebar-foreground/85 bg-transparent",
                "hover:bg-sidebar-accent/35 hover:text-sidebar-accent-foreground/95",
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0",
                active && "sidebar-active-gold"
              )}
            >
              <Link
                to={item.path}
                className="flex items-center gap-2 min-w-0 text-inherit"
              >
                {item.iconComponent ? (
                  <span className="flex h-4 w-4 items-center justify-center text-sidebar-foreground/75 shrink-0 [&_svg]:w-4 [&_svg]:h-4 [&_svg]:shrink-0">
                    {item.iconComponent}
                  </span>
                ) : item.icon ? (
                  <span className="flex h-4 w-4 items-center justify-center text-sidebar-foreground/75 shrink-0">
                    <img
                      src={item.icon}
                      className="w-4 h-4 opacity-90"
                      alt=""
                    />
                  </span>
                ) : null}
                <span
                  className={cn(
                    "truncate group-data-[collapsible=icon]:hidden",
                    isTopLevel
                      ? "text-[13px] font-medium"
                      : "text-[12px] text-sidebar-foreground/80"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

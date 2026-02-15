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
    <SidebarMenu>
      {items.map((item, index) => {
        const active = includeRoute(pathname, item.path, item.level);
        const uniqueKey = `${keyPrefix}-${index}-${item.label}`;
        // --- 1. RENDER ITEM WITH SUB-MENU ---
        if (item.subItems) {
          return (
            <CollapsibleSubItem key={uniqueKey} item={item} keyPrefix={uniqueKey} />
          );
        }

        // --- 2. RENDER SIMPLE ITEM (NO SUB-MENU) ---
        return (
          <SidebarMenuItem key={uniqueKey} className="py-0.5 px-1">
            <SidebarMenuButton
              asChild
              isActive={active}
              className={cn(
                "w-full justify-start text-sm rounded-lg px-3 py-2.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2",
                active && "sidebar-active-gold"
              )}
            >
              <Link to={item.path} className="flex items-center gap-2 min-w-0 text-inherit">
                {item.iconComponent ? (
                  <span className="flex items-center justify-center shrink-0 min-w-5 min-h-5 w-5 h-5 [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 [&_svg]:text-current text-inherit">
                    {item.iconComponent}
                  </span>
                ) : item.icon ? (
                  <img src={item.icon} className="w-5 h-5 shrink-0 opacity-90" alt="" />
                ) : null}
                <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

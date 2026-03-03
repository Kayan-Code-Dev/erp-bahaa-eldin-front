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

type SidebarNavProps = {
  items: SidebarLabel[];
  keyPrefix?: string;
};

export function SidebarNav({ items, keyPrefix = "nav" }: SidebarNavProps) {
  const { pathname } = useLocation();

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center gap-px">
      {items.map((item, index) => {
        const active = includeRoute(pathname, item.path, item.level);
        const uniqueKey = `${keyPrefix}-${index}-${item.label}`;
        const isTopLevel = item.level === 1;

        if (item.subItems) {
          return (
            <CollapsibleSubItem key={uniqueKey} item={item} keyPrefix={uniqueKey} />
          );
        }

        return (
          <SidebarMenuItem
            key={uniqueKey}
            className="px-1 group-data-[collapsible=icon]:w-fit group-data-[collapsible=icon]:mx-auto"
          >
            <SidebarMenuButton
              asChild
              isActive={active}
              className={cn(
                "w-full justify-start rounded-lg px-2.5 py-1.5 text-slate-600 bg-transparent",
                "hover:bg-slate-50 hover:text-slate-900",
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0",
                active && "sidebar-item-active"
              )}
            >
              <Link
                to={item.path}
                className="flex items-center gap-2.5 min-w-0 text-inherit"
              >
                {item.iconComponent ? (
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md shrink-0 transition-colors",
                      "[&_svg]:w-4 [&_svg]:h-4 [&_svg]:shrink-0",
                      active
                        ? "bg-main-gold/10 text-main-gold"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {item.iconComponent}
                  </span>
                ) : item.icon ? (
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md shrink-0 transition-colors",
                      active
                        ? "bg-main-gold/10"
                        : "bg-slate-100"
                    )}
                  >
                    <img
                      src={item.icon}
                      className={cn("w-4 h-4", active ? "opacity-100" : "opacity-70")}
                      alt=""
                    />
                  </span>
                ) : null}
                <span
                  className={cn(
                    "truncate group-data-[collapsible=icon]:hidden",
                    isTopLevel ? "text-[13px]" : "text-[12px]",
                    active ? "font-semibold text-slate-900" : "font-medium"
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

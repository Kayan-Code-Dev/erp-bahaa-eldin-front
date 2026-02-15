import { useState } from "react";
import { useLocation } from "react-router";
import { includeRoute, hasActiveChild } from "@/lib/helper";
import {
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarLabel } from "../sidebar/constants";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./SideBarNav";

const CollapsibleSubItem = ({ item, keyPrefix }: { item: SidebarLabel; keyPrefix?: string }) => {
    const { pathname } = useLocation();
    const active = includeRoute(pathname, item.path, item.level);
    const hasActiveDescendant = hasActiveChild(pathname, item);
    // Parent should only be colored if it's active AND no child is active
    const shouldColorParent = active && !hasActiveDescendant;
    const [open, setOpen] = useState(active || hasActiveDescendant);

    return (
        <Collapsible
            key={item.label}
            defaultOpen={active || hasActiveDescendant}
            open={open}
            className="py-1 w-full"
            onOpenChange={setOpen}
        >
            <SidebarGroup className="px-1">
                <SidebarMenuItem className="relative">
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                            asChild
                            isActive={shouldColorParent}
                            className={cn(
                                "w-full justify-start text-sm rounded-lg px-3 py-2.5 cursor-pointer text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2",
                                shouldColorParent && "sidebar-active-gold"
                            )}
                        >
                            <div className="flex items-center justify-between w-full min-w-0 text-inherit">
                                <div className="shrink-0 flex items-center gap-2 min-w-0">
                                    {item.iconComponent ? (
                                        <span className="flex items-center justify-center shrink-0 min-w-5 min-h-5 w-5 h-5 [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 [&_svg]:text-current text-inherit">
                                            {item.iconComponent}
                                        </span>
                                    ) : item.icon ? (
                                        <img src={item.icon} className="w-5 h-5 shrink-0 opacity-80" alt="" />
                                    ) : null}
                                    <span className="truncate text-inherit group-data-[collapsible=icon]:hidden">{item.label}</span>
                                </div>
                                <ChevronLeft
                                    className={cn(
                                        "h-4 w-4 shrink-0 transition duration-200 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden",
                                        open && "-rotate-90"
                                    )}
                                />
                            </div>
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                </SidebarMenuItem>

                <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                    <SidebarGroupContent className="ps-3 pt-2 pe-1 pb-2 mt-0.5 ms-1 rounded-lg bg-sidebar-accent/30 border border-sidebar-border w-[calc(100%-0.5rem)]">
                        <SidebarNav items={item.subItems!} keyPrefix={keyPrefix} />
                    </SidebarGroupContent>
                </CollapsibleContent>
            </SidebarGroup>
        </Collapsible>)
}

export default CollapsibleSubItem
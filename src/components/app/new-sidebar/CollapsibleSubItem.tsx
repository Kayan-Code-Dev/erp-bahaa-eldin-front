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

                    {/* The dropdown trigger button (chevron) */}
                    <CollapsibleTrigger asChild>
                        {/* The main link (e.g., "إدارة الفروع") */}
                        <SidebarMenuButton
                            asChild
                            className={cn(
                                "w-full justify-start text-base text-gray-600 hover:text-main-gold hover:bg-transparent cursor-pointer",
                                shouldColorParent ? "bg-[#907457] text-white hover:text-white hover:bg-[#907457]" : ""
                            )}
                        >
                            <div className="flex items-center justify-between!">
                                <div className="shrink-0 flex items-center gap-2">
                                    {item.iconComponent ? (
                                        <span className="w-5 h-5 flex items-center justify-center">{item.iconComponent}</span>
                                    ) : item.icon ? (
                                        <img src={item.icon} className="w-5 h-5" />
                                    ) : null}
                                    <span>{item.label}</span>
                                </div>
                                <ChevronLeft
                                    className={cn(
                                        "h-4 w-4 transition duration-200 group-data-[state=open]:-rotate-90",
                                        open && "-rotate-90"
                                    )}
                                />
                            </div>
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                </SidebarMenuItem>

                {/* The Sub-menu Content */}
                <CollapsibleContent>
                    <SidebarGroupContent className="ps-4 pt-2 w-[95%]">
                        <SidebarNav items={item.subItems!} keyPrefix={keyPrefix} />
                    </SidebarGroupContent>
                </CollapsibleContent>
            </SidebarGroup>
        </Collapsible>)
}

export default CollapsibleSubItem
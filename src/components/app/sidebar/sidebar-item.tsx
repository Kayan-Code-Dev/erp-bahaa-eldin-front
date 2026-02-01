import { Link, useLocation } from "react-router";
import SubSidebarItem from "./sub-sidebar-item";
import { useEffect, useState } from "react";
import { includeRoute } from "@/lib/helper";
import {
  Accordion,
  AccordionTrigger,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { SidebarLabel } from "./constants";

export type Props = SidebarLabel;

function SidebarItem({ icon, label, path, subItems, level }: Props) {
  const [active, setActive] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setActive(includeRoute(pathname, path, level));
  }, [pathname, path]);

  return subItems ? (
    <AccordionSidebarItem
      icon={icon}
      label={label}
      path={path}
      subItems={subItems}
      active={active}
      level={level}
    />
  ) : (
    <div className="flex flex-col gap-2">
      <Link
        to={path}
        className={`hover:text-[#8b7055] flex items-center gap-2 p-2 rounded-md ${
          active ? "bg-[#f2f2f2]" : ""
        }`}
      >
        {icon && <img src={icon} className="w-5 h-5" />}
        <span className={`text-sm ${active ? "font-medium" : ""}`}>
          {label}
        </span>
      </Link>
    </div>
  );
}

const AccordionSidebarItem = ({
  icon,
  label,
  path,
  subItems,
  active,
}: Props & { active: boolean }) => (
  <Accordion type="single" collapsible defaultValue="orders" className="w-full">
    <AccordionItem value={label}>
      <AccordionTrigger
        className={` ${
          active ? "bg-[#f2f2f2]" : ""
        } hover:text-[#8b7055] hover:no-underline font-medium} px-2`}
      >
        <Link to={path} className={`flex items-center gap-2 rounded-md `}>
          {icon && <img src={icon} className="w-5 h-5" />}
          <span className={`text-sm ${active ? "font-medium" : ""}`}>
            {label}
          </span>
        </Link>
      </AccordionTrigger>
      <AccordionContent className="pt-2">
        <div className="flex flex-col gap-2">
          {subItems!.map((item) => (
            <SubSidebarItem
              key={item.label}
              {...item}
              isParentActive={active}
              level={item.level}
              active={active}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export default SidebarItem;

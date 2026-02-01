import { includeRoute } from "@/lib/helper";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { SidebarLabel } from "./constants";
import {
  Accordion,
  AccordionTrigger,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";

type Props = SidebarLabel & {
  isParentActive: boolean;
  active: boolean;
};

function SubSidebarItem({
  label,
  path,
  isParentActive,
  level,
  subItems,
  icon,
}: Props) {
  const [active, setActive] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setActive(isParentActive && includeRoute(pathname, path, level));
  }, [pathname, path, isParentActive]);

  return !subItems ? (
    <div key={label} className={`flex flex-col h-6 rounded-lg px-${level + 4}`}>
      <Link
        to={path}
        className={`flex h-6 gap-4 `}
      >
        <div
          className={`relative w-fit mr-[${level + 8}px] ${
            active ? "text-[#8f7456] font-bold" : "text-[#5d6679]"
          } text-sm leading-6 whitespace-nowrap [direction:rtl]`}
        >
          {label}
        </div>
      </Link>
    </div>
  ) : (
    <AccordionSidebarSubItem
      icon={icon}
      label={label}
      path={path}
      subItems={subItems}
      active={active}
      isParentActive={isParentActive}
      level={level}
    />
  );
}

const AccordionSidebarSubItem = ({
  isParentActive,
  label,
  path,
  subItems,
  active,
  level,
}: Props) => (
  <Accordion
    type="single"
    collapsible
    defaultValue="orders"
    className={`w-full px-${level + 4}`}
  >
    <AccordionItem value={label}>
      <AccordionTrigger className={`py-0 my-0`}>
        <Link
          to={path}
          className={`w-fit ${
            active ? "text-[#8f7456] font-bold" : "text-[#5d6679]"
          } text-sm leading-6 whitespace-nowrap [direction:rtl]`}
        >
          {label}
        </Link>
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col gap-2 pt-2 pr-4">
          {subItems!.map((item) => (
            <SubSidebarItem
              key={item.label}
              {...item}
              isParentActive={active}
              level={item.level}
              active={isParentActive && active}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export default SubSidebarItem;

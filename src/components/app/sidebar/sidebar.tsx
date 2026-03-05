import { sidebarLabels } from "./constants";
import SidebarItem from "./sidebar-item";
import useSidebarLabel, { useSidebarPermissions } from "./useSidebarLabel";

function Sidebar() {
  const permissions = useSidebarPermissions();
  const filteredLabels = useSidebarLabel(sidebarLabels, permissions);

  return (
    <div className="hidden md:block w-64 bg-white border-l min-h-[calc(100vh-64px)]">
      <div className="flex justify-center items-center p-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-white shadow-md ring-1 ring-slate-200/80 flex items-center justify-center">
          <img src="/dressnmore-logo.jpg" alt="dressnmore logo" className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex flex-col gap-4">
          {filteredLabels.map((item) => (
            <SidebarItem
              key={item.path + item.label}
              icon={item.icon}
              iconComponent={item.iconComponent}
              label={item.label}
              path={item.path}
              subItems={item.subItems}
              level={item.level}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

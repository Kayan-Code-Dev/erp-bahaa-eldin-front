import {
  READ_CATEGORIES,
  READ_CITIES,
  READ_COUNTRIES,
  READ_SUBCATEGORIES,
} from "@/lib/permissions.helper";
import React from "react";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Wallet2,
  FileText,
  List,
  PlusCircle,
  Truck,
  RotateCcw,
  Clock,
  Banknote,
  Users,
  UserCircle,
  Shield,
  Building2,
  Factory,
  Package,
  Wrench,
  Settings,
  ShieldEllipsis,
  Minus,
  FileBarChart,
  ArrowRightLeft,
  Globe,
  MapPin,
  Tags,
  FolderTree,
  Building,
  Briefcase,
  Layers,
  ShoppingCart,
  Bell,
} from "lucide-react";

const iconSize = 20;
const createIcon = (Icon: React.ComponentType<{ size?: number; className?: string }>, size = iconSize) =>
  React.createElement(Icon, { size, className: "shrink-0 text-current" });

export type SidebarLabel = {
  icon: string | null;
  label: string;
  path: string;
  level: number;
  subItems?: SidebarLabel[];
  permission?: string;
  iconComponent?: React.ReactNode | null;
};

export const sidebarLabels: SidebarLabel[] = [
  // 1. Dashboard
  {
    icon: null,
    label: "لوحة التحكم",
    path: "/",
    level: 1,
    iconComponent: createIcon(LayoutDashboard),
  },
  // 2. Notifications
  {
    icon: null,
    label: "الإشعارات",
    path: "/notifications",
    level: 1,
    iconComponent: createIcon(Bell),
  },
  // 3. Cashbox and accounting
  {
    icon: null,
    label: "الخزنة و المحاسبة",
    path: "/cashboxes",
    level: 1,
    iconComponent: createIcon(Wallet),
    subItems: [
      {
        icon: null,
        label: "إدارة المدفوعات",
        path: "/payments",
        level: 2,
        iconComponent: createIcon(Receipt),
      },
      {
        icon: null,
        label: "إدارة المصروفات",
        path: "/expenses",
        level: 2,
        iconComponent: createIcon(Wallet2),
      },
    ],
  },
  // 4. Invoices
  {
    icon: null,
    label: "الفواتير",
    path: "/orders",
    level: 1,
    iconComponent: createIcon(FileText),
    subItems: [
      {
        icon: null,
        label: "قائمة الفواتير ",
        path: "/orders/list",
        level: 2,
        iconComponent: createIcon(List),
      },
      {
        icon: null,
        label: "اضافة فاتورة جديدة",
        path: "/orders/choose-client",
        level: 2,
        iconComponent: createIcon(PlusCircle),
      },
    ],
  },
  // 5. Deliveries and returns
  {
    icon: null,
    label: "التسليم والارجاع",
    path: "/deliveries",
    level: 1,
    iconComponent: createIcon(Truck),
    subItems: [
      {
        icon: null,
        label: "إدارة التسليمات",
        path: "/deliveries",
        level: 2,
        iconComponent: createIcon(Truck),
      },
      {
        icon: null,
        label: "إدارة الارجاعات",
        path: "/returns",
        level: 2,
        iconComponent: createIcon(RotateCcw),
      },
      {
        icon: null,
        label: "الارجاعات المتأخرة",
        path: "/overdue-returns",
        level: 2,
        iconComponent: createIcon(Clock),
      },
    ],
  },
  // 6. Cashbox
  {
    icon: null,
    label: "الخزنة",
    path: "/cashboxes",
    level: 1,
    iconComponent: createIcon(Banknote),
  },
  // 7. Clients
  {
    icon: null,
    label: "العملاء",
    path: "/clients",
    level: 1,
    iconComponent: createIcon(Users),
  },
  // 8. Employees
  {
    icon: null,
    label: "الموظفين",
    path: "/employees",
    level: 1,
    iconComponent: createIcon(UserCircle),
    subItems: [
      {
        icon: null,
        label: "اضافة موظف جديد",
        path: "/employees/add",
        level: 2,
        iconComponent: createIcon(PlusCircle),
      },
      {
        icon: null,
        label: "قائمة الموظفين",
        path: "/employees/list",
        level: 2,
        iconComponent: createIcon(List),
      },
      {
        icon: null,
        label: "ضمانات الموظفين",
        path: "/employees/custodies",
        level: 2,
        iconComponent: createIcon(ShieldEllipsis),
      },
      {
        icon: null,
        label: "الوثائق الشخصية للموظفين",
        path: "/employees/employee-documents",
        level: 2,
        iconComponent: createIcon(FileText),
      },
      {
        icon: null,
        label: "الخصمات المرتبطة بالموظفين",
        path: "/employees/employee-deductions",
        level: 2,
        iconComponent: createIcon(Minus),
      },
    ],
  },
  // 9. Permissions and Roles
  {
    icon: null,
    label: "الصلاحيات والأذونات",
    path: "/permissions-roles",
    level: 1,
    iconComponent: createIcon(Shield),
    subItems: [
      {
        icon: null,
        label: "المشرف",
        path: "/permissions-roles/admins",
        level: 2,
        iconComponent: createIcon(UserCircle),
        subItems: [
          {
            icon: null,
            label: "الأذونات",
            path: "/permissions-roles/admins/permissions",
            level: 3,
            iconComponent: createIcon(ShieldEllipsis),
          },
          {
            icon: null,
            label: "قائمة الصلاحيات",
            path: "/permissions-roles/admins/roles/list-roles",
            level: 3,
            iconComponent: createIcon(List),
          },
          {
            icon: null,
            label: "إضافة صلاحية جديدة",
            path: "/permissions-roles/admins/roles/create",
            level: 3,
            iconComponent: createIcon(PlusCircle),
          },
        ],
      },
      {
        icon: null,
        label: "مدير الفروع",
        path: "/permissions-roles/branches-managers",
        level: 2,
        iconComponent: createIcon(Building2),
        subItems: [
          {
            icon: null,
            label: "صلاحيات مديري الفروع",
            path: "/permissions-roles/branches-managers/roles",
            level: 3,
            iconComponent: createIcon(Shield),
          },
        ],
      },
      {
        icon: null,
        label: "الفروع",
        path: "/permissions-roles/branches",
        level: 2,
        iconComponent: createIcon(Building),
        subItems: [
          {
            icon: null,
            label: "صلاحيات الفروع",
            path: "/permissions-roles/branches/roles",
            level: 3,
            iconComponent: createIcon(Shield),
          },
        ],
      },
    ],
  },
  // 10. Branches
  {
    icon: null,
    label: "الفروع",
    path: "/branch",
    level: 1,
    iconComponent: createIcon(Building2),
  },
  // 11. Workshop management
  {
    icon: null,
    label: "إدارة الورشة",
    path: "/workshop",
    level: 1,
    iconComponent: createIcon(Wrench),
  },
  // 12. Factory management (page /factory) below workshop management
  {
    icon: null,
    label: "إدارة المصنع",
    path: "/factory",
    level: 1,
    iconComponent: createIcon(Factory),
  },
  // 13. Reports
  {
    icon: null,
    label: "التقارير",
    path: "/clothes",
    level: 1,
    iconComponent: createIcon(FileBarChart),
  },
  // Disabled: Orders and sales management menu section
  // {
  //   icon: orders,
  //   label: "إدارة الطلبات والمبيعات",
  //   path: "/orders",
  //   level: 1,
  //   subItems: [
  //     {
  //       icon: null,
  //       label: "الفروع",
  //       path: "/orders/branches",
  //       level: 2,
  //       subItems: [
  //         {
  //           icon: null,
  //           label: "اضافة طلبية جديدة",
  //           path: "/orders/branches/add-new-order",
  //           level: 3,
  //           permission: CREATE_ORDER,
  //         },
  //         {
  //           icon: null,
  //           label: "قائمة الطلبات",
  //           path: "/orders/branches",
  //           level: 3,
  //           permission: READ_ORDERS,
  //         },
  //       ],
  //     },
  //     {
  //       icon: null,
  //       label: "الموظفين",
  //       path: "/orders/employees",
  //       level: 2,
  //       subItems: [
  //         {
  //           icon: null,
  //           label: "اضافة طلبية جديدة",
  //           path: "/orders/employees/add-new-order",
  //           level: 3,
  //           permission: CREATE_ORDER,
  //         },
  //         {
  //           icon: null,
  //           label: "قائمة الطلبات",
  //           path: "/orders/employees",
  //           level: 3,
  //           permission: READ_ORDERS,
  //         },
  //       ],
  //     },
  //   ],
  // },
  // Disabled: Human resources management menu section
  // {
  //   icon: hr,
  //   label: "إدارة الموارد البشرية",
  //   path: "/hr",
  //   level: 1,
  //   subItems: [
  //     {
  //       icon: null,
  //       label: " ادارة المشرفين ",
  //       path: "/hr/admins",
  //       level: 2,
  //       permission: READ_ADMINS,
  //       subItems: [
  //         {
  //           icon: null,
  //           label: "عرض المشرفين",
  //           path: "/hr/admins/list",
  //           level: 3,
  //           permission: READ_ADMINS,
  //         },
  //         {
  //           icon: null,
  //           label: "عرض المشرفين المحذوفين",
  //           path: "/hr/admins/recycled-bin",
  //           level: 3,
  //           permission: READ_DELETEDADMINS,
  //         },
  //       ],
  //     },
  //     {
  //       icon: null,
  //       label: "ادارة مدراء الفروع",
  //       level: 2,
  //       path: "/hr/branch-managers",
  //       permission: READ_BRANCHMANAGERS,
  //       subItems: [
  //         {
  //           icon: null,
  //           label: "عرض مدراء الافرع ",
  //           path: "/hr/branch-managers/all-branches-managers",
  //           level: 3,
  //           permission: READ_BRANCHMANAGERS,
  //         },
  //         {
  //           icon: null,
  //           label: "عرض مدراء الافرع المحذوفين",
  //           path: "/hr/branch-managers/recycled-bin-all-branches-managers",
  //           level: 3,
  //           permission: READ_DELETEDBRANCHMANAGERS,
  //         },
  //         {
  //           icon: null,
  //           label: "عرض مدراء الفرع ",
  //           path: "/hr/branch-managers/branches",
  //           level: 3,
  //           permission: READ_BRANCHES,
  //         },
  //         {
  //           icon: null,
  //           label: "عرض مدراء الفرع المحذوفين",
  //           path: "/hr/branch-managers/recycled-bin-branches",
  //           level: 3,
  //           permission: READ_DELETEDBRANCHES,
  //         },
  //       ],
  //     },
  //   ],
  // },

  // Disabled: Inventory management menu section
  // {
  //   icon: inventory,
  //   label: "إدارة المخزون",
  //   path: "/inventory",
  //   level: 1,
  //   permission: READ_INVENTORIES,
  //   subItems: [
  //     {
  //       icon: null,
  //       label: "مدراء الفروع",
  //       path: "/inventory/branches-managers/",
  //       level: 2,
  //       permission: READ_INVENTORIES,
  //       subItems: [
  //         {
  //           icon: null,
  //           label: "المخزون",
  //           path: "/inventory/branches-managers/",
  //           level: 2,
  //           permission: READ_INVENTORIES,
  //         },
  //         {
  //           icon: null,
  //           label: "عمليات نقل المخزون",
  //           path: "/inventory/branches-managers/transfer-operations",
  //           level: 2,
  //           permission: READ_INVENTORYTRANSFERS,
  //         },
  //       ],
  //     },
  //     {
  //       icon: null,
  //       label: "الفروع",
  //       path: "/inventory/branches",
  //       level: 2,
  //       subItems: [
  //         {
  //           icon: null,
  //           label: "المخزون",
  //           path: "/inventory/branches/",
  //           level: 3,
  //           permission: READ_INVENTORIES,
  //         },
  //         {
  //           icon: null,
  //           label: "عمليات نقل المخزون",
  //           path: "/inventory/branches/transfer-operations",
  //           permission: READ_INVENTORYTRANSFERS,
  //           level: 3,
  //         },
  //       ],
  //     },
  //     {
  //       icon: null,
  //       label: "الموظفين",
  //       path: "/inventory/employees",
  //       level: 2,
  //       subItems: [
  //         {
  //           icon: null,
  //           label: "المخزون",
  //           path: "/inventory/employees/",
  //           level: 3,
  //         },
  //         {
  //           icon: null,
  //           label: "عمليات نقل المخزون",
  //           path: "/inventory/employees/transfer-operations",
  //           level: 3,
  //         },
  //       ],
  //     },
  //   ],
  // },
  // Product management
  {
    icon: null,
    label: "إدارة المنتجات",
    path: "/clothes",
    level: 1,
    iconComponent: createIcon(Package),
    subItems: [
      {
        icon: null,
        label: "قائمة المنتجات",
        path: "/clothes/list",
        level: 2,
        iconComponent: createIcon(List),
      },
      {
        icon: null,
        label: "ادارة نقل المنتجات",
        path: "/clothes/transfer-clothes",
        level: 2,
        iconComponent: createIcon(ArrowRightLeft),
        subItems: [
          {
            icon: null,
            label: " نقل المنتجات",
            path: "/clothes/transfer-clothes/actions",
            level: 2,
            iconComponent: createIcon(ArrowRightLeft),
          },
          {
            icon: null,
            label: "قائمة طلبات نقل المنتجات",
            path: "/clothes/transfer-clothes/requests",
            level: 3,
            iconComponent: createIcon(List),
          },
        ],
      },
      {
        icon: null,
        label: "ادارة الموديلات",
        path: "/clothes/models",
        level: 2,
        iconComponent: createIcon(Layers),
      },
    ],
  },
  // Suppliers management
  {
    icon: null,
    label: "الموردين",
    path: "/suppliers",
    level: 1,
    iconComponent: createIcon(ShoppingCart),
    subItems: [
      {
        icon: null,
        label: "قائمة الموردين",
        path: "/suppliers",
        level: 2,
        iconComponent: createIcon(List),
      },
      {
        icon: null,
        label: "إضافة مورد جديد",
        path: "/suppliers/add",
        level: 2,
        iconComponent: createIcon(PlusCircle),
      },
      {
        icon: null,
        label: "طلبيات الموردين",
        path: "/suppliers/orders",
        level: 2,
        iconComponent: createIcon(FileText),
      },
    ],
  },
  // Disabled: Permissions and roles management menu section
  // {
  //   icon: permissions,
  //   label: "إدارة الصلاحيات و الاذونات",
  //   path: "/permissions-roles",
  //   level: 1,
  //   subItems: [
  //     {
  //       icon: null,
  //       label: "المشرف",
  //       path: "/permissions-roles/admins",
  //       level: 2,
  //       subItems: [
  //         {
  //           icon: null,
  //           label: "الاذونات",
  //           path: "/permissions-roles/admins/permissions",
  //           level: 2,
  //           permission: READ_PERMISSIONS,
  //         },
  //         {
  //           icon: null,
  //           label: "الصلاحيات",
  //           path: "/permissions-roles/admins/roles",
  //           level: 2,
  //           subItems: [
  //             {
  //               icon: null,
  //               label: "اضافة صلاحيات جديدة",
  //               path: "/permissions-roles/admins/roles/create",
  //               level: 3,
  //               permission: CREATE_ROLE,
  //             },
  //             {
  //               icon: null,
  //               label: "قائمة الصلاحيات",
  //               path: "/permissions-roles/admins/roles/list-roles",
  //               level: 3,
  //               permission: READ_ROLES,
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //     {
  //       icon: null,
  //       label: "مدير الفروع",
  //       path: "/permissions-roles/branches-managers/roles",
  //       level: 2,
  //       permission: READ_ROLES,
  //     },
  //     {
  //       icon: null,
  //       label: "الفرع",
  //       path: "/permissions-roles/branches/roles",
  //       level: 2,
  //       permission: READ_ROLES,
  //     },
  //   ],
  // },
  {
    icon: null,
    label: "ادارة المحتوى",
    path: "/content",
    level: 1,
    iconComponent: createIcon(Settings),
    subItems: [
      {
        icon: null,
        label: "الدول",
        path: "/content/countries",
        level: 2,
        permission: READ_COUNTRIES,
        iconComponent: createIcon(Globe),
      },
      {
        icon: null,
        label: "المدن",
        path: "/content/cities",
        level: 2,
        permission: READ_CITIES,
        iconComponent: createIcon(MapPin),
      },
      {
        icon: null,
        label: "الفئات",
        path: "/content/categories",
        level: 2,
        permission: READ_CATEGORIES,
        iconComponent: createIcon(Tags),
      },
      {
        icon: null,
        label: "الفئات الفرعية",
        path: "/content/sub-categories",
        level: 2,
        permission: READ_SUBCATEGORIES,
        iconComponent: createIcon(FolderTree),
      },
      {
        icon: null,
        label: "الصلاحيات",
        path: "/content/roles",
        level: 2,
        iconComponent: createIcon(Shield),
      },
      {
        icon: null,
        label: "الاقسام",
        path: "/content/departments",
        level: 2,
        iconComponent: createIcon(Building),
      },
      {
        icon: null,
        label: "المسميات الوظيفية",
        path: "/content/jobs-titles",
        level: 2,
        iconComponent: createIcon(Briefcase),
      },
    ],
  },
];

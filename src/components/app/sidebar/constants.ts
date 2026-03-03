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
  /** @deprecated use permissions */
  permission?: string;
  /** عرض العنصر إذا كان المستخدم يملك أحد هذه الصلاحيات (صيغة API: module.action) */
  permissions?: string[];
  iconComponent?: React.ReactNode | null;
};

export const sidebarLabels: SidebarLabel[] = [
  // 1. Dashboard
  {
    icon: null,
    label: "لوحة التحكم",
    path: "/dashboard",
    level: 1,
    permissions: ["dashboard.view", "dashboard.activity.view", "dashboard.business.view", "dashboard.hr.view"],
    iconComponent: createIcon(LayoutDashboard),
  },
  // 2. Notifications
  {
    icon: null,
    label: "الإشعارات",
    path: "/notifications",
    level: 1,
    permissions: ["notifications.view", "notifications.manage"],
    iconComponent: createIcon(Bell),
  },
  // 3. Cashbox and accounting
  {
    icon: null,
    label: "إدارة الحسابات",
    path: "/cashboxes",
    level: 1,
    permissions: ["cashbox.view", "payments.view", "expenses.view"],
    iconComponent: createIcon(Wallet),
    subItems: [
      {
        icon: null,
        label: "إدارة المدفوعات",
        path: "/payments",
        level: 2,
        permissions: ["payments.view", "payments.create", "payments.pay", "payments.cancel", "payments.export"],
        iconComponent: createIcon(Receipt),
      },
      {
        icon: null,
        label: "إدارة المصروفات",
        path: "/expenses",
        level: 2,
        permissions: ["expenses.view", "expenses.create", "expenses.update", "expenses.delete", "expenses.approve", "expenses.pay", "expenses.export"],
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
    permissions: ["orders.view", "orders.create", "orders.update", "orders.delete", "orders.export"],
    iconComponent: createIcon(FileText),
    subItems: [
      {
        icon: null,
        label: "قائمة الفواتير ",
        path: "/orders/list",
        level: 2,
        permissions: ["orders.view", "orders.export"],
        iconComponent: createIcon(List),
      },
      {
        icon: null,
        label: "اضافة فاتورة جديدة",
        path: "/orders/choose-client",
        level: 2,
        permissions: ["orders.create"],
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
    permissions: ["orders.deliver", "orders.return", "orders.finish", "orders.cancel"],
    iconComponent: createIcon(Truck),
    subItems: [
      {
        icon: null,
        label: "إدارة التسليمات",
        path: "/deliveries",
        level: 2,
        permissions: ["orders.deliver"],
        iconComponent: createIcon(Truck),
      },
      {
        icon: null,
        label: "إدارة الارجاعات",
        path: "/returns",
        level: 2,
        permissions: ["orders.return"],
        iconComponent: createIcon(RotateCcw),
      },
      {
        icon: null,
        label: "الارجاعات المتأخرة",
        path: "/overdue-returns",
        level: 2,
        permissions: ["orders.return", "orders.view"],
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
    permissions: ["cashbox.view", "cashbox.manage", "cashbox.recalculate", "transactions.view", "transactions.reverse"],
    iconComponent: createIcon(Banknote),
  },
  // 7. Clients
  {
    icon: null,
    label: "العملاء",
    path: "/clients",
    level: 1,
    permissions: ["clients.view", "clients.create", "clients.update", "clients.delete", "clients.export", "clients.measurements.view", "clients.measurements.update"],
    iconComponent: createIcon(Users),
  },
  // 8. Employees
  {
    icon: null,
    label: "الموظفين",
    path: "/employees",
    level: 1,
    permissions: ["hr.employees.view", "hr.employees.create", "hr.employees.update", "hr.employees.delete", "hr.employees.manage-branches", "hr.employees.manage-entities", "hr.employees.terminate"],
    iconComponent: createIcon(UserCircle),
    subItems: [
      {
        icon: null,
        label: "اضافة موظف جديد",
        path: "/employees/add",
        level: 2,
        permissions: ["hr.employees.create"],
        iconComponent: createIcon(PlusCircle),
      },
      {
        icon: null,
        label: "قائمة الموظفين",
        path: "/employees/list",
        level: 2,
        permissions: ["hr.employees.view"],
        iconComponent: createIcon(List),
      },
      {
        icon: null,
        label: "ضمانات الموظفين",
        path: "/employees/custodies",
        level: 2,
        permissions: ["hr.custody.view", "hr.custody.assign", "hr.custody.return"],
        iconComponent: createIcon(ShieldEllipsis),
      },
      {
        icon: null,
        label: "الوثائق الشخصية للموظفين",
        path: "/employees/employee-documents",
        level: 2,
        permissions: ["hr.documents.view", "hr.documents.upload", "hr.documents.verify", "hr.documents.delete"],
        iconComponent: createIcon(FileText),
      },
      {
        icon: null,
        label: "الخصمات المرتبطة بالموظفين",
        path: "/employees/employee-deductions",
        level: 2,
        permissions: ["hr.deductions.view", "hr.deductions.create", "hr.deductions.approve"],
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
    permissions: ["roles.view", "roles.create", "roles.update", "roles.delete", "roles.export", "roles.assign-permissions", "users.view", "users.create", "users.update", "users.delete", "users.export"],
    iconComponent: createIcon(Shield),
    subItems: [
      {
        icon: null,
        label: "المشرف",
        path: "/permissions-roles/admins",
        level: 2,
        permissions: ["users.view", "roles.view", "roles.create", "roles.update", "roles.delete"],
        iconComponent: createIcon(UserCircle),
        subItems: [
          {
            icon: null,
            label: "الأذونات",
            path: "/permissions-roles/admins/permissions",
            level: 3,
            permissions: ["roles.view", "roles.assign-permissions"],
            iconComponent: createIcon(ShieldEllipsis),
          },
          {
            icon: null,
            label: "قائمة الصلاحيات",
            path: "/permissions-roles/admins/roles/list-roles",
            level: 3,
            permissions: ["roles.view"],
            iconComponent: createIcon(List),
          },
          {
            icon: null,
            label: "إضافة صلاحية جديدة",
            path: "/permissions-roles/admins/roles/create",
            level: 3,
            permissions: ["roles.create"],
            iconComponent: createIcon(PlusCircle),
          },
        ],
      },
      {
        icon: null,
        label: "مدير الفروع",
        path: "/permissions-roles/branches-managers",
        level: 2,
        permissions: ["roles.view"],
        iconComponent: createIcon(Building2),
        subItems: [
          {
            icon: null,
            label: "صلاحيات مديري الفروع",
            path: "/permissions-roles/branches-managers/roles",
            level: 3,
            permissions: ["roles.view"],
            iconComponent: createIcon(Shield),
          },
        ],
      },
      {
        icon: null,
        label: "الفروع",
        path: "/permissions-roles/branches",
        level: 2,
        permissions: ["roles.view", "branches.view"],
        iconComponent: createIcon(Building),
        subItems: [
          {
            icon: null,
            label: "صلاحيات الفروع",
            path: "/permissions-roles/branches/roles",
            level: 3,
            permissions: ["roles.view"],
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
    permissions: ["branches.view", "branches.create", "branches.update", "branches.delete", "branches.export"],
    iconComponent: createIcon(Building2),
  },
  // 11. Workshop management
  {
    icon: null,
    label: "إدارة الورشة",
    path: "/workshop",
    level: 1,
    permissions: ["workshops.view", "workshops.create", "workshops.update", "workshops.delete", "workshops.export", "workshops.manage-clothes", "workshops.approve-transfers", "workshops.update-status", "workshops.return-cloth", "workshops.view-logs"],
    iconComponent: createIcon(Wrench),
  },
  // 12. Factory management (page /factory) below workshop management
  {
    icon: null,
    label: "إدارة المصنع",
    path: "/factory",
    level: 1,
    permissions: ["factories.view", "factories.create", "factories.update", "factories.delete", "factories.export", "factories.manage", "factories.orders.view", "factories.orders.accept", "factories.orders.reject", "factories.orders.update-status", "factories.orders.add-notes", "factories.orders.set-delivery-date", "factories.orders.deliver", "factories.reports.view", "factories.dashboard.view"],
    iconComponent: createIcon(Factory),
  },
  // 13. Reports
  {
    icon: null,
    label: "التقارير",
    path: "/clothes",
    level: 1,
    permissions: ["reports.view", "reports.financial", "reports.inventory", "reports.performance"],
    iconComponent: createIcon(FileBarChart),
  },
  // Disabled: Orders and sales management menu section
  // {
  //   icon: orders,
  //   path: "/orders",
  //   level: 1,
  //   subItems: [
  //     {
  //       icon: null,
  //       path: "/orders/branches",
  //       level: 2,
  //       subItems: [
  //         {
  //           icon: null,
  //           path: "/orders/branches/add-new-order",
  //           level: 3,
  //           permission: CREATE_ORDER,
  //         },
  //         {
  //           icon: null,
  //           path: "/orders/branches",
  //           level: 3,
  //           permission: READ_ORDERS,
  //         },
  //       ],
  //     },
  //     {
  //       icon: null,
  //       path: "/orders/employees",
  //       level: 2,
  //       subItems: [
  //         {
  //           icon: null,
  //           path: "/orders/employees/add-new-order",
  //           level: 3,
  //           permission: CREATE_ORDER,
  //         },
  //         {
  //           icon: null,
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
  //   path: "/hr",
  //   level: 1,
  //   subItems: [
  //     {
  //       icon: null,
  //       path: "/hr/admins",
  //       level: 2,
  //       permission: READ_ADMINS,
  //       subItems: [
  //         {
  //           icon: null,
  //           path: "/hr/admins/list",
  //           level: 3,
  //           permission: READ_ADMINS,
  //         },
  //         {
  //           icon: null,
  //           path: "/hr/admins/recycled-bin",
  //           level: 3,
  //           permission: READ_DELETEDADMINS,
  //         },
  //       ],
  //     },
  //     {
  //       icon: null,
  //       level: 2,
  //       path: "/hr/branch-managers",
  //       permission: READ_BRANCHMANAGERS,
  //       subItems: [
  //         {
  //           icon: null,
  //           path: "/hr/branch-managers/all-branches-managers",
  //           level: 3,
  //           permission: READ_BRANCHMANAGERS,
  //         },
  //         {
  //           icon: null,
  //           path: "/hr/branch-managers/recycled-bin-all-branches-managers",
  //           level: 3,
  //           permission: READ_DELETEDBRANCHMANAGERS,
  //         },
  //         {
  //           icon: null,
  //           path: "/hr/branch-managers/branches",
  //           level: 3,
  //           permission: READ_BRANCHES,
  //         },
  //         {
  //           icon: null,
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
  //   path: "/inventory",
  //   level: 1,
  //   permission: READ_INVENTORIES,
  //   subItems: [
  //     {
  //       icon: null,
  //       path: "/inventory/branches-managers/",
  //       level: 2,
  //       permission: READ_INVENTORIES,
  //       subItems: [
  //         {
  //           icon: null,
  //           path: "/inventory/branches-managers/",
  //           level: 2,
  //           permission: READ_INVENTORIES,
  //         },
  //         {
  //           icon: null,
  //           path: "/inventory/branches-managers/transfer-operations",
  //           level: 2,
  //           permission: READ_INVENTORYTRANSFERS,
  //         },
  //       ],
  //     },
  //     {
  //       icon: null,
  //       path: "/inventory/branches",
  //       level: 2,
  //       subItems: [
  //         {
  //           icon: null,
  //           path: "/inventory/branches/",
  //           level: 3,
  //           permission: READ_INVENTORIES,
  //         },
  //         {
  //           icon: null,
  //           path: "/inventory/branches/transfer-operations",
  //           permission: READ_INVENTORYTRANSFERS,
  //           level: 3,
  //         },
  //       ],
  //     },
  //     {
  //       icon: null,
  //       path: "/inventory/employees",
  //       level: 2,
  //       subItems: [
  //         {
  //           icon: null,
  //           path: "/inventory/employees/",
  //           level: 3,
  //         },
  //         {
  //           icon: null,
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
    permissions: ["clothes.view", "clothes.create", "clothes.update", "clothes.delete", "clothes.export", "inventories.view", "transfers.view", "transfers.create", "transfers.update", "transfers.delete", "transfers.approve", "transfers.reject", "transfers.export"],
    iconComponent: createIcon(Package),
    subItems: [
      {
        icon: null,
        label: "قائمة المنتجات",
        path: "/clothes/list",
        level: 2,
        permissions: ["clothes.view", "clothes.export"],
        iconComponent: createIcon(List),
      },
      {
        icon: null,
        label: "ادارة نقل المنتجات",
        path: "/clothes/transfer-clothes",
        level: 2,
        permissions: ["transfers.view", "transfers.create", "transfers.update", "transfers.approve", "transfers.reject"],
        iconComponent: createIcon(ArrowRightLeft),
        subItems: [
          {
            icon: null,
            label: " نقل المنتجات",
            path: "/clothes/transfer-clothes/actions",
            level: 2,
            permissions: ["transfers.create", "transfers.view"],
            iconComponent: createIcon(ArrowRightLeft),
          },
          {
            icon: null,
            label: "قائمة طلبات نقل المنتجات",
            path: "/clothes/transfer-clothes/requests",
            level: 3,
            permissions: ["transfers.view"],
            iconComponent: createIcon(List),
          },
        ],
      },
    ],
  },
  // Suppliers management
  {
    icon: null,
    label: "الموردين",
    path: "/suppliers",
    level: 1,
    permissions: ["suppliers.view", "suppliers.create", "suppliers.update", "suppliers.delete", "suppliers.export", "supplier-orders.view", "supplier-orders.create", "supplier-orders.update", "supplier-orders.delete", "supplier-orders.export"],
    iconComponent: createIcon(ShoppingCart),
    subItems: [
      {
        icon: null,
        label: "قائمة الموردين",
        path: "/suppliers",
        level: 2,
        permissions: ["suppliers.view"],
        iconComponent: createIcon(List),
      },
      {
        icon: null,
        label: "إضافة مورد جديد",
        path: "/suppliers/add",
        level: 2,
        permissions: ["suppliers.create"],
        iconComponent: createIcon(PlusCircle),
      },
      {
        icon: null,
        label: "طلبيات الموردين",
        path: "/suppliers/orders",
        level: 2,
        permissions: ["supplier-orders.view", "supplier-orders.create", "supplier-orders.update", "supplier-orders.delete"],
        iconComponent: createIcon(FileText),
      },
    ],
  },
  // Disabled: Permissions and roles management menu section
  // {
  //   icon: permissions,
  //   path: "/permissions-roles",
  //   level: 1,
  //   subItems: [
  //     {
  //       icon: null,
  //       path: "/permissions-roles/admins",
  //       level: 2,
  //       subItems: [
  //         {
  //           icon: null,
  //           path: "/permissions-roles/admins/permissions",
  //           level: 2,
  //           permission: READ_PERMISSIONS,
  //         },
  //         {
  //           icon: null,
  //           path: "/permissions-roles/admins/roles",
  //           level: 2,
  //           subItems: [
  //             {
  //               icon: null,
  //               path: "/permissions-roles/admins/roles/create",
  //               level: 3,
  //               permission: CREATE_ROLE,
  //             },
  //             {
  //               icon: null,
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
  //       path: "/permissions-roles/branches-managers/roles",
  //       level: 2,
  //       permission: READ_ROLES,
  //     },
  //     {
  //       icon: null,
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
    permissions: [
      "countries.view",
      "cities.view",
      "categories.view",
      "subcategories.view",
      "currencies.view",
      "addresses.view",
      "phones.view",
    ],
    iconComponent: createIcon(Settings),
    subItems: [
      {
        icon: null,
        label: "الدول",
        path: "/content/countries",
        level: 2,
        permissions: ["countries.view", "countries.create", "countries.update", "countries.delete", "countries.export"],
        iconComponent: createIcon(Globe),
      },
      {
        icon: null,
        label: "المدن",
        path: "/content/cities",
        level: 2,
        permissions: ["cities.view", "cities.create", "cities.update", "cities.delete", "cities.export"],
        iconComponent: createIcon(MapPin),
      },
      {
        icon: null,
        label: "أقسام المنتجات",
        path: "/content/categories",
        level: 2,
        permissions: ["categories.view", "categories.create", "categories.update", "categories.delete", "categories.export"],
        iconComponent: createIcon(Tags),
      },
      {
        icon: null,
        label: "أقسام المنتجات الفرعية",
        path: "/content/sub-categories",
        level: 2,
        permissions: ["subcategories.view", "subcategories.create", "subcategories.update", "subcategories.delete", "subcategories.export"],
        iconComponent: createIcon(FolderTree),
      },
      {
        icon: null,
        label: "العملات",
        path: "/content/currencies",
        level: 2,
        permissions: [
          "currencies.view",
          "currencies.create",
          "currencies.update",
          "currencies.delete",
          "currencies.export",
        ],
        iconComponent: createIcon(Globe),
      },
    ],
  },
];

import branch from "@/assets/entrepreneur.svg";
import factory from "@/assets/factory.png";
import home from "@/assets/Home.svg";
import clothes from "@/assets/reports.svg";
import clients from "@/assets/relationship 1.svg";
import settings from "@/assets/settings.svg";
import workshop from "@/assets/workshop.svg";
import ordersAndSales from "@/assets/ordersAndSales.svg";
import employees from "@/assets/hr.svg";
import cashbox from "@/assets/reports.svg";

import {
  FACTORY_MANAGEMENT,
  READ_CATEGORIES,
  READ_CITIES,
  READ_COUNTRIES,
  READ_SUBCATEGORIES,
} from "@/lib/permissions.helper";
import React from "react";
import { FileText, Minus, ShieldEllipsis, Wallet2, Receipt, FileBarChart } from "lucide-react";

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
  // 1. لوحة التحكم
  {
    icon: home,
    label: "لوحة التحكم",
    path: "/",
    level: 1,
  },
  // 2. الخزنة و المحاسبة
  {
    icon: cashbox,
    label: "الخزنة و المحاسبة",
    path: "/cashboxes",
    level: 1,
    subItems: [
     
      {
        icon: null,
        label: "إدارة المدفوعات",
        path: "/payments",
        level: 2,
        iconComponent: React.createElement(Receipt, { size: 20 }),
      },
      {
        icon: null,
        label: "إدارة المصروفات",
        path: "/expenses",
        level: 2,
        iconComponent: React.createElement(Wallet2, { size: 20 }),
      },
    ],
  },
  // 3. الفواتير
  {
    icon: ordersAndSales,
    label: "الفواتير",
    path: "/orders",
    level: 1,
    subItems: [
      {
        icon: null,
        label: "قائمة الفواتير ",
        path: "/orders/list",
        level: 2,
      },
      {
        icon: null,
        label: "اضافة فاتورة جديدة",
        path: "/orders/choose-client",
        level: 2,
      },
    ],
  },
  // 4. التسليم والارجاع
  {
    icon: ordersAndSales,
    label: "التسليم والارجاع",
    path: "/deliveries",
    level: 1,
    subItems: [
      {
        icon: null,
        label: "إدارة التسليمات",
        path: "/deliveries",
        level: 2,
      },
      {
        icon: null,
        label: "إدارة الارجاعات",
        path: "/returns",
        level: 2,
      },
      {
        icon: null,
        label: "الارجاعات المتأخرة",
        path: "/overdue-returns",
        level: 2,
      },
    ],
  },
  // 5. الخزنة
  {
    icon: cashbox,
    label: "الخزنة",
    path: "/cashboxes",
    level: 1,
  },
  // 6. العملاء
  {
    icon: clients,
    label: "العملاء",
    path: "/clients",
    level: 1,
  },
  // 7. الموظفين
  {
    icon: employees,
    label: "الموظفين",
    path: "/employees",
    level: 1,
    subItems: [
      {
        icon: null,
        label: "اضافة موظف جديد",
        path: "/employees/add",
        level: 2,
      },
      {
        icon: null,
        label: "قائمة الموظفين",
        path: "/employees/list",
        level: 2,
      },
      {
        icon: null,
        label: "ضمانات الموظفين",
        path: "/employees/custodies",
        level: 2,
        iconComponent: React.createElement(ShieldEllipsis, { size: 20 }),
      },
      {
        icon: null,
        label: "الوثائق الشخصية للموظفين",
        path: "/employees/employee-documents",
        level: 2,
        iconComponent: React.createElement(FileText, { size: 20 }),
      },
      {
        icon: null,
        label: "الخصمات المرتبطة بالموظفين",
        path: "/employees/employee-deductions",
        level: 2,
        iconComponent: React.createElement(Minus, { size: 20 }),
      },
    ],
  },
  // 8. الصلاحيات
  {
    icon: settings,
    label: "الصلاحيات",
    path: "/content/roles",
    level: 1,
    subItems: [
      {
        icon: null,
        label: "الصلاحيات",
        path: "/content/roles",
        level: 2,
      },
    ],
  },
  // 9. الفروع
  {
    icon: branch,
    label: "الفروع",
    path: "/branch",
    level: 1,
  },
  // 10. إدارة الموردين
  {
    icon: factory,
    label: "إدارة الموردين",
    path: "/suppliers",
    level: 1,
    permission: FACTORY_MANAGEMENT,
    subItems: [
      {
        icon: null,
        label: "عرض الموردين",
        path: "/suppliers",
        level: 2,
      },
      {
        icon: null,
        label: "إضافة موردين",
        path: "/suppliers/add",
        level: 2,
      },
      {
        icon: null,
        label: "إضافة طلبية",
        path: "/suppliers/orders/add",
        level: 2,
      },
    ],
  },
  // 11. التقارير
  {
    icon: clothes,
    label: "التقارير",
    path: "/clothes",
    level: 1,
    iconComponent: React.createElement(FileBarChart, { size: 20 }),
  },
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
  // باقي الصفحات (غير المذكورة في القائمة)
  {
    icon: clothes,
    label: "إدارة المنتجات",
    path: "/clothes",
    level: 1,
    subItems: [
      {
        icon: null,
        label: "قائمة المنتجات",
        path: "/clothes/list",
        level: 2,
      },
      {
        icon: null,
        label: "ادارة نقل المنتجات",
        path: "/clothes/transfer-clothes",
        level: 2,
        subItems: [
          {
            icon: null,
            label: " نقل المنتجات",
            path: "/clothes/transfer-clothes/actions",
            level: 2,
          },
          {
            icon: null,
            label: "قائمة طلبات نقل المنتجات",
            path: "/clothes/transfer-clothes/requests",
            level: 3,
          },
        ],
      },
      {
        icon: null,
        label: "ادارة الموديلات",
        path: "/clothes/models",
        level: 2,
      },
    ],
  },
  {
    icon: workshop,
    label: "إدارة الورشة",
    path: "/workshop",
    level: 1,
  },
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
    icon: settings,
    label: "ادارة المحتوى",
    path: "/content",
    level: 1,
    subItems: [
      {
        icon: null,
        label: "الدول",
        path: "/content/countries",
        level: 2,
        permission: READ_COUNTRIES,
      },
      {
        icon: null,
        label: "المدن",
        path: "/content/cities",
        level: 2,
        permission: READ_CITIES,
      },
      {
        icon: null,
        label: "الفئات",
        path: "/content/categories",
        level: 2,
        permission: READ_CATEGORIES,
      },
      {
        icon: null,
        label: "الفئات الفرعية",
        path: "/content/sub-categories",
        level: 2,
        permission: READ_SUBCATEGORIES,
      },
      {
        icon: null,
        label: "الصلاحيات",
        path: "/content/roles",
        level: 2,
      },
      {
        icon: null,
        label: "الاقسام",
        path: "/content/departments",
        level: 2,
      },
      {
        icon: null,
        label: "المسميات الوظيفية",
        path: "/content/jobs-titles",
        level: 2,
      },
    ],
  },
];

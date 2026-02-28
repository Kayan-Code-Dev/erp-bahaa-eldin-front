/**
 * ترجمة أسماء الأدوار (roles) من الإنجليزية إلى العربية.
 * تُستخدم في صفحة إضافة/تعديل موظف وعرض تفاصيل الموظف.
 */
export const ROLE_NAME_TO_ARABIC: Record<string, string> = {
  general_manager: "المدير العام",
  dashboard_manager: "مدير لوحة التحكم",
  notifications_manager: "مدير الإشعارات",
  orders_manager: "مدير الطلبات",
  orders_basic_view: "الطلبات (عرض وإنشاء)",
  orders_delivery_return_finish_cancel: "الطلبات (تسليم / إرجاع / إنهاء / إلغاء)",
  branches_manager: "مدير الفروع",
  branches_basic_view_create: "الفروع (عرض وإنشاء)",
  hr_employees_manager: "مدير موظفي الموارد البشرية",
  clients_manager: "مدير العملاء",
  workshops_manager_basic: "مدير الورش (أساسي)",
  inventories_manager: "مدير المخازن",
  clothes_manager: "مدير الملابس",
  transfers_manager: "مدير النقل",
  categories_manager: "مدير الأقسام",
  subcategories_manager: "مدير الأقسام الفرعية",
  cities_manager: "مدير المدن",
  countries_manager: "مدير الدول",
  suppliers_manager: "مدير الموردين",
  supplier_orders_manager: "مدير أوامر الموردين",
  cashbox_manager: "مدير الصندوق",
  transactions_manager: "مدير المعاملات",
  payments_manager: "مدير المدفوعات",
  expenses_manager: "مدير المصروفات",
  hr_deductions_manager: "مدير خصومات الموظفين",
  hr_deductions_viewer: "مشاهد خصومات الموظفين",
  factories_manager_basic: "مدير المصانع (أساسي)",
};

/**
 * إرجاع الاسم العربي للدور إن وُجد، وإلا الاسم الأصلي.
 */
export function getRoleLabel(name: string | undefined | null): string {
  if (name == null || name === "") return "";
  return ROLE_NAME_TO_ARABIC[name] ?? name;
}

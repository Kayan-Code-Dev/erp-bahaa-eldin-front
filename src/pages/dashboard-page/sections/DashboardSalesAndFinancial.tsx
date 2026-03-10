import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "../components/SectionHeader";
import { SalesByStatusChart, buildSalesByStatusData } from "../charts/SalesByStatusChart";
import { FinancialSummaryCard } from "../charts/FinancialSummaryCard";
import type { TDashboardSales, TDashboardFinancial } from "@/api/v2/dashboard/dashboard.types";

type DashboardSalesAndFinancialProps = {
  sales: TDashboardSales | undefined;
  financial: TDashboardFinancial | undefined;
};

export function DashboardSalesAndFinancial({
  sales,
  financial,
}: DashboardSalesAndFinancialProps) {
  const salesChartData = buildSalesByStatusData(sales?.by_status);

  return (
    <>
      <SectionHeader
        title="المبيعات والمالية"
        description="توزيع الطلبات والإيرادات والمصروفات"
        className="mt-10"
      />
      {/* items-start حتى لا يمتد العمود الأيمن ليملأ ارتفاع الصف عند قلة محتوى البطاقة المالية */}
      <section className="mt-4 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">المبيعات حسب الحالة</CardTitle>
            <CardDescription className="text-right">
              عدد الطلبات والإيرادات (بالآلاف) حسب حالة الطلب
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesByStatusChart data={salesChartData} />
          </CardContent>
        </Card>
        <FinancialSummaryCard financial={financial} />
      </section>
    </>
  );
}

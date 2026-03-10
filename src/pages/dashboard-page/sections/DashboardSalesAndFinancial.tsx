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
      <section className="mt-4 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:auto-rows-fr">
        <Card className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm lg:col-span-8">
          <CardHeader className="shrink-0 pb-2">
            <CardTitle className="text-lg">المبيعات حسب الحالة</CardTitle>
            <CardDescription className="text-right">
              أعمدة + خط: عدد الطلبات وإيرادات الآلاف حسب الحالة
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col pb-4">
            <div className="flex min-h-0 flex-1 flex-col">
              <SalesByStatusChart
                data={salesChartData}
                fillHeight
                fillMinHeight={500}
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex min-h-[560px] lg:col-span-4">
          <FinancialSummaryCard financial={financial} />
        </div>
      </section>
    </>
  );
}

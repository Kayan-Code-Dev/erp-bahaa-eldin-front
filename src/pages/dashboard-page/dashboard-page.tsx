import {
  Search,
  ChevronUp,
  ChevronDown,
  LineChart,
  PieChart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LineChartComponent } from "@/components/app/line-chart";
import { DonutChartComponent } from "@/components/app/donut-chart";

function DashboardPage() {
  return (
    <div className="flex-1">
      {/* Dashboard Header */}
      <div className="bg-[#907457] text-white p-4 text-right">
        <h1 className="text-xl font-bold">لوحة التحكم</h1>
      </div>

      {/* Dashboard Content */}
      <div className="p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={
              <div className="bg-[#fec53d]/[0.2] p-2 rounded-full">
                <PieChart className="h-5 w-5 text-[#fec53d]" />
              </div>
            }
            title="عدد الحجوزات المطلوبة"
            value="5"
            change={-2.5}
            changeText="انخفاض بنسبة 2.5% عن الشهر الماضي"
          />
          <StatCard
            icon={
              <div className="bg-[#fec53d]/[0.2] p-2 rounded-full">
                <PieChart className="h-5 w-5 text-[#fec53d]" />
              </div>
            }
            title="عدد العملاء الجدد"
            value="50"
            change={2.5}
            changeText="زيادة بنسبة 2.5% عن الأمس"
          />
          <StatCard
            icon={
              <div className="bg-[#16c098]/[0.2] p-2 rounded-full">
                <LineChart className="h-5 w-5 text-[#16c098]" />
              </div>
            }
            title="إجمالي الإيرادات"
            value="$89,000"
            change={-1.5}
            changeText="انخفاض بنسبة 1.5% مقارنة بالشهر الماضي"
          />
          <StatCard
            icon={
              <div className="bg-[#8280ff]/[0.2] p-2 rounded-full">
                <PieChart className="h-5 w-5 text-[#8280ff]" />
              </div>
            }
            title="عدد الطلبات الحالية"
            value="150"
            change={2.5}
            changeText="زيادة بنسبة 2.5% عن الأمس"
          />
        </div>

        {/* Sales Performance */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-right">
            أداء المبيعات اليومية/الشهرية
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="col-span-1">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Tabs defaultValue="income" className="w-full">
                    <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center">
                      <TabsList className="grid w-full sm:w-[200px] grid-cols-2 mt-2 sm:mt-0">
                        <TabsTrigger value="income">إيرادات</TabsTrigger>
                        <TabsTrigger value="expenses">مصروفات</TabsTrigger>
                      </TabsList>
                      <h3 className="text-sm font-medium">
                        مقارنة الإيرادات والمصروفات
                      </h3>
                    </div>
                    <TabsContent value="income" className="mt-4">
                      <DonutChartComponent />
                    </TabsContent>
                    <TabsContent value="expenses" className="mt-4">
                      <DonutChartComponent />
                    </TabsContent>
                  </Tabs>
                </div>
                <div className="text-right mt-4">
                  <div className="flex justify-end items-center gap-2 mb-2">
                    <span className="text-sm">إيرادات</span>
                    <div className="w-3 h-3 rounded-full bg-[#16c098]"></div>
                  </div>
                  <div className="text-sm font-bold">75%</div>
                  <div className="flex justify-end items-center gap-2 mb-2 mt-4">
                    <span className="text-sm">مصروفات</span>
                    <div className="w-3 h-3 rounded-full bg-[#cf0c0c]"></div>
                  </div>
                  <div className="text-sm font-bold">25%</div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-2">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <select className="text-sm border rounded p-1">
                    <option>يوميا</option>
                    <option>شهريا</option>
                    <option>سنويا</option>
                  </select>
                </div>
                <LineChartComponent />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Current Orders Table */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <div className="relative order-2 sm:order-1 w-full sm:w-auto">
              <Input
                type="text"
                placeholder="بحث..."
                className="w-full sm:w-64 pr-8 h-9 text-right"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a7a7a]" />
            </div>
            <h2 className="text-xl font-bold order-1 sm:order-2">
              الطلبات الحالية
            </h2>
          </div>
          <Card>
            <CardContent className="p-0 overflow-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم الطلب</TableHead>
                      <TableHead className="text-right">اسم العميل</TableHead>
                      <TableHead className="text-right">حالة الطلب</TableHead>
                      <TableHead className="text-right">تاريخ الطلب</TableHead>
                      <TableHead className="text-right">
                        تاريخ التسليم
                      </TableHead>
                      <TableHead className="text-right">
                        إجمالي المبلغ
                      </TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-right">001</TableCell>
                      <TableCell className="text-right">نور علي</TableCell>
                      <TableCell className="text-right">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          قيد التنفيذ
                        </span>
                      </TableCell>
                      <TableCell className="text-right">25-5-2025</TableCell>
                      <TableCell className="text-right">25-6-2025</TableCell>
                      <TableCell className="text-right">محمد علي</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs"
                        >
                          عرض
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  change,
  changeText,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: number;
  changeText: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          {icon}
          <div className="text-right">
            <h3 className="text-sm text-[#5d6679] mb-1">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-1 text-xs">
          {change > 0 ? (
            <>
              <ChevronUp className="h-3 w-3 text-[#16c098]" />
              <span className="text-[#16c098]">{changeText}</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 text-[#cf0c0c]" />
              <span className="text-[#cf0c0c]">{changeText}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DashboardPage;

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCheck } from "lucide-react";
import { SectionHeader } from "../components/SectionHeader";
import { MetricChip } from "../components/MetricChip";
import { AttendanceTrendChart, PayrollTrendChart } from "../charts/TrendCharts";
import { fmtCur, fmtNum, fmtPct } from "../utils/dashboard.utils";
import type { TDashboardHR } from "@/api/v2/dashboard/dashboard.types";

type DashboardHRSectionProps = {
  hr: TDashboardHR | undefined;
};

function mapAttendanceTrend(
  arr: TDashboardHR["trends"]["attendance_trends"] | undefined
): { date: string; معدل: number; حاضر: number; إجمالي: number }[] {
  if (!arr?.length) return [];
  return arr.map((r) => ({
    date: r.date,
    معدل: r.attendance_rate ?? 0,
    حاضر: r.present ?? 0,
    إجمالي: r.total ?? 0,
  }));
}

function mapPayrollTrend(
  arr: TDashboardHR["trends"]["payroll_trends"] | undefined
): { date: string; رواتب: number; كشوف: number }[] {
  if (!arr?.length) return [];
  return arr.map((r) => ({
    date: r.date,
    رواتب: (r.total_payroll ?? 0) / 1000,
    كشوف: r.payroll_count ?? 0,
  }));
}

export function DashboardHRSection({ hr }: DashboardHRSectionProps) {
  const attTrend = mapAttendanceTrend(hr?.trends?.attendance_trends);
  const payTrend = mapPayrollTrend(hr?.trends?.payroll_trends);

  return (
    <>
      <SectionHeader
        title="الموارد البشرية"
        description="الحضور والرواتب ونشاط الموظفين والاتجاهات"
        className="mt-10"
      />
      <Card className="mt-4 overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCheck className="h-5 w-5 text-muted-foreground" />
            الموارد البشرية
          </CardTitle>
          <CardDescription className="text-right">
            الحضور، الرواتب، نشاط الموظفين والاتجاهات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="attendance" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-4 rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="attendance" className="rounded-lg">
                الحضور
              </TabsTrigger>
              <TabsTrigger value="payroll" className="rounded-lg">
                الرواتب
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-lg">
                الأكثر نشاطاً
              </TabsTrigger>
              <TabsTrigger value="trends" className="rounded-lg">
                الاتجاهات
              </TabsTrigger>
            </TabsList>
            <TabsContent value="attendance" className="space-y-4">
              {hr?.attendance && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                  <MetricChip
                    label="إجمالي السجلات"
                    value={fmtNum(hr.attendance.total_records)}
                  />
                  <MetricChip label="أيام الحضور" value={fmtNum(hr.attendance.present_days)} />
                  <MetricChip label="أيام الغياب" value={fmtNum(hr.attendance.absent_days)} />
                  <MetricChip label="تأخر" value={fmtNum(hr.attendance.late_arrivals)} />
                  <MetricChip label="إجازة" value={fmtNum(hr.attendance.leave_days)} />
                  <MetricChip
                    label="معدل الحضور"
                    value={fmtPct(hr.attendance.attendance_rate)}
                    accent
                  />
                </div>
              )}
            </TabsContent>
            <TabsContent value="payroll" className="space-y-4">
              {hr?.payroll && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <MetricChip
                      label="إجمالي الرواتب"
                      value={fmtCur(hr.payroll.total_payroll)}
                    />
                    <MetricChip
                      label="عدد كشوف الرواتب"
                      value={fmtNum(hr.payroll.payroll_count)}
                    />
                    <MetricChip
                      label="متوسط الراتب"
                      value={fmtCur(hr.payroll.average_salary)}
                    />
                  </div>
                  {hr.payroll.by_status &&
                    Object.keys(hr.payroll.by_status).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(hr.payroll.by_status).map(([status, info]) => (
                          <span
                            key={status}
                            className="inline-flex items-center rounded-lg bg-muted/60 px-3 py-1.5 text-sm"
                          >
                            {status}: {fmtNum(info?.count)} — {fmtCur(info?.total)}
                          </span>
                        ))}
                      </div>
                    )}
                </>
              )}
            </TabsContent>
            <TabsContent value="activity" className="space-y-4">
              {hr?.employee_activity?.most_active_employees?.length > 0 ? (
                <div className="overflow-hidden rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-right">الموظف</TableHead>
                        <TableHead className="text-right">عدد النشاطات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hr.employee_activity.most_active_employees.map((emp) => (
                        <TableRow key={emp.user_id}>
                          <TableCell className="text-right font-medium">
                            {emp.employee_name}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {fmtNum(emp.activity_count)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  لا توجد بيانات نشاط موظفين للفترة
                </p>
              )}
            </TabsContent>
            <TabsContent value="trends" className="space-y-8">
              <AttendanceTrendChart data={attTrend} />
              <PayrollTrendChart data={payTrend} />
              {attTrend.length === 0 && payTrend.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  لا توجد بيانات اتجاهات للفترة
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}

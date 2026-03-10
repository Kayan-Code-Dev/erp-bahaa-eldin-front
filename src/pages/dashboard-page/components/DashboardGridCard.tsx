import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DashboardGridCardProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** ارتفاع أدنى موحّد لمحتوى المخطط داخل البطاقة */
  contentMinHeight?: number;
  className?: string;
};

/**
 * غلاف بطاقة للشبكة: ارتفاع متساوٍ في الصف + محتوى يملأ المساحة بدون فراغات غريبة.
 */
export function DashboardGridCard({
  title,
  description,
  children,
  contentMinHeight = 220,
  className = "",
}: DashboardGridCardProps) {
  return (
    <Card
      className={`flex min-h-0 w-full flex-col overflow-hidden rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm ${className}`}
    >
      <CardHeader className="shrink-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">{title}</CardTitle>
        {description != null && (
          <CardDescription className="text-right">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex min-h-0 flex-col pt-0">
        {/* minHeight فقط بدون flex-1 حتى لا تتمدد البطاقة لأعلى من المحتوى */}
        <div className="flex min-h-0 flex-col" style={{ minHeight: contentMinHeight }}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

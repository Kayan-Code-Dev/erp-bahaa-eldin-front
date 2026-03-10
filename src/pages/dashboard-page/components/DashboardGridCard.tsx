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
  contentMinHeight?: number;
  className?: string;
};

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
        <div className="flex min-h-0 flex-col" style={{ minHeight: contentMinHeight }}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

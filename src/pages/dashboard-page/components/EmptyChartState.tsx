type EmptyChartStateProps = {
  icon: React.ReactNode;
  message: string;
};

export function EmptyChartState({ icon, message }: EmptyChartStateProps) {
  return (
    <div className="flex h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/15 p-6">
      {icon}
      <p className="text-center text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

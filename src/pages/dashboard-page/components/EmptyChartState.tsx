type EmptyChartStateProps = {
  icon: React.ReactNode;
  message: string;
  /** ارتفاع المنطقة بالبكسل (افتراضي 200) */
  minHeight?: number;
  title?: string;
  className?: string;
};

export function EmptyChartState({
  icon,
  message,
  minHeight = 200,
  title,
  className = "",
}: EmptyChartStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/15 p-6 ${className}`}
      style={{ minHeight }}
      role="status"
      aria-label={message}
    >
      {icon}
      {title && (
        <p className="text-center text-xs font-medium text-muted-foreground">{title}</p>
      )}
      <p className="text-center text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

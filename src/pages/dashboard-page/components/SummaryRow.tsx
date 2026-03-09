type SummaryRowProps = {
  label: string;
  value: string | number;
  accent?: string;
};

export function SummaryRow({ label, value, accent }: SummaryRowProps) {
  return (
    <div className="flex flex-1 items-center justify-between rounded-lg bg-background px-3 py-2 border">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${accent ?? ""}`}>{value}</span>
    </div>
  );
}

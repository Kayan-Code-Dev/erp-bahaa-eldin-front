type MetricChipProps = {
  label: string;
  value: string;
  accent?: boolean;
};

export function MetricChip({ label, value, accent }: MetricChipProps) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-center transition-colors ${
        accent ? "bg-primary/5 border-primary/20" : "bg-muted/30"
      }`}
    >
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold tabular-nums ${accent ? "text-primary" : ""}`}>
        {value}
      </p>
    </div>
  );
}

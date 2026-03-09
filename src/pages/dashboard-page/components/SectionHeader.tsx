type SectionHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeader({ title, description, className = "" }: SectionHeaderProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      {description && (
        <p className="text-xs text-muted-foreground/90 max-w-2xl">{description}</p>
      )}
      <div className="h-px w-12 bg-primary/40 rounded-full mt-1" aria-hidden />
    </div>
  );
}

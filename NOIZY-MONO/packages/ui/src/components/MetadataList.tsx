import { cn } from "../utils";

interface MetadataItem {
  label: string;
  value: string | React.ReactNode;
}

interface MetadataListProps {
  items: MetadataItem[];
  className?: string;
  columns?: 1 | 2 | 3;
  variant?: "stacked" | "inline";
}

export function MetadataList({
  items,
  className,
  columns = 2,
  variant = "stacked",
}: MetadataListProps) {
  if (variant === "inline") {
    return (
      <dl className={cn("flex flex-wrap gap-x-6 gap-y-2", className)}>
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <dt className="text-white/40 text-sm">{item.label}:</dt>
            <dd className="text-white/80 text-sm">{item.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl
      className={cn(
        "grid gap-6",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {items.map((item, index) => (
        <div key={index}>
          <dt className="text-white/40 text-sm font-mono uppercase tracking-wider mb-1">
            {item.label}
          </dt>
          <dd className="text-white/90">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

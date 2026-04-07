import { cn } from "../utils";
import type { StatusVariant } from "@noizy/types";

interface StatusChipProps {
  label: string;
  variant?: StatusVariant;
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  neutral: "bg-white/5 text-white/60 border-white/10",
};

const dotColors: Record<StatusVariant, string> = {
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  error: "bg-red-400",
  info: "bg-blue-400",
  neutral: "bg-white/40",
};

const sizes = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-sm px-4 py-1.5",
};

export function StatusChip({
  label,
  variant = "neutral",
  size = "md",
  dot = false,
}: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        variantStyles[variant],
        sizes[size]
      )}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])}
        />
      )}
      {label}
    </span>
  );
}

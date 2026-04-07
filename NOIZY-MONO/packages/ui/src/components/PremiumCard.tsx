"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../utils";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  variant?: "glass" | "solid" | "outline";
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}

const variants = {
  glass: "bg-white/5 backdrop-blur-xl border border-white/10",
  solid: "bg-white/[0.03]",
  outline: "border border-white/10 bg-transparent",
};

const paddings = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function PremiumCard({
  children,
  className,
  variant = "glass",
  padding = "md",
  hover = false,
  onClick,
}: PremiumCardProps) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      onClick={onClick}
      className={cn(
        "rounded-2xl transition-all duration-500",
        variants[variant],
        paddings[padding],
        hover && "hover:bg-white/[0.08] hover:border-white/20 cursor-pointer",
        onClick && "text-left w-full",
        className
      )}
      whileHover={hover ? { y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}
    </Component>
  );
}

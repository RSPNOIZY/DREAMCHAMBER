"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-8",
        className
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
      {description && (
        <p className="text-white/50 max-w-sm mb-6">{description}</p>
      )}
      {action}
    </motion.div>
  );
}

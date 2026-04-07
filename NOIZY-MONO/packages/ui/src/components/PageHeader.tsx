"use client";

import { motion } from "framer-motion";
import { cn } from "../utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  align?: "left" | "center";
  size?: "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  md: {
    title: "text-3xl md:text-4xl",
    subtitle: "text-lg md:text-xl",
    description: "text-base",
  },
  lg: {
    title: "text-4xl md:text-5xl lg:text-6xl",
    subtitle: "text-xl md:text-2xl",
    description: "text-lg",
  },
  xl: {
    title: "text-5xl md:text-6xl lg:text-7xl",
    subtitle: "text-2xl md:text-3xl",
    description: "text-lg md:text-xl",
  },
};

export function PageHeader({
  title,
  subtitle,
  description,
  align = "left",
  size = "lg",
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "text-center",
        className
      )}
    >
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={cn(
            "font-mono uppercase tracking-widest text-white/50 mb-4",
            sizes[size].subtitle.replace("text-xl", "text-sm").replace("text-2xl", "text-sm")
          )}
        >
          {subtitle}
        </motion.p>
      )}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={cn(
          "font-display font-medium tracking-tight text-white",
          sizes[size].title
        )}
      >
        {title}
      </motion.h1>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={cn(
            "mt-6 text-white/60 leading-relaxed max-w-2xl",
            align === "center" && "mx-auto",
            sizes[size].description
          )}
        >
          {description}
        </motion.p>
      )}
    </header>
  );
}

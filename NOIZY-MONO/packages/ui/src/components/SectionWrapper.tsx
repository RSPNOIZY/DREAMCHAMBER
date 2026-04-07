"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../utils";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  variant?: "default" | "narrow" | "wide" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  animate?: boolean;
}

const variants = {
  default: "max-w-6xl mx-auto",
  narrow: "max-w-4xl mx-auto",
  wide: "max-w-7xl mx-auto",
  full: "w-full",
};

const paddings = {
  none: "",
  sm: "px-4 py-8 md:px-6 md:py-12",
  md: "px-6 py-12 md:px-8 md:py-20",
  lg: "px-6 py-16 md:px-8 md:py-24 lg:py-32",
  xl: "px-6 py-20 md:px-8 md:py-32 lg:py-40",
};

export function SectionWrapper({
  children,
  className,
  id,
  variant = "default",
  padding = "lg",
  animate = true,
}: SectionWrapperProps) {
  const content = (
    <div className={cn(variants[variant], paddings[padding], className)}>
      {children}
    </div>
  );

  if (!animate) {
    return <section id={id}>{content}</section>;
  }

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {content}
    </motion.section>
  );
}

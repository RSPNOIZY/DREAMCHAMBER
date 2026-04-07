"use client";

import { motion } from "framer-motion";
import { cn } from "../utils";

interface QuoteBlockProps {
  quote: string;
  attribution?: string;
  className?: string;
  size?: "md" | "lg" | "xl";
}

const sizes = {
  md: "text-xl md:text-2xl",
  lg: "text-2xl md:text-3xl",
  xl: "text-3xl md:text-4xl lg:text-5xl",
};

export function QuoteBlock({
  quote,
  attribution,
  className,
  size = "lg",
}: QuoteBlockProps) {
  return (
    <motion.blockquote
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={cn("relative", className)}
    >
      <div className="absolute -left-4 top-0 text-6xl text-white/10 font-display">
        &ldquo;
      </div>
      <p
        className={cn(
          "font-display italic text-white/90 leading-relaxed",
          sizes[size]
        )}
      >
        {quote}
      </p>
      {attribution && (
        <footer className="mt-6 text-white/50">
          <span className="text-white/30">—</span> {attribution}
        </footer>
      )}
    </motion.blockquote>
  );
}

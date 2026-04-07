"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "../utils";

interface CTAButton {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
  external?: boolean;
}

interface CTARowProps {
  buttons: CTAButton[];
  align?: "left" | "center" | "right";
  className?: string;
}

export function CTARow({ buttons, align = "left", className }: CTARowProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-4",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
        className
      )}
    >
      {buttons.map((button, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Link
            href={button.href}
            target={button.external ? "_blank" : undefined}
            rel={button.external ? "noopener noreferrer" : undefined}
            className={cn(
              "inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300",
              button.variant === "secondary"
                ? "bg-transparent border border-white/20 text-white/80 hover:border-white/40 hover:text-white"
                : "bg-white/10 hover:bg-white/20 text-white"
            )}
          >
            {button.label}
            {button.external && (
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

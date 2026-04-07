"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/archive", label: "Archive" },
  { href: "/lineage", label: "Lineage" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled
          ? "bg-abyss/90 backdrop-blur-xl border-b border-white/[0.04]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-ocean-400/20 to-ocean-600/20 group-hover:from-ocean-400/30 group-hover:to-ocean-600/30 transition-all duration-500" />
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center">
                <span className="text-white font-display text-lg">N</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg tracking-wide text-white group-hover:text-ocean-200 transition-colors duration-500">
                NOIZYFISH
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 -mt-0.5">
                Ocean Archive
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm tracking-wide transition-colors duration-500 ${
                  pathname === link.href
                    ? "text-ocean-300"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ocean-400 to-transparent"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Enter Button */}
          <Link
            href="/archive"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white/80 hover:text-white border border-white/10 hover:border-ocean-500/50 rounded-lg transition-all duration-500 hover:shadow-lg hover:shadow-ocean-500/10"
          >
            <span>Enter Archive</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-8 pb-6 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-3 text-lg transition-colors ${
                      pathname === link.href ? "text-ocean-300" : "text-white/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/archive"
                  onClick={() => setMobileOpen(false)}
                  className="block mt-6 py-3 text-center border border-ocean-500/50 rounded-lg text-ocean-300"
                >
                  Enter Archive
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

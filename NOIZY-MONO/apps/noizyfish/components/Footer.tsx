import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.04] bg-abyss-dark/50">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center">
                <span className="text-white font-display text-lg">N</span>
              </div>
              <span className="font-display text-xl tracking-wide text-white">
                NOIZYFISH
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              A living archive of oceanic recordings. Each sound carries its
              origin. Each origin carries its lineage. Preserved for those who
              will inherit the memory of the sea.
            </p>
          </div>

          {/* Archive */}
          <div className="md:col-span-2">
            <h4 className="text-white/60 text-xs uppercase tracking-widest mb-5">
              Archive
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/archive" className="text-white/40 hover:text-ocean-300 text-sm transition-colors">
                  Browse All
                </Link>
              </li>
              <li>
                <Link href="/archive?zone=sunlight" className="text-white/40 hover:text-ocean-300 text-sm transition-colors">
                  Sunlight Zone
                </Link>
              </li>
              <li>
                <Link href="/archive?zone=twilight" className="text-white/40 hover:text-ocean-300 text-sm transition-colors">
                  Twilight Zone
                </Link>
              </li>
              <li>
                <Link href="/archive?zone=midnight" className="text-white/40 hover:text-ocean-300 text-sm transition-colors">
                  Midnight Zone
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="md:col-span-2">
            <h4 className="text-white/60 text-xs uppercase tracking-widest mb-5">
              About
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-white/40 hover:text-ocean-300 text-sm transition-colors">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link href="/lineage" className="text-white/40 hover:text-ocean-300 text-sm transition-colors">
                  Lineage
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/40 hover:text-ocean-300 text-sm transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-3">
            <h4 className="text-white/60 text-xs uppercase tracking-widest mb-5">
              Provenance
            </h4>
            <ul className="space-y-3">
              <li>
                <span className="text-white/40 text-sm">
                  C2PA Verified
                </span>
              </li>
              <li>
                <span className="text-white/40 text-sm">
                  NOIZY Proof Ready
                </span>
              </li>
              <li>
                <Link href="/lineage" className="text-white/40 hover:text-ocean-300 text-sm transition-colors">
                  Learn More
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} NOIZY Labs. Archive as memory.
            Memory as responsibility.
          </p>
          <div className="flex items-center gap-6 text-white/30 text-xs">
            <Link href="https://noizy.ai" className="hover:text-ocean-400 transition-colors">
              NOIZY
            </Link>
            <span className="text-white/10">|</span>
            <Link href="mailto:rsp@noizy.ai" className="hover:text-ocean-400 transition-colors">
              rsp@noizy.ai
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

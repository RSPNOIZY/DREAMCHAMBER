import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.04] bg-sovereign-dark/50">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-voice-400 to-voice-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="font-medium text-xl tracking-wide text-white">
                NOIZYVOX
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              Consent-native voice infrastructure. Built for creators who
              understand that voice is identity, and identity demands
              sovereignty.
            </p>
          </div>

          {/* Platform */}
          <div className="md:col-span-2">
            <h4 className="text-white/60 text-xs uppercase tracking-widest mb-5">
              Platform
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/casting" className="text-white/40 hover:text-voice-300 text-sm transition-colors">
                  Casting
                </Link>
              </li>
              <li>
                <Link href="/consent" className="text-white/40 hover:text-voice-300 text-sm transition-colors">
                  Consent Center
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-white/40 hover:text-voice-300 text-sm transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust */}
          <div className="md:col-span-2">
            <h4 className="text-white/60 text-xs uppercase tracking-widest mb-5">
              Trust
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/trust" className="text-white/40 hover:text-voice-300 text-sm transition-colors">
                  Trust Framework
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/40 hover:text-voice-300 text-sm transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Provenance */}
          <div className="md:col-span-3">
            <h4 className="text-white/60 text-xs uppercase tracking-widest mb-5">
              Infrastructure
            </h4>
            <ul className="space-y-3">
              <li>
                <span className="text-white/40 text-sm">NOIZY Proof Ready</span>
              </li>
              <li>
                <span className="text-white/40 text-sm">C2PA Verified</span>
              </li>
              <li>
                <Link href="/trust" className="text-white/40 hover:text-voice-300 text-sm transition-colors">
                  Learn More
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} NOIZY Labs. Voice is identity.
            Identity is sovereign.
          </p>
          <div className="flex items-center gap-6 text-white/30 text-xs">
            <Link href="https://noizy.ai" className="hover:text-voice-400 transition-colors">
              NOIZY
            </Link>
            <span className="text-white/10">|</span>
            <Link href="mailto:rsp@noizy.ai" className="hover:text-voice-400 transition-colors">
              rsp@noizy.ai
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

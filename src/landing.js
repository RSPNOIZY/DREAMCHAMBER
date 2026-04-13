// NOIZY EMPIRE — Landing Page
// noizy.ai — The front door to the empire
// Five brands. Gospel. Constitutional. Alive.

export function landingHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NOIZY EMPIRE — Consent is Code</title>
<meta name="description" content="The 5th Epoch of music infrastructure. Consent as code. Voice sovereignty. Creator-first.">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --black:     #000000;
    --white:     #FFFFFF;
    --gold:      #C8A84B;
    --gold-dim:  #8B6914;
    --neon:      #00FFB2;
    --neon-dim:  #00A374;
    --red:       #E63946;
    --blue:      #0077FF;
    --purple:    #7B2FBE;
    --grey-900:  #0D0D0D;
    --grey-800:  #141414;
    --grey-700:  #1E1E1E;
    --grey-500:  #3A3A3A;
    --grey-300:  #888888;
    --grey-100:  #CCCCCC;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: -apple-system, 'SF Pro Display', 'Segoe UI', sans-serif;
    background: var(--black);
    color: var(--white);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── HEADER ─────────────────────────────────────────────── */
  header {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 2.5rem;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(200,168,75,0.2);
  }

  .logo {
    font-size: 1.5rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    color: var(--gold);
    text-decoration: none;
  }
  .logo span { color: var(--white); }

  nav { display: flex; gap: 2rem; align-items: center; }
  nav a {
    color: var(--grey-300);
    text-decoration: none;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: color 0.2s;
  }
  nav a:hover { color: var(--gold); }

  .nav-cta {
    padding: 0.5rem 1.25rem;
    border: 1px solid var(--gold);
    border-radius: 2px;
    color: var(--gold) !important;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    transition: background 0.2s, color 0.2s !important;
  }
  .nav-cta:hover {
    background: var(--gold) !important;
    color: var(--black) !important;
  }

  /* ── HERO ────────────────────────────────────────────────── */
  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 8rem 2rem 4rem;
    position: relative;
    overflow: hidden;
  }

  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 50% at 50% 0%, rgba(200,168,75,0.08) 0%, transparent 70%),
      radial-gradient(ellipse 60% 40% at 50% 100%, rgba(0,255,178,0.04) 0%, transparent 60%);
    pointer-events: none;
  }

  .epoch-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    border: 1px solid rgba(200,168,75,0.4);
    border-radius: 100px;
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 2rem;
  }
  .epoch-dot {
    width: 6px; height: 6px;
    background: var(--neon);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }

  h1 {
    font-size: clamp(3rem, 8vw, 7rem);
    font-weight: 900;
    letter-spacing: -0.02em;
    line-height: 0.95;
    margin-bottom: 1.5rem;
  }

  h1 .line-gold { color: var(--gold); display: block; }
  h1 .line-white { color: var(--white); display: block; }
  h1 .line-neon { color: var(--neon); display: block; }

  .hero-sub {
    font-size: clamp(1rem, 2vw, 1.35rem);
    color: var(--grey-300);
    max-width: 640px;
    line-height: 1.6;
    margin-bottom: 3rem;
  }
  .hero-sub strong { color: var(--white); font-weight: 600; }

  .hero-ctas {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn {
    padding: 0.9rem 2rem;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 2px;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
    display: inline-block;
  }
  .btn-gold {
    background: var(--gold);
    color: var(--black);
  }
  .btn-gold:hover { background: #E8C85B; transform: translateY(-1px); }
  .btn-outline {
    background: transparent;
    color: var(--white);
    border: 1px solid rgba(255,255,255,0.3);
  }
  .btn-outline:hover { border-color: var(--white); transform: translateY(-1px); }

  /* ── FIVE BRANDS ─────────────────────────────────────────── */
  .brands {
    padding: 5rem 2rem;
    background: var(--grey-900);
    border-top: 1px solid var(--grey-700);
    border-bottom: 1px solid var(--grey-700);
  }

  .section-label {
    text-align: center;
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--grey-500);
    margin-bottom: 3rem;
  }

  .brands-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .brand-card {
    padding: 2rem;
    border: 1px solid var(--grey-700);
    border-radius: 4px;
    background: var(--grey-800);
    text-decoration: none;
    color: inherit;
    transition: border-color 0.2s, transform 0.2s, background 0.2s;
    display: block;
    position: relative;
    overflow: hidden;
  }
  .brand-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--card-accent, var(--gold));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s;
  }
  .brand-card:hover::before { transform: scaleX(1); }
  .brand-card:hover {
    border-color: var(--card-accent, var(--gold));
    transform: translateY(-3px);
    background: var(--grey-700);
  }

  .brand-tag {
    display: inline-block;
    padding: 0.25rem 0.6rem;
    border-radius: 2px;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 1rem;
    background: rgba(255,255,255,0.06);
    color: var(--grey-300);
  }

  .brand-name {
    font-size: 1.6rem;
    font-weight: 900;
    letter-spacing: 0.05em;
    color: var(--card-accent, var(--gold));
    margin-bottom: 0.5rem;
  }

  .brand-tagline {
    font-size: 0.9rem;
    color: var(--grey-100);
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .brand-desc {
    font-size: 0.82rem;
    color: var(--grey-300);
    line-height: 1.6;
  }

  .brand-status {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 1.25rem;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--grey-500);
  }
  .status-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--grey-500);
  }
  .status-dot.live { background: var(--neon); animation: pulse 2s infinite; }
  .status-dot.building { background: var(--gold); }

  /* Brand accent colors */
  .card-noizy     { --card-accent: #C8A84B; }
  .card-noizylab  { --card-accent: #0077FF; }
  .card-noizykidz { --card-accent: #00FFB2; }
  .card-noizyfish { --card-accent: #7B2FBE; }
  .card-noizyvox  { --card-accent: #E63946; }

  /* ── GOSPEL ──────────────────────────────────────────────── */
  .gospel {
    padding: 7rem 2rem;
    text-align: center;
    max-width: 900px;
    margin: 0 auto;
  }

  .gospel-eyebrow {
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 2rem;
  }

  .gospel h2 {
    font-size: clamp(1.8rem, 4vw, 3.5rem);
    font-weight: 900;
    line-height: 1.15;
    margin-bottom: 2.5rem;
    letter-spacing: -0.02em;
  }

  .gospel-lines {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-bottom: 3rem;
  }

  .gospel-line {
    font-size: clamp(1rem, 2.5vw, 1.4rem);
    color: var(--grey-300);
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--grey-700);
    position: relative;
  }
  .gospel-line:last-child { border-bottom: none; }
  .gospel-line em {
    color: var(--neon);
    font-style: normal;
    font-weight: 700;
  }

  /* ── CONSTITUTIONAL ──────────────────────────────────────── */
  .constitutional {
    padding: 6rem 2rem;
    background: var(--grey-900);
    border-top: 1px solid var(--grey-700);
    border-bottom: 1px solid var(--grey-700);
  }

  .constitutional-inner {
    max-width: 1000px;
    margin: 0 auto;
  }

  .constitutional h2 {
    font-size: clamp(1.4rem, 3vw, 2.2rem);
    font-weight: 900;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 0.5rem;
  }
  .constitutional-sub {
    font-size: 0.85rem;
    color: var(--grey-500);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 3rem;
  }

  .principles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
  }

  .principle {
    padding: 1.75rem;
    border: 1px solid var(--grey-700);
    border-radius: 4px;
    background: var(--grey-800);
  }

  .principle-num {
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    color: var(--grey-500);
    text-transform: uppercase;
    margin-bottom: 0.75rem;
  }
  .principle h3 {
    font-size: 1rem;
    font-weight: 800;
    color: var(--gold);
    margin-bottom: 0.5rem;
    letter-spacing: 0.03em;
  }
  .principle p {
    font-size: 0.82rem;
    color: var(--grey-300);
    line-height: 1.6;
  }

  /* ── 7525 ROW ─────────────────────────────────────────────── */
  .royalty-bar {
    padding: 4rem 2rem;
    text-align: center;
    position: relative;
  }

  .royalty-bar::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,255,178,0.04) 0%, transparent 70%);
  }

  .royalty-split {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    max-width: 600px;
    margin: 0 auto 1.5rem;
    border-radius: 4px;
    overflow: hidden;
    height: 64px;
    font-size: 1.4rem;
    font-weight: 900;
    letter-spacing: 0.05em;
  }
  .royalty-creator {
    flex: 75;
    background: var(--neon);
    color: var(--black);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .royalty-platform {
    flex: 25;
    background: var(--grey-700);
    color: var(--grey-300);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .royalty-label {
    font-size: 0.8rem;
    color: var(--grey-500);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 0.5rem;
  }
  .royalty-label strong { color: var(--white); }

  /* ── PROOF BAR ───────────────────────────────────────────── */
  .proof-bar {
    padding: 2rem;
    background: var(--grey-900);
    border-top: 1px solid var(--grey-700);
  }

  .proof-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    align-items: center;
    justify-content: center;
  }

  .proof-stat {
    text-align: center;
    min-width: 120px;
  }
  .proof-num {
    font-size: 1.6rem;
    font-weight: 900;
    color: var(--neon);
    letter-spacing: -0.02em;
  }
  .proof-desc {
    font-size: 0.7rem;
    color: var(--grey-500);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 0.25rem;
  }

  .proof-divider {
    width: 1px;
    height: 40px;
    background: var(--grey-700);
  }

  /* ── FOOTER ──────────────────────────────────────────────── */
  footer {
    padding: 3rem 2rem;
    border-top: 1px solid var(--grey-700);
    text-align: center;
  }

  .footer-logo {
    font-size: 1.2rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    color: var(--gold);
    margin-bottom: 0.75rem;
  }
  .footer-canon {
    font-size: 0.75rem;
    color: var(--grey-500);
    letter-spacing: 0.08em;
    margin-bottom: 2rem;
  }

  .footer-links {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: center;
    margin-bottom: 2rem;
  }
  .footer-links a {
    font-size: 0.78rem;
    color: var(--grey-500);
    text-decoration: none;
    letter-spacing: 0.06em;
    transition: color 0.2s;
  }
  .footer-links a:hover { color: var(--gold); }

  .footer-legal {
    font-size: 0.7rem;
    color: var(--grey-700);
    letter-spacing: 0.05em;
  }
  .footer-legal strong { color: var(--grey-500); }

  /* ── LIVE INDICATOR ─────────────────────────────────────── */
  .live-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.85rem;
    background: rgba(0,255,178,0.08);
    border: 1px solid rgba(0,255,178,0.25);
    border-radius: 100px;
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--neon);
    margin-top: 3rem;
  }

  /* ── RESPONSIVE ─────────────────────────────────────────── */
  @media (max-width: 640px) {
    header { padding: 1rem 1.25rem; }
    nav { gap: 1rem; }
    nav a { font-size: 0.75rem; }
    .brands-grid { grid-template-columns: 1fr; }
    .principles { grid-template-columns: 1fr; }
    .proof-divider { display: none; }
    .hero-ctas { flex-direction: column; align-items: center; }
  }
</style>
</head>
<body>

<!-- HEADER -->
<header>
  <a href="/" class="logo">NOIZY<span>.AI</span></a>
  <nav>
    <a href="#brands">Empire</a>
    <a href="#gospel">Gospel</a>
    <a href="#constitutional">Constitutional</a>
    <a href="https://heaven.rsp-5f3.workers.dev/dashboard">GABRIEL</a>
    <a href="mailto:hello@noizy.ai" class="nav-cta">Contact</a>
  </nav>
</header>

<!-- HERO -->
<section class="hero">
  <div class="epoch-tag">
    <span class="epoch-dot"></span>
    The 5th Epoch · Music Infrastructure · Est. 2026
  </div>

  <h1>
    <span class="line-gold">THE VOICE IS</span>
    <span class="line-white">AN ESTATE.</span>
    <span class="line-neon">BUILD IT.</span>
  </h1>

  <p class="hero-sub">
    NOIZY.AI is the <strong>consent-native audio infrastructure</strong> for the 5th Epoch of music.
    Not a platform. A protocol. <strong>Consent as code. Provenance as default. Sovereignty by design.</strong>
  </p>

  <div class="hero-ctas">
    <a href="#brands" class="btn btn-gold">Explore the Empire</a>
    <a href="https://heaven.rsp-5f3.workers.dev/api/v1/actors" class="btn btn-outline">View the Ledger</a>
  </div>

  <div class="live-pill">
    <span class="epoch-dot"></span>
    HEAVEN Live · GABRIEL Online · RSP_001 Sovereign
  </div>
</section>

<!-- FIVE BRANDS -->
<section class="brands" id="brands">
  <p class="section-label">The NOIZY Empire — Five Brands · One Vision</p>

  <div class="brands-grid">

    <a href="https://heaven.rsp-5f3.workers.dev" class="brand-card card-noizy">
      <span class="brand-tag">Mothership</span>
      <div class="brand-name">NOIZY.AI</div>
      <div class="brand-tagline">Consent Infrastructure</div>
      <p class="brand-desc">The protocol layer for the 5th Epoch. D1 consent ledger. GABRIEL orchestration. HEAVEN kernel. Every voice transaction routed through constitutional code.</p>
      <div class="brand-status">
        <span class="status-dot live"></span>
        Live on Cloudflare Edge
      </div>
    </a>

    <a href="https://heaven.rsp-5f3.workers.dev/api/v1/licensees" class="brand-card card-noizylab">
      <span class="brand-tag">Revenue Engine</span>
      <div class="brand-name">NOIZYLAB</div>
      <div class="brand-tagline">Device Repair · Ottawa</div>
      <p class="brand-desc">$89 flat rate. 12 devices/day. The real-world revenue engine funding the 500-year vision. Where the sovereign infrastructure meets the street.</p>
      <div class="brand-status">
        <span class="status-dot live"></span>
        Operational · Target $389K/yr
      </div>
    </a>

    <a href="https://heaven.rsp-5f3.workers.dev" class="brand-card card-noizykidz">
      <span class="brand-tag">Soul Mission</span>
      <div class="brand-name">NOIZYKIDZ</div>
      <div class="brand-tagline">Haptic Music · Deaf &amp; Autism</div>
      <p class="brand-desc">Music you can feel. Haptic interfaces for deaf children and autism spectrum. Inspired by Mike Nemesvary — world champion, quadriplegic. LIFELUV in action.</p>
      <div class="brand-status">
        <span class="status-dot building"></span>
        Building · Q3 2026
      </div>
    </a>

    <a href="https://heaven.rsp-5f3.workers.dev" class="brand-card card-noizyfish">
      <span class="brand-tag">Legacy Vault</span>
      <div class="brand-name">NOIZYFISH INC.</div>
      <div class="brand-tagline">Fish Music Inc. · The Aquarium</div>
      <p class="brand-desc">34TB archive. 40 years of professional credits — Ed Edd n Eddy, Transformers, Barbie, Dragon Tales. Sync licensing. Catalog. The source material of the empire.</p>
      <div class="brand-status">
        <span class="status-dot live"></span>
        D1: aquarium-archive Active
      </div>
    </a>

    <a href="https://heaven.rsp-5f3.workers.dev/api/v1/actors" class="brand-card card-noizyvox">
      <span class="brand-tag">Voice Platform</span>
      <div class="brand-name">NOIZYVOX</div>
      <div class="brand-tagline">A.I.V.A. — Voice Army</div>
      <p class="brand-desc">Artificially Intelligent Voice Acting. XTTS v2 · RVC · Pedalboard. Your voice is an estate — we help you build it. Operation Voice Army launching Q2 2026.</p>
      <div class="brand-status">
        <span class="status-dot building"></span>
        RSP_001 Pipeline Active
      </div>
    </a>

  </div>
</section>

<!-- GOSPEL -->
<section id="gospel">
  <div class="gospel">
    <p class="gospel-eyebrow">The Gospel — NOIZY Doctrine</p>
    <h2>The Human Is Still<br>The Musician.</h2>

    <div class="gospel-lines">
      <div class="gospel-line">AI is <em>the instrument.</em> The human is still the musician.</div>
      <div class="gospel-line">We are not building a company. We are <em>planting a civilization.</em></div>
      <div class="gospel-line">Your voice is an estate. <em>We help you build it.</em></div>
      <div class="gospel-line">If the consent isn't in the code, <em>it isn't consent.</em></div>
      <div class="gospel-line">AI does not replace artists. It removes <em>friction between imagination and creation.</em></div>
      <div class="gospel-line">Some artists paint all their pictures in their heads. <em>NOIZY is the transmission cable.</em></div>
    </div>

    <a href="https://heaven.rsp-5f3.workers.dev/api/v1/stats" class="btn btn-gold">Read the Ledger</a>
  </div>
</section>

<!-- 75/25 ROYALTY -->
<section class="royalty-bar">
  <p class="section-label" style="margin-bottom:1.5rem">The NOIZY Standard — Perpetual Royalty Split</p>
  <div class="royalty-split">
    <div class="royalty-creator">75% CREATOR</div>
    <div class="royalty-platform">25%</div>
  </div>
  <p class="royalty-label"><strong>75% to creators. Forever.</strong> Founding actors: 85%. Enforced in code, not contracts.</p>
</section>

<!-- CONSTITUTIONAL -->
<section class="constitutional" id="constitutional">
  <div class="constitutional-inner">
    <h2>Constitutional</h2>
    <p class="constitutional-sub">Immutable · Human Sovereignty · Enforced in Code · Forever</p>

    <div class="principles">

      <div class="principle">
        <div class="principle-num">Article I</div>
        <h3>Consent Before Creation</h3>
        <p>No voice synthesis, cloning, or transformation without explicit prior consent. Verified. Timestamped. Immutable in D1.</p>
      </div>

      <div class="principle">
        <div class="principle-num">Article II</div>
        <h3>Artists Own What They Make</h3>
        <p>Your voice is an estate. Your descendants are your property. No platform acquisition. No buyouts. Sovereignty by architecture.</p>
      </div>

      <div class="principle">
        <div class="principle-num">Article III</div>
        <h3>Revenue Routes to Creators First</h3>
        <p>75% minimum. 85% for founding actors. Automated. Traceable. Every transaction in the immutable ledger.</p>
      </div>

      <div class="principle">
        <div class="principle-num">Article IV</div>
        <h3>Intelligence Belongs to Its Source</h3>
        <p>Your voice model is your property. Trained on your voice. Never shared. Never used without consent tokens.</p>
      </div>

      <div class="principle">
        <div class="principle-num">Article V</div>
        <h3>Training Data Has Provenance</h3>
        <p>Every training sample is C2PA-verified. Chain of custody from recording to synthesis. Cryptographic proof of origin.</p>
      </div>

      <div class="principle">
        <div class="principle-num">Article VI</div>
        <h3>The Kill Switch is Sacred</h3>
        <p>Any creator can revoke all active consent tokens instantly. No override. No exception. Revocation is architectural, not contractual.</p>
      </div>

      <div class="principle">
        <div class="principle-num">Article VII</div>
        <h3>Never Clauses are Immutable</h3>
        <p>Political use, sexual content, weapons, deception, hate — once declared, permanently blocked. Not a policy. A constraint in the runtime.</p>
      </div>

      <div class="principle">
        <div class="principle-num">Article VIII</div>
        <h3>The 500-Year Vision</h3>
        <p>Seven epochs. 2026–2526. We are not building for this quarter. We are building infrastructure that outlives us. The DreamChamber Codex is the map.</p>
      </div>

    </div>
  </div>
</section>

<!-- PROOF BAR -->
<section class="proof-bar">
  <div class="proof-inner" id="proof-bar">
    <div class="proof-stat">
      <div class="proof-num" id="stat-actors">1</div>
      <div class="proof-desc">Sovereign Actors</div>
    </div>
    <div class="proof-divider"></div>
    <div class="proof-stat">
      <div class="proof-num" id="stat-ledger">16</div>
      <div class="proof-desc">Ledger Events</div>
    </div>
    <div class="proof-divider"></div>
    <div class="proof-stat">
      <div class="proof-num">LIVE</div>
      <div class="proof-desc">Cloudflare Edge</div>
    </div>
    <div class="proof-divider"></div>
    <div class="proof-stat">
      <div class="proof-num">75%+</div>
      <div class="proof-desc">Creator Royalty Floor</div>
    </div>
    <div class="proof-divider"></div>
    <div class="proof-stat">
      <div class="proof-num">∞</div>
      <div class="proof-desc">Perpetual Rights</div>
    </div>
    <div class="proof-divider"></div>
    <div class="proof-stat">
      <div class="proof-num">500yr</div>
      <div class="proof-desc">Vision Horizon</div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-logo">NOIZY EMPIRE</div>
  <p class="footer-canon">Ottawa, Canada · Est. 2026 · RSP_001 Sovereign · GABRIEL Online</p>

  <div class="footer-links">
    <a href="https://heaven.rsp-5f3.workers.dev">HEAVEN API</a>
    <a href="https://heaven.rsp-5f3.workers.dev/dashboard">GABRIEL Dashboard</a>
    <a href="https://heaven.rsp-5f3.workers.dev/api/v1/stats">Live Stats</a>
    <a href="https://heaven.rsp-5f3.workers.dev/health">System Health</a>
    <a href="mailto:hello@noizy.ai">hello@noizy.ai</a>
    <a href="mailto:fairtrade@noizy.ai">Fair Trade AI</a>
  </div>

  <p class="footer-legal">
    <strong>© 2026 NOIZYFISH INC. / RSP_001.</strong>
    All voice sovereignty rights reserved. Consent enforced in code.
    HEAVEN v17.0.0 · D1: agent-memory · Cloudflare Edge · Constitutional at every layer.
  </p>
</footer>

<script>
// Live stat refresh from HEAVEN API
async function refreshStats() {
  try {
    const r = await fetch('/api/v1/stats');
    const d = await r.json();
    const s = d.stats;
    if (!s) return;
    const a = document.getElementById('stat-actors');
    const l = document.getElementById('stat-ledger');
    if (a) a.textContent = s.actors || 1;
    if (l) l.textContent = s.ledger_events || 16;
  } catch(e) {}
}
refreshStats();
setInterval(refreshStats, 30000);
</script>

</body>
</html>`;
}

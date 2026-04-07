import { useState, useEffect } from "react";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=IBM+Plex+Mono:wght@300;400;500;700&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#020209;--surf:#07070f;--card:#0b0b16;--card2:#0e0e1b;
  --gold:#e8a020;--gold2:#f5bc45;--gold-g:rgba(232,160,32,0.12);
  --teal:#0fb8a0;--teal2:#15d4bc;--teal-g:rgba(15,184,160,0.12);
  --violet:#b060ff;--violet2:#c87fff;--violet-g:rgba(176,96,255,0.10);
  --rose:#ff4060;--rose-g:rgba(255,64,96,0.10);
  --sky:#38b4f8;--sky-g:rgba(56,180,248,0.10);
  --border:#12122a;--border2:#1c1c38;
  --text:#dde4f0;--muted:#4a5870;--muted2:#7a8aa0;
  --serif:'Cormorant Garamond',Georgia,serif;
  --mono:'IBM Plex Mono',monospace;
}
body{background:var(--bg);}

.root{background:var(--bg);min-height:100vh;font-family:var(--mono);color:var(--text);position:relative;overflow-x:hidden;}

/* Ambient */
.root::before{content:'';position:fixed;top:-40%;left:-20%;width:70%;height:70%;
  background:radial-gradient(ellipse,rgba(232,160,32,0.04) 0%,transparent 70%);
  pointer-events:none;z-index:0;}
.root::after{content:'';position:fixed;bottom:-30%;right:-10%;width:60%;height:60%;
  background:radial-gradient(ellipse,rgba(15,184,160,0.04) 0%,transparent 70%);
  pointer-events:none;z-index:0;}

/* HEADER */
.hdr{position:relative;z-index:10;border-bottom:1px solid var(--border2);
  padding:18px 36px;display:flex;align-items:center;justify-content:space-between;
  background:rgba(2,2,9,0.9);backdrop-filter:blur(16px);}
.hdr-brand{display:flex;align-items:baseline;gap:2px;}
.hdr-n{font-family:var(--serif);font-size:30px;font-weight:700;color:var(--gold);letter-spacing:-0.5px;}
.hdr-oizy{font-family:var(--serif);font-size:30px;font-weight:300;color:#fff;letter-spacing:-0.5px;}
.hdr-ai{font-size:11px;color:var(--gold);letter-spacing:3px;margin-left:8px;align-self:center;font-weight:700;}
.hdr-tag{font-size:9px;color:var(--muted);letter-spacing:3px;margin-top:4px;text-transform:uppercase;}
.hdr-right{display:flex;align-items:center;gap:16px;}
.hdr-pill{font-size:9px;padding:5px 14px;border:1px solid var(--border2);border-radius:100px;color:var(--muted2);letter-spacing:2px;}
.hdr-pill.live{border-color:var(--teal);color:var(--teal);background:var(--teal-g);}

/* HERO */
.hero{position:relative;z-index:1;text-align:center;padding:52px 36px 32px;max-width:900px;margin:0 auto;}
.hero-pre{font-size:9px;color:var(--gold);letter-spacing:5px;text-transform:uppercase;margin-bottom:20px;
  display:flex;align-items:center;justify-content:center;gap:14px;}
.hero-pre::before,.hero-pre::after{content:'';display:block;width:48px;height:1px;background:var(--gold);opacity:0.4;}
.hero-h1{font-family:var(--serif);font-size:clamp(38px,5.5vw,68px);font-weight:300;line-height:1.1;
  color:#fff;letter-spacing:-1px;margin-bottom:8px;}
.hero-h1 em{font-style:italic;color:var(--gold);}
.hero-h1 strong{font-weight:700;}
.hero-sub{font-size:11px;color:var(--muted2);line-height:2;letter-spacing:0.5px;max-width:580px;margin:20px auto 0;}
.hero-sub b{color:var(--teal);}

/* WAVE */
.wave{display:flex;align-items:center;justify-content:center;gap:2px;padding:28px 0 20px;}
.wb{width:2px;border-radius:2px;background:var(--gold);animation:wa 1.6s ease-in-out infinite;}
@keyframes wa{0%,100%{transform:scaleY(0.2);opacity:0.2;}50%{transform:scaleY(1);opacity:0.7;}}

/* STAT ROW */
.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:var(--border);
  border:1px solid var(--border);border-radius:10px;overflow:hidden;
  margin:0 36px 36px;position:relative;z-index:1;}
.stat{background:var(--card);padding:18px 20px;text-align:center;}
.stat-v{font-family:var(--serif);font-size:26px;font-weight:700;line-height:1;margin-bottom:5px;}
.stat-l{font-size:8px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;}

/* TABS */
.tabs{display:flex;justify-content:center;gap:3px;padding:0 36px 36px;position:relative;z-index:1;flex-wrap:wrap;}
.tab{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;padding:10px 22px;border-radius:5px;
  cursor:pointer;transition:all 0.2s;border:1px solid transparent;white-space:nowrap;}
.tab.on{background:var(--gold-g);border-color:var(--gold);color:var(--gold);}
.tab.off{color:var(--muted);border-color:var(--border2);}
.tab.off:hover{border-color:var(--border2);color:var(--muted2);}

/* CONTENT */
.con{position:relative;z-index:1;padding:0 36px 64px;max-width:1160px;margin:0 auto;}

/* SECTION TITLE */
.sec-title{font-family:var(--serif);font-size:13px;font-weight:400;color:var(--muted2);
  letter-spacing:4px;text-transform:uppercase;margin-bottom:28px;display:flex;align-items:center;gap:16px;}
.sec-title::after{content:'';flex:1;height:1px;background:var(--border2);}

/* ══ ECOSYSTEM ══ */
.eco-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}
.eco-card{background:var(--card);border:1px solid var(--border2);border-radius:14px;overflow:hidden;
  transition:border-color 0.25s;cursor:default;}
.eco-card:hover{border-color:var(--card-accent);}
.eco-head{padding:24px 28px 20px;border-bottom:1px solid var(--border);}
.eco-icon{font-size:32px;margin-bottom:12px;}
.eco-name{font-family:var(--serif);font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.3px;}
.eco-tag{font-size:9px;letter-spacing:3px;text-transform:uppercase;margin-top:4px;}
.eco-body{padding:20px 28px;}
.eco-desc{font-size:12px;color:var(--muted2);line-height:1.9;margin-bottom:18px;}
.eco-feats{display:flex;flex-direction:column;gap:8px;}
.eco-feat{display:flex;align-items:flex-start;gap:10px;font-size:11px;color:var(--text);line-height:1.5;}
.eco-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;margin-top:5px;}
.eco-bottom{padding:16px 28px;border-top:1px solid var(--border);background:rgba(255,255,255,0.015);}
.eco-metric{display:flex;justify-content:space-between;align-items:center;}
.eco-m-label{font-size:9px;color:var(--muted);letter-spacing:2px;}
.eco-m-val{font-size:13px;font-weight:700;}

/* Parent card full width */
.eco-parent{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:0;}
.eco-parent .eco-head{border-bottom:none;border-right:1px solid var(--border);}
.eco-parent .eco-body{padding:24px 28px;}

/* ══ DR. B ══ */
.drb-layout{display:grid;grid-template-columns:340px 1fr;gap:20px;}
.drb-profile{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:32px;text-align:center;}
.drb-avatar{width:100px;height:100px;border-radius:50%;margin:0 auto 20px;
  background:linear-gradient(135deg,var(--teal-g),var(--violet-g));
  border:2px solid var(--teal);display:flex;align-items:center;justify-content:center;
  font-size:42px;}
.drb-name{font-family:var(--serif);font-size:22px;font-weight:700;color:#fff;margin-bottom:6px;}
.drb-role{font-size:9px;color:var(--teal);letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;}
.drb-creds{display:flex;flex-direction:column;gap:8px;text-align:left;margin-bottom:24px;}
.drb-cred{font-size:11px;color:var(--muted2);line-height:1.6;padding:10px 14px;
  background:rgba(255,255,255,0.03);border-radius:6px;border-left:2px solid var(--teal);}
.drb-status{font-size:9px;padding:8px 16px;border-radius:100px;background:var(--teal-g);
  border:1px solid var(--teal);color:var(--teal);letter-spacing:2px;}

.drb-right{display:flex;flex-direction:column;gap:16px;}
.drb-questions{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:28px;flex:1;}
.drb-q-title{font-size:11px;color:var(--gold);letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;}
.drb-q{padding:18px 20px;border:1px solid var(--border2);border-radius:10px;margin-bottom:12px;
  background:rgba(255,255,255,0.02);transition:border-color 0.2s;}
.drb-q:hover{border-color:var(--border2);}
.drb-q-n{font-size:9px;color:var(--muted);letter-spacing:2px;margin-bottom:8px;}
.drb-q-text{font-size:13px;color:#fff;font-family:var(--serif);font-style:italic;line-height:1.6;margin-bottom:10px;}
.drb-q-answer{font-size:11px;color:var(--muted2);line-height:1.8;}
.drb-q-answer b{color:var(--teal);}

.drb-console{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:24px;}
.drb-console-title{font-size:9px;color:var(--teal);letter-spacing:3px;margin-bottom:16px;text-transform:uppercase;}
.drb-console-box{background:#030308;border:1px solid var(--border);border-radius:8px;padding:16px;font-size:11px;line-height:2;}
.drb-line{display:flex;gap:10px;}
.drb-prompt{color:var(--teal);}
.drb-out{color:var(--muted2);}
.drb-out b{color:var(--gold2);}

/* ══ DREAMCHAMBER ══ */
.dc-hero{text-align:center;padding:32px;background:var(--card);border:1px solid var(--border2);
  border-radius:16px;margin-bottom:20px;position:relative;overflow:hidden;}
.dc-hero::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  width:300px;height:300px;background:radial-gradient(ellipse,rgba(232,160,32,0.06),transparent 70%);
  pointer-events:none;}
.dc-hero-title{font-family:var(--serif);font-size:38px;font-weight:300;color:#fff;
  letter-spacing:-0.5px;margin-bottom:12px;font-style:italic;}
.dc-hero-title strong{font-weight:700;font-style:normal;color:var(--gold);}
.dc-hero-sub{font-size:11px;color:var(--muted2);line-height:2;max-width:560px;margin:0 auto;}
.dc-laws{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;}
.dc-law{background:var(--card);border:1px solid var(--border2);border-radius:12px;padding:24px;}
.dc-law-num{font-size:36px;font-weight:700;font-family:var(--serif);color:var(--border2);margin-bottom:12px;line-height:1;}
.dc-law-title{font-size:14px;font-weight:700;color:#fff;margin-bottom:8px;}
.dc-law-desc{font-size:11px;color:var(--muted2);line-height:1.8;}
.dc-phases{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;}
.dc-phase{background:var(--card);border:1px solid var(--border2);border-radius:10px;padding:18px 14px;text-align:center;}
.dc-phase-icon{font-size:24px;margin-bottom:10px;}
.dc-phase-n{font-size:9px;color:var(--muted);letter-spacing:2px;margin-bottom:4px;}
.dc-phase-title{font-size:12px;font-weight:700;color:#fff;margin-bottom:6px;}
.dc-phase-desc{font-size:10px;color:var(--muted2);line-height:1.7;}

/* ══ NEURO-SCIENCE ══ */
.ns-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}
.ns-card{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:26px;}
.ns-card-title{font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;font-weight:700;}
.freq-item{margin-bottom:16px;}
.freq-label{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
.freq-name{font-size:12px;color:#fff;}
.freq-hz{font-size:10px;color:var(--muted2);}
.freq-bar-bg{height:6px;background:var(--border);border-radius:3px;overflow:hidden;}
.freq-bar-fill{height:100%;border-radius:3px;transition:width 0.5s;}
.freq-desc{font-size:10px;color:var(--muted);margin-top:5px;line-height:1.6;}

.ns-full{grid-column:1/-1;}
.ns-asmr{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
.asmr-card{background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:10px;padding:18px;}
.asmr-freq{font-family:var(--serif);font-size:28px;font-weight:700;color:var(--gold);line-height:1;margin-bottom:8px;}
.asmr-name{font-size:11px;font-weight:700;color:#fff;margin-bottom:6px;}
.asmr-desc{font-size:10px;color:var(--muted2);line-height:1.7;}

/* ══ GUILD ══ */
.guild-layout{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}
.guild-economy{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:28px;}
.guild-e-title{font-size:10px;color:var(--gold);letter-spacing:3px;text-transform:uppercase;margin-bottom:24px;}
.split-visual{display:flex;height:12px;border-radius:6px;overflow:hidden;margin-bottom:20px;gap:2px;}
.split-artist{background:var(--gold);border-radius:4px;}
.split-noizy{background:var(--border2);border-radius:4px;}
.split-labels{display:flex;justify-content:space-between;margin-bottom:24px;}
.split-lbl{font-size:10px;}
.guild-streams{display:flex;flex-direction:column;gap:10px;}
.guild-stream{display:flex;align-items:center;justify-content:space-between;
  padding:12px 16px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid var(--border);}
.gs-name{font-size:12px;color:var(--text);}
.gs-val{font-size:12px;font-weight:700;color:var(--gold);}

.guild-tiers{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:28px;}
.guild-t-title{font-size:10px;color:var(--teal);letter-spacing:3px;text-transform:uppercase;margin-bottom:24px;}
.tier{padding:16px 20px;border:1px solid var(--border2);border-radius:10px;margin-bottom:12px;}
.tier-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.tier-name{font-size:13px;font-weight:700;color:#fff;}
.tier-badge{font-size:9px;padding:3px 10px;border-radius:100px;letter-spacing:1.5px;}
.tier-desc{font-size:11px;color:var(--muted2);line-height:1.7;}

.guild-governance{grid-column:1/-1;background:var(--card);border:1px solid var(--border2);
  border-radius:14px;padding:28px;}
.gov-title{font-size:10px;color:var(--violet);letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;}
.gov-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
.gov-item{padding:16px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid var(--border);}
.gov-icon{font-size:20px;margin-bottom:8px;}
.gov-name{font-size:12px;font-weight:700;color:#fff;margin-bottom:5px;}
.gov-desc{font-size:10px;color:var(--muted2);line-height:1.6;}

/* ══ SONIC AIDS ══ */
.sa-devices{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}
.sa-device{background:var(--card);border:1px solid var(--border2);border-radius:14px;overflow:hidden;}
.sa-device-head{padding:24px 28px;border-bottom:1px solid var(--border);}
.sa-device-icon{font-size:36px;margin-bottom:14px;}
.sa-device-name{font-family:var(--serif);font-size:20px;font-weight:700;color:#fff;margin-bottom:6px;}
.sa-device-tag{font-size:9px;letter-spacing:3px;text-transform:uppercase;}
.sa-device-body{padding:22px 28px;}
.sa-device-desc{font-size:12px;color:var(--muted2);line-height:1.9;margin-bottom:20px;}
.sa-specs{display:flex;flex-direction:column;gap:8px;}
.sa-spec{display:flex;justify-content:space-between;padding:10px 14px;
  background:rgba(255,255,255,0.02);border-radius:6px;border:1px solid var(--border);}
.sa-spec-k{font-size:10px;color:var(--muted);}
.sa-spec-v{font-size:11px;color:var(--text);font-weight:500;}
.sa-roadmap{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:28px;}
.sa-rm-title{font-size:10px;color:var(--rose);letter-spacing:3px;text-transform:uppercase;margin-bottom:24px;}
.rm-item{display:grid;grid-template-columns:80px 1fr;gap:20px;align-items:flex-start;
  padding:16px 0;border-bottom:1px solid var(--border);}
.rm-item:last-child{border-bottom:none;}
.rm-year{font-family:var(--serif);font-size:20px;font-weight:700;color:var(--rose);}
.rm-content-title{font-size:13px;font-weight:700;color:#fff;margin-bottom:5px;}
.rm-content-desc{font-size:11px;color:var(--muted2);line-height:1.7;}

/* Pulse animation */
@keyframes pulse{0%,100%{opacity:0.6;}50%{opacity:1;}}
.pulse{animation:pulse 2s ease-in-out infinite;}

/* Scan line */
@keyframes scan{0%{transform:translateY(-100%);}100%{transform:translateY(100vh);}}
.scan-line{position:fixed;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(232,160,32,0.08),transparent);
  animation:scan 8s linear infinite;pointer-events:none;z-index:999;}

/* ══ VOICE DNA ══ */
.vdna-layer{display:grid;grid-template-columns:200px 1fr;background:var(--card);border-radius:14px;overflow:hidden;margin-bottom:12px;}
.vdna-layer-side{padding:22px 24px;border-right:1px solid var(--border);}
.vdna-layer-body{padding:22px 24px;}
.vdna-layer-num{font-size:9px;letter-spacing:4px;text-transform:uppercase;margin-bottom:4px;}
.vdna-layer-name{font-family:var(--serif);font-size:17px;font-weight:700;color:#fff;}
.vdna-layer-desc{font-size:11px;color:var(--muted2);line-height:1.8;margin-bottom:14px;}
.vdna-params{display:flex;flex-wrap:wrap;gap:6px;}
.vdna-param{font-size:9px;padding:3px 10px;border-radius:100px;letter-spacing:1.5px;}

.actor-math{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:20px;}
.actor-block{text-align:center;padding:14px 18px;border-radius:12px;}
.actor-block.big{padding:20px 28px;}
.actor-n{font-family:var(--serif);font-weight:700;line-height:1;}
.actor-lbl{font-size:9px;color:var(--muted);letter-spacing:2px;margin-top:4px;text-transform:uppercase;}
.actor-op{font-size:20px;color:var(--border2);}

.dialect-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
.dialect-card{background:var(--card);border:1px solid var(--border2);border-radius:12px;padding:22px;}
.dialect-region{font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;margin-bottom:16px;}
.dialect-chips{display:flex;flex-wrap:wrap;gap:7px;}
.dialect-chip{font-size:10px;padding:4px 12px;border-radius:100px;color:var(--text);}

.arch-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:20px;}
.arch-card{background:var(--card);border:1px solid var(--border2);border-radius:12px;padding:18px 12px;text-align:center;transition:border-color 0.2s;}
.arch-card:hover{border-color:var(--gold);}
.arch-icon{font-size:26px;margin-bottom:10px;}
.arch-name{font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;}
.arch-tag{font-size:9px;color:var(--muted2);letter-spacing:1.5px;display:block;margin-bottom:2px;}

/* ══ ARTIST MANIFESTO ══ */
.mani-layout{display:grid;grid-template-columns:1fr 340px;gap:16px;margin-bottom:20px;}
.mani-main{display:flex;flex-direction:column;gap:14px;}
.mani-block{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:26px;}
.mani-block-title{font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;margin-bottom:18px;}
.vision-box{background:#030308;border:1px solid var(--border);border-radius:8px;padding:16px 20px;
  font-size:13px;color:#fff;font-family:var(--serif);font-style:italic;line-height:1.7;margin-bottom:14px;}
.vision-tags{display:flex;flex-wrap:wrap;gap:7px;}
.vision-tag{font-size:9px;padding:4px 12px;border-radius:100px;letter-spacing:1.5px;}
.boundary-tiers{display:flex;flex-direction:column;gap:10px;}
.boundary-tier{border-radius:10px;padding:16px 18px;}
.bt-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.bt-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
.bt-label{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;}
.bt-items{display:flex;flex-direction:column;gap:5px;}
.bt-item{font-size:11px;color:var(--muted2);padding-left:20px;line-height:1.6;}
.bt-item::before{content:'—';margin-right:8px;opacity:0.4;}
.mani-sidebar{display:flex;flex-direction:column;gap:14px;}
.traffic-dash{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:24px;}
.td-title{font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:18px;}
.traffic-stats{display:flex;flex-direction:column;gap:10px;margin-bottom:18px;}
.ts-row{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:8px;}
.ts-light{width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-right:10px;}
.ts-label{font-size:11px;color:var(--text);flex:1;}
.ts-count{font-family:var(--serif);font-size:20px;font-weight:700;}
.traffic-week{font-size:9px;color:var(--muted);letter-spacing:2px;text-align:center;padding-top:12px;
  border-top:1px solid var(--border);}
.lineage-card{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:24px;}
.lc-title{font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;}
.lineage-examples{display:flex;flex-direction:column;gap:10px;}
.le-item{padding:12px 14px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid var(--border);}
.le-combo{font-family:var(--serif);font-size:13px;color:#fff;margin-bottom:5px;font-style:italic;}
.le-niche{font-size:9px;color:var(--muted2);letter-spacing:1.5px;}
.equity-card{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:24px;}
.ec-title{font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;}
.equity-steps{display:flex;flex-direction:column;gap:8px;}
.eq-step{display:grid;grid-template-columns:20px 1fr;gap:12px;align-items:flex-start;padding:10px 14px;
  background:rgba(255,255,255,0.02);border-radius:8px;}
.eq-n{font-family:var(--serif);font-size:14px;font-weight:700;line-height:1;margin-top:1px;}
.eq-text{font-size:10px;color:var(--muted2);line-height:1.7;}
.eq-text b{color:var(--text);display:block;margin-bottom:2px;}
.discovery-bar{background:var(--card);border:1px solid rgba(176,96,255,0.3);border-radius:14px;padding:28px;margin-bottom:20px;}
.db-title{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--violet);margin-bottom:16px;}
.db-search{display:flex;align-items:center;gap:12px;background:#030308;border:1px solid var(--border2);
  border-radius:8px;padding:14px 18px;margin-bottom:16px;}
.db-icon{font-size:16px;}
.db-query{font-family:var(--serif);font-size:14px;color:var(--violet);font-style:italic;flex:1;}
.db-results{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}
.db-result{padding:14px 16px;background:rgba(255,255,255,0.02);border:1px solid var(--border2);border-radius:10px;}
.db-result-name{font-size:12px;font-weight:700;color:#fff;margin-bottom:4px;}
.db-result-combo{font-size:10px;color:var(--violet);font-style:italic;margin-bottom:8px;}
.db-result-tags{display:flex;flex-wrap:wrap;gap:4px;}
.db-rt{font-size:8px;padding:2px 7px;border-radius:100px;background:var(--violet-g);color:var(--violet2);}

/* ══ THREE PRIMAL FREQUENCIES ══ */
.freq3-wrap{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-bottom:20px;
  background:var(--border);border:1px solid var(--border);border-radius:16px;overflow:hidden;}
.freq3-card{padding:32px 28px;position:relative;overflow:hidden;}
.freq3-card::before{content:'';position:absolute;top:-40%;right:-20%;width:180px;height:180px;
  border-radius:50%;pointer-events:none;}
.freq3-num{font-family:var(--serif);font-size:11px;letter-spacing:5px;text-transform:uppercase;
  margin-bottom:20px;opacity:0.5;}
.freq3-hz{font-family:var(--serif);font-size:42px;font-weight:700;line-height:1;margin-bottom:8px;}
.freq3-name{font-size:10px;letter-spacing:4px;text-transform:uppercase;font-weight:700;margin-bottom:18px;}
.freq3-body{font-size:11px;color:var(--muted2);line-height:2;margin-bottom:18px;}
.freq3-truth{font-family:var(--serif);font-size:14px;font-style:italic;line-height:1.6;}

.future-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
.future-card{background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:26px;
  position:relative;overflow:hidden;}
.future-card::after{content:'BUILDING 2027';position:absolute;top:14px;right:14px;
  font-size:8px;letter-spacing:2px;padding:3px 8px;border-radius:100px;
  background:rgba(255,255,255,0.04);color:var(--muted);border:1px solid var(--border2);}
.future-icon{font-size:32px;margin-bottom:14px;}
.future-name{font-family:var(--serif);font-size:19px;font-weight:700;color:#fff;margin-bottom:6px;}
.future-tag{font-size:9px;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;}
.future-desc{font-size:11px;color:var(--muted2);line-height:1.9;}

/* ══ ACOUSTIC SHIELD ══ */
.shield-stack{display:flex;flex-direction:column;gap:12px;margin-bottom:20px;}
.shield-row{display:grid;grid-template-columns:48px 1fr auto;align-items:center;gap:20px;
  padding:18px 22px;background:var(--card);border:1px solid var(--border2);border-radius:12px;}
.shield-step{font-family:var(--serif);font-size:22px;font-weight:700;}
.shield-label{font-size:12px;font-weight:700;color:#fff;margin-bottom:4px;}
.shield-detail{font-size:10px;color:var(--muted2);line-height:1.7;}
.shield-badge{font-size:9px;padding:4px 12px;border-radius:100px;letter-spacing:2px;white-space:nowrap;}
.crawl-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
.crawl-card{background:var(--card);border:1px solid var(--border2);border-radius:12px;padding:20px;}
.crawl-platform{font-size:22px;margin-bottom:8px;}
.crawl-name{font-size:11px;font-weight:700;color:#fff;margin-bottom:4px;}
.crawl-freq{font-size:9px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;}
.crawl-bar-bg{height:4px;background:var(--border);border-radius:2px;overflow:hidden;}
.crawl-bar-fill{height:100%;border-radius:2px;}
.response-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;}
.response-card{background:var(--card);border-radius:12px;padding:22px;}
.response-icon{font-size:28px;margin-bottom:12px;}
.response-title{font-size:12px;font-weight:700;color:#fff;margin-bottom:6px;}
.response-desc{font-size:11px;color:var(--muted2);line-height:1.8;}
`;

const WAVES = [10, 16, 24, 30, 38, 44, 36, 28, 18, 42, 34, 22, 40, 26, 46, 32, 20, 38, 24, 44, 28, 16, 36, 22, 42];

const ECOSYS = [
  {
    id: "vox", icon: "🗣️", name: "NOIZYVOX", tag: "Master Voice Engine",
    color: "var(--gold)", glow: "var(--gold-g)", accent: "var(--gold)",
    desc: "The flagship neuro-acoustic generator. Creator-owned voice identity. Consent-locked at genesis. Personality-specific models that compound in value with every use.",
    feats: [
      "75/25 split — artist keeps 75% forever",
      "Consent architecture baked into model weights",
      "Signal intelligence feeds data back to artist",
      "Biometric performance mirror — preserves human soul",
      "Enterprise, therapeutic & creative licensing tiers",
    ],
    metric: "Per-Inference Royalty", metricVal: "75% Forever",
  },
  {
    id: "fish", icon: "🌊", name: "NOIZYFISH", tag: "Omnilingual Empathy Bridge",
    color: "var(--teal)", glow: "var(--teal-g)", accent: "var(--teal)",
    desc: "Cross-cultural neuro-acoustic translation. Not just words — the emotional geometry of the original performance is mathematically preserved across every language.",
    feats: [
      "Restructures phonemes to trigger same vagal response",
      "Artist earns 75% on every language variant",
      "Emotional intent preserved — not just translation",
      "40-language neuro-acoustic mapping engine",
      "Artist heals globally while sleeping locally",
    ],
    metric: "Language Coverage", metricVal: "40+ Languages",
  },
  {
    id: "kidz", icon: "🧸", name: "NOIZKIDZ", tag: "Pediatric Sanctuary",
    color: "var(--sky)", glow: "var(--sky-g)", accent: "var(--sky)",
    desc: "Zero-commercialization fortress. Sleepy Time Stories, Autism Sonic Aids, haptic solutions for deaf children. Voices ring-fenced from advertising forever.",
    feats: [
      "Bio-responsive sleep stories — story paces to child's heart rate",
      "Delta-wave descent — embeds 1.5 Hz sleep entrainment",
      "Night Terror Guardian Mode — AI watches while child sleeps",
      "Parent voice harmonic cross-fade for separation anxiety",
      "Amniotic acoustics — womb-frequency safe space",
    ],
    metric: "Trust Architecture", metricVal: "Zero-Commercial",
  },
  {
    id: "ai", icon: "⚡", name: "NOIZY.ai", tag: "Bedrock & Guild Economy",
    color: "var(--violet)", glow: "var(--violet-g)", accent: "var(--violet)",
    desc: "The parent architecture. Consent-as-Code network. The legal, economic, and cryptographic foundation. Artist's terms mathematically govern everything — the AI refuses to speak if rules are violated.",
    feats: [
      "Consent-as-Code: rules baked into neural weights",
      "Smart-split routing: 75% auto-delivered per inference",
      "Acoustic Hunter Protocol: crawls internet for IP theft",
      "Guild governance dashboard: artists vote on platform terms",
      "Audio-Ceutical prescription infrastructure",
    ],
    metric: "Ownership Model", metricVal: "Artist = Platform",
  },
];

const DRB_QUESTIONS = [
  {
    n: "Unfinished Question 01",
    q: "How do we calm the peritumoral neural storm without cutting?",
    a: "Targeted <b>40 Hz Gamma entrainment</b> embedded beneath ASMR vocal tracks. Acts as an acoustic anti-convulsant — suppressing hyper-excitable neurons non-invasively. No scalpel required.",
  },
  {
    n: "Unfinished Question 02",
    q: "If the cranial nerve is bruised post-surgery, how do we force regeneration?",
    a: "The <b>Mastoid Patch Sonic Aid</b> vibrates the mastoid bone at specific low frequencies, physically stimulating Cranial Nerves VII & VIII. Acoustic neurogenesis — mechanical vibration as cellular physiotherapy.",
  },
  {
    n: "Unfinished Question 03",
    q: "How do we defeat the pharmaceutical monopoly on mental health?",
    a: "<b>Audio-Ceuticals</b>: prescribable, consent-locked voice profiles that treat PTSD, Anxiety & Autism. Cannot be monopolized by Big Pharma. Owned perpetually by the Artist. Regulated by Health Canada & FDA as Class II Medical Devices.",
  },
];

const FREQS = [
  { name: "Delta — Deep Sleep", hz: "0.5–4 Hz", pct: 95, color: "var(--violet)", desc: "Deepest healing state. NOIZKIDZ embeds this as stories conclude, physically guiding the child's brain into REM." },
  { name: "Theta — Light Trance", hz: "4–8 Hz", pct: 78, color: "var(--teal)", desc: "ASMR sweet spot. Shamanic drumming, deep meditation. Binaural beats target this range for PTSD de-escalation." },
  { name: "Alpha — Relaxed Calm", hz: "8–13 Hz", pct: 62, color: "var(--sky)", desc: "Transition from alert to restful. Neural Earbuds coax brain here first before descending to Theta/Delta." },
  { name: "Gamma — Neuro-Repair", hz: "40 Hz", pct: 45, color: "var(--gold)", desc: "Dr. B's surgical frequency. Suppresses peritumoral electrical storms. Boosts deep sleep quality by up to 50%." },
];

const ASMR_FREQS = [
  { hz: "80–150 Hz", name: "Vagus Anchor", desc: "Simulates vocal proximity. Physically vibrates vagus nerve — triggers parasympathetic 'safe' response." },
  { hz: "10k+ Hz", name: "Air Shimmer", desc: "Ultra-high texture. Highlights micro-mouth sounds, lip partings, breath. Triggers scalp paresthesia (the tingle)." },
  { hz: "5–8k Hz", name: "Sibilance Guard", desc: "De-esser zone. Harsh consonants removed. Acoustic glass becomes velvet. ASMR state protected." },
  { hz: "4–13 Hz", name: "Neural Pacer", desc: "Sub-audible binaural differential. Brain follows the beat. Anxiety state gently dragged into calm." },
];

const TIERS = [
  { name: "DREAMER", badge: "Entry", color: "var(--muted2)", bg: "rgba(255,255,255,0.05)", desc: "Individual creators, indie devs, content makers. Full access to NOIZYVOX voice profiles with personal commercial licence." },
  { name: "STUDIO", badge: "Commercial", color: "var(--gold)", bg: "var(--gold-g)", desc: "Game studios, audiobook publishers, ad agencies. Enterprise API access with bulk inference pricing and priority queue." },
  { name: "CLINICAL", badge: "Medical", color: "var(--teal)", bg: "var(--teal-g)", desc: "Hospitals, therapists, neuro-wearable partners. NOIZKIDZ ring-fenced access. Regulated Audio-Ceutical profiles. Dr. B consultation included." },
  { name: "GUILD", badge: "Artist", color: "var(--violet)", bg: "var(--violet-g)", desc: "Voice artists onboarding their identity. Access to DreamChamber intake ritual. Consent architecture customization. 75% perpetual split activated." },
];

const DC_LAWS = [
  { n: "I", title: "No Restrictions", desc: "Inside the DreamChamber, thought is unlimited. No technical constraints. No corporate rules. No physics. Pure intent drives creation." },
  { n: "II", title: "Artist First", desc: "The AI is the amplifier, not the author. Every model, every frequency, every inference exists because a human chose to create. The soul comes first." },
  { n: "III", title: "Consent Is Architecture", desc: "Consent isn't a Terms of Service. It is mathematically woven into the model at genesis. The AI literally cannot violate it. Non-negotiable. Forever." },
];

const DC_PHASES = [
  { icon: "🎙️", n: "PHASE 01", title: "CLAIM", desc: "Voice submitted. Consent terms defined. Model genesis locked permanently." },
  { icon: "🧬", n: "PHASE 02", title: "BUILD", desc: "Identity layered: emotion, style, cadence, breath, soul." },
  { icon: "📡", n: "PHASE 03", title: "SIGNAL", desc: "Model goes live. Signal intelligence feeds data back to artist." },
  { icon: "💰", n: "PHASE 04", title: "EARN", desc: "75% per inference. Real-time. Compounding. Forever." },
  { icon: "♾️", n: "PHASE 05", title: "EVOLVE", desc: "Model learns. Artist's voice grows more valuable with every use." },
];

const SA_DEVICES = [
  {
    icon: "🩹", name: "Mastoid Patch", tag: "Vagus Nerve Activator", color: "var(--rose)",
    desc: "Applied behind the ear on the mastoid bone. Micro-haptic bone-conduction transducer vibrates at 40–100 Hz, directly stimulating vagus nerve pathways without entering the ear canal.",
    specs: [
      ["Target Nerves", "Cranial VII & VIII + Vagus"],
      ["Frequency Range", "40–100 Hz haptic vibration"],
      ["Activation", "Auto via biometric spike or manual tap"],
      ["Use Cases", "PTSD flashback, panic attack, autism meltdown"],
      ["Form Factor", "Ultra-thin patch, skin-tone flexible substrate"],
      ["Data", "100% local edge-compute, zero cloud upload"],
    ],
  },
  {
    icon: "🎧", name: "Neural Earbuds", tag: "Closed-Loop EEG + ANC", color: "var(--violet)",
    desc: "Active Noise Cancellation mutes sensory triggers while internal speakers deliver bespoke NOIZYVOX neuro-acoustic profiles. EEG sensors read brainwaves in real-time from inside the ear canal.",
    specs: [
      ["EEG Resolution", "4-channel in-ear brainwave monitoring"],
      ["ANC Profile", "Polyvagal-tuned — removes threat frequencies only"],
      ["Entrainment", "Live binaural beat injection beneath voice layer"],
      ["Sleep Mode", "Delta-wave descent + Guardian night protection"],
      ["Processing", "On-device edge AI — works fully offline"],
      ["Wake Protocol", "Circadian ramp — no jarring alarm cortisol"],
    ],
  },
];

const ROADMAP = [
  { year: "2026", title: "Prototype & Clinical Partnership", desc: "Mastoid Patch prototype with Dr. B research team. NOIZKIDZ Sleepy Time Stories beta. NOIZYVOX Guild opens to founding artists." },
  { year: "2027", title: "Health Canada Class II Submission", desc: "Audio-Ceutical clinical trial begins. Neural Earbuds consumer launch. NOIZYFISH 20-language rollout. First hospital DreamChamber installation." },
  { year: "2028", title: "Global Medical Licensing", desc: "FDA approval. AAA game studio partnerships. NOIZKIDZ in 500+ pediatric clinics. The Benoit Institute AI Professor portal launches publicly." },
  { year: "2029", title: "Biospheric Integration", desc: "Smart-city acoustic architecture licensing begins. 1M+ daily artist inferences. NOIZY.ai becomes the world's first Artist-owned medical AI infrastructure." },
];

const GOV_ITEMS = [
  { icon: "🗳️", name: "Guild Vote", desc: "Artists vote on platform policy changes, new licence types, and ethical boundaries." },
  { icon: "⚖️", name: "Collective Bargain", desc: "Enterprise clients negotiate with the Guild, not a corporate sales team." },
  { icon: "🛡️", name: "Use Whitelist", desc: "Each artist sets their own approved sectors. Block political ads, violence, adult content independently." },
  { icon: "🔍", name: "Acoustic Hunter", desc: "AI crawler scans the internet 24/7 for unauthorized use. Auto-issues DMCA + royalty invoice." },
];

const VDNA_LAYERS = [
  {
    n: "01", name: "Voice DNA", icon: "🧬", color: "var(--gold)",
    desc: "The biometric fingerprint. Nine parameters that make a human voice irreducible — impossible to fully synthesize without the human.",
    params: ["Tonal Range", "Harmonic Fingerprint", "Breath Signature", "Pacing Pattern", "Emotional Modulation", "Vocal Fatigue Curve", "Whisper Capability", "Scream Ceiling", "Micro Vibrato"]
  },
  {
    n: "02", name: "Dialect Intelligence", icon: "🗺️", color: "var(--teal)",
    desc: "IPA-precision phonetic mapping. Not just accent — the micro-regional stress patterns and rhythm timing Hollywood cannot fake.",
    params: ["IPA Pronunciation", "Stress Patterns", "Vowel Shifts", "Consonant Weakening", "Rhythm Timing", "Regional Micro-Variance", "Prosodic Signature"]
  },
  {
    n: "03", name: "Social Speech Modes", icon: "🎭", color: "var(--violet)",
    desc: "One actor becomes 20+ deployable voices. Context-aware delivery for every human social register.",
    params: ["Professional", "Casual", "Street", "Intimate", "Storytelling", "Teaching", "Podcast", "Narration", "Command", "Comfort"]
  },
  {
    n: "04", name: "Emotional Engine", icon: "❤️‍🔥", color: "var(--rose)",
    desc: "Full emotional arc spectrums. Not just happy or sad — the complete gradient of human feeling, dynamically blendable.",
    params: ["Joy Spectrum", "Sadness Arc", "Anger Escalation", "Fear Reactions", "Laughter Taxonomy", "Whisper Intimacy", "Sarcasm Layer", "Grief", "Wonder"]
  },
  {
    n: "05", name: "Character Archetypes", icon: "🎪", color: "var(--sky)",
    desc: "IP-ownable voice characters. Each a licensable asset with emotion presets, dialect packs, and personality traits.",
    params: ["Detective", "Villain", "Hero", "Therapist", "Teacher", "Robot", "Wizard", "Comedian", "Narrator", "News Anchor"]
  },
  {
    n: "06", name: "Cultural Intelligence", icon: "🌍", color: "var(--gold2)",
    desc: "Communication style rules that make AI speech feel genuinely rooted in a culture — not just translated into it.",
    params: ["American Directness", "Japanese Restraint", "French Rhythm", "Québécois Warmth", "Latin Expressiveness", "British Understatement", "Arabic Formality"]
  },
  {
    n: "07", name: "Sound Environment", icon: "🔊", color: "var(--teal2)",
    desc: "Voices paired with acoustic worlds. Characters arrive with their complete sonic universe — not just words.",
    params: ["Room Tone", "Ambience Layer", "Foley Signature", "Spatial Position", "Reverb Character", "ASMR Architecture", "Dynamic Envelope"]
  },
];

const ACTOR_MATH = [
  { label: "Base Voice", n: 1, color: "var(--gold)" },
  { label: "× Dialects", n: 5, color: "var(--teal)" },
  { label: "× Characters", n: 10, color: "var(--violet)" },
  { label: "× Emotional Packs", n: 5, color: "var(--rose)" },
  { label: "Voice Assets", n: 250, color: "var(--gold)", big: true },
];

const DIALECT_REGIONS = [
  { region: "English — North America", color: "var(--sky)", dialects: ["Toronto", "Montréal", "NYC", "Boston", "Midwest", "Texas", "California", "Vancouver"] },
  { region: "French", color: "var(--teal)", dialects: ["Paris", "Québec", "Acadian", "Belgian", "Swiss", "Louisiana", "African French"] },
  { region: "Spanish", color: "var(--gold)", dialects: ["Spain (distinción)", "Mexico", "Argentina", "Caribbean", "Colombian", "Chilean"] },
  { region: "Arabic", color: "var(--rose)", dialects: ["Modern Standard", "Egyptian", "Levantine", "Gulf", "Moroccan", "Iraqi"] },
];

const ARCHETYPES = [
  { icon: "🕵️", name: "Detective", tags: ["Gravelly", "Noir", "Authority"] },
  { icon: "🦹", name: "Villain", tags: ["Menacing", "Silk", "Deliberate"] },
  { icon: "⚔️", name: "Hero", tags: ["Clear", "Resolved", "Warm"] },
  { icon: "🧘", name: "Therapist", tags: ["Soft", "Paced", "Safe"] },
  { icon: "📚", name: "Teacher", tags: ["Measured", "Precise", "Curious"] },
  { icon: "🤖", name: "Robot", tags: ["Clipped", "Clean", "Alien"] },
  { icon: "🧙", name: "Wizard", tags: ["Ancient", "Resonant", "Knowing"] },
  { icon: "🎤", name: "Comedian", tags: ["Elastic", "Timing", "Sharp"] },
  { icon: "📻", name: "Narrator", tags: ["Velvet", "Distance", "Trust"] },
  { icon: "📡", name: "Anchor", tags: ["Authoritative", "Neutral", "Crisp"] },
];

const MANIFESTO_BOUNDARIES = [
  {
    tier: "Hard Boundary", dotColor: "var(--rose)", bg: "rgba(255,64,96,0.05)", border: "rgba(255,64,96,0.2)",
    label: "AUTO-REJECT",
    items: ["No racist, sexist, or hateful content", "No pornographic use", "No impersonation of real public figures", "No content that glorifies violence against civilians"],
  },
  {
    tier: "Conditional Boundary", dotColor: "var(--gold)", bg: "rgba(232,160,32,0.05)", border: "rgba(232,160,32,0.2)",
    label: "ARTIST REVIEW",
    items: ["Complex villains — full script required first", "Political content — anti-authoritarian themes only", "Children's content — manual approval each time", "Medical/therapeutic use — clinical context required"],
  },
  {
    tier: "Open Territory", dotColor: "var(--teal)", bg: "rgba(15,184,160,0.05)", border: "rgba(15,184,160,0.2)",
    label: "AUTO-APPROVE",
    items: ["Narrative games with moral complexity", "Audiobook memoirs and personal stories", "Therapeutic voice content (NOIZKIDZ, clinical)", "Indie film and documentary narration"],
  },
];

const TRAFFIC_STATS = [
  { color: "#22c55e", bg: "rgba(34,197,94,0.08)", label: "Scripts approved automatically", count: "847" },
  { color: "var(--gold)", bg: "rgba(232,160,32,0.08)", label: "Pending your review", count: "12" },
  { color: "var(--rose)", bg: "rgba(255,64,96,0.08)", label: "Blocked — values protected", count: "63" },
];

const LINEAGE_EXAMPLES = [
  { combo: "Shohreh Aghdashloo meets raw punk energy", niche: "Morally complex antagonists · Narrative games · Gritty fiction" },
  { combo: "James Earl Jones if raised in New Orleans jazz", niche: "Epic narration · Premium audiobooks · Documentary" },
  { combo: "Joanna Lumley with West African rhythm", niche: "Luxury brand · Sophisticated thriller · Cultural prestige" },
  { combo: "Lauren Bacall grew up in Berlin techno scene", niche: "Femme fatale · Noir games · Avant-garde film" },
];

const EQUITY_STEPS = [
  { n: 1, title: "First 10 uses", desc: "Sonic dataset expanded. More emotional modes captured from real-world performance contexts." },
  { n: 2, title: "First 50 uses", desc: "Portfolio validated. System surfaces artist for similar projects automatically." },
  { n: 3, title: "First 100 uses", desc: "Niche authority established. Search ranking increases. Premium rate justified." },
  { n: 4, title: "Beyond 100", desc: "Creative equity compounds. Artist referenced by name in client pitches. Legacy asset status." },
];

const DISCOVERY_RESULTS = [
  { name: "Artist 7A", combo: "Aghdashloo + punk energy", tags: ["Moral Ambiguity", "Trauma", "Villain", "Indie Game"] },
  { name: "Artist 12C", combo: "Bacall + Berlin techno", tags: ["Noir", "Femme Fatale", "Thriller", "Avant-garde"] },
  { name: "Artist 3F", combo: "Lumley + West African rhythm", tags: ["Authority", "Prestige", "Documentary", "Luxury"] },
];

const TABS = [
  { id: "eco", label: "Ecosystem" },
  { id: "drb", label: "Dr. B — AI Prof" },
  { id: "dc", label: "DreamChamber" },
  { id: "ns", label: "Neuro-Science" },
  { id: "guild", label: "The Guild" },
  { id: "sa", label: "Sonic Aids" },
  { id: "vdna", label: "Voice DNA" },
  { id: "manifesto", label: "Artist Manifesto" },
  { id: "arch", label: "Architecture" },
];

export default function NOIZYSystem() {
  const [tab, setTab] = useState("eco");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <style>{G}</style>
      <div className="scan-line" />
      <div className="root">

        {/* HEADER */}
        <header className="hdr">
          <div>
            <div className="hdr-brand">
              <span className="hdr-n">N</span>
              <span className="hdr-oizy">OIZY</span>
              <span className="hdr-ai">.AI</span>
            </div>
            <div className="hdr-tag">Future of Fair Performance AI</div>
          </div>
          <div className="hdr-right">
            <div className="hdr-pill">NOIZYVOX · NOIZYFISH · NOIZKIDZ</div>
            <div className="hdr-pill live pulse">● SYSTEM LIVE</div>
          </div>
        </header>

        {/* HERO */}
        <div className="hero">
          <div className="hero-pre">The Architecture of Fair AI</div>
          <h1 className="hero-h1">
            The Artist<br />
            <em>is</em> the <strong>Platform.</strong>
          </h1>
          <p className="hero-sub">
            Four brands. One manifesto. Zero compromise.<br />
            <b>Consent-locked. Creator-owned. Recurring forever.</b><br />
            ElevenLabs gives you scale without identity.<br />
            NOIZY gives you identity at scale.
          </p>
          <div className="wave">
            {WAVES.map((h, i) => (
              <div key={i} className="wb"
                style={{ height: `${h}px`, animationDelay: `${i * 0.065}s`, opacity: mounted ? undefined : 0.15 }} />
            ))}
          </div>
        </div>

        {/* STATS */}
        <div className="stats" style={{ maxWidth: 1160, margin: '0 auto 36px' }}>
          {[
            { v: "75%", l: "Artist Revenue Share", c: "var(--gold)" },
            { v: "4", l: "Brand Pillars", c: "var(--teal)" },
            { v: "∞", l: "Recurring Per Inference", c: "var(--violet)" },
            { v: "100%", l: "Consent Architecture", c: "var(--sky)" },
            { v: "Dr. B", l: "World's First AI Professor", c: "var(--rose)" },
          ].map((s, i) => (
            <div className="stat" key={i}>
              <div className="stat-v" style={{ color: s.c }}>{s.v}</div>
              <div className="stat-l">{s.l}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="tabs">
          {TABS.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? "on" : "off"}`}
              onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="con">

          {/* ══ ECOSYSTEM ══ */}
          {tab === "eco" && (
            <>
              {/* THREE PRIMAL FREQUENCIES */}
              <div className="sec-title">The Three Primal Frequencies — Why NOIZY Exists</div>
              <div className="freq3-wrap">
                {[
                  {
                    num: "Frequency I", hz: "ƒ¹", name: "The Human Signal",
                    color: "var(--gold)", glow: "rgba(232,160,32,0.08)",
                    body: "Every voice in the NOIZY vault started as a living human being — performing in real time, with full consent. Not generated. Not averaged. Not scraped. Sourced. In a world of synthetic slop, we are the only frequency that carries a human heartbeat.",
                    truth: "Our AI sounds human because a human is actually there."
                  },
                  {
                    num: "Frequency II", hz: "ƒ²", name: "The Consent Architecture",
                    color: "var(--teal)", glow: "rgba(15,184,160,0.08)",
                    body: "Consent isn't a checkbox on NOIZY. It is mathematically woven into the model at genesis. The AI cannot violate the artist's terms — not because of a policy, because of physics. In an industry built on extraction, we built the infrastructure of permission.",
                    truth: "Fair Trade Intelligence. Clean source. Zero legal noise."
                  },
                  {
                    num: "Frequency III", hz: "ƒ³", name: "The Perpetual Royalty",
                    color: "var(--violet)", glow: "rgba(176,96,255,0.08)",
                    body: "Every time a NOIZY voice speaks — in a game, a clinical session, a story told to a child at 3am — 75% flows back to the human who provided the soul. Not once. Not for a year. Forever. The estate earns. The legacy compounds. Being human becomes the most valuable economic position in the AI era.",
                    truth: "Symbiotic wealth. The Royalties of Reality."
                  },
                ].map((f, i) => (
                  <div key={i} className="freq3-card" style={{ background: `linear-gradient(160deg,${f.glow},var(--card) 60%)` }}>
                    <div className="freq3-num" style={{ color: f.color }}>{f.num}</div>
                    <div className="freq3-hz" style={{ color: f.color }}>{f.hz}</div>
                    <div className="freq3-name" style={{ color: f.color }}>{f.name}</div>
                    <div className="freq3-body">{f.body}</div>
                    <div className="freq3-truth" style={{ color: f.color, borderLeft: `2px solid ${f.color}`, paddingLeft: 14 }}
                    >{f.truth}</div>
                  </div>
                ))}
              </div>

              {/* FUTURE DIRECTIONS */}
              <div className="sec-title">What Gets Built Next — The Horizon</div>
              <div className="future-grid">
                <div className="future-card" style={{ borderColor: "rgba(232,160,32,0.25)" }}>
                  <div className="future-icon">🏺</div>
                  <div className="future-name" style={{ color: "var(--gold)" }}>Ancestral Echo Engine</div>
                  <div className="future-tag" style={{ color: "var(--gold)" }}>500-Year Restoration Initiative</div>
                  <div className="future-desc">We take the fragmented noise of history — crackly 1920s recordings, family cassettes, lost dialects recorded once and never again — and denoise them using Human-DNA algorithms. Not simulation. Restoration. We give a voice back to the silenced. A sound bridge connecting the 20th, 21st, and 26th centuries.</div>
                </div>
                <div className="future-card" style={{ borderColor: "rgba(15,184,160,0.25)" }}>
                  <div className="future-icon">🫀</div>
                  <div className="future-name" style={{ color: "var(--teal)" }}>Sentient Sympathy Layer</div>
                  <div className="future-tag" style={{ color: "var(--teal)" }}>Bio-Resonant Real-Time Interface</div>
                  <div className="future-desc">Using live biometric data — heart rate variability, skin conductance, pupil response — NOIZYVOX adjusts vocal frequency in real time. If a user is in crisis, the AI doesn't just talk. It deploys the scientifically-proven calming frequencies of a human Protector voice to physically lower cortisol. Sanity, biologically restored.</div>
                </div>
              </div>

              <div className="sec-title">Four Brands · One Manifesto</div>
              <div className="eco-grid">
                {ECOSYS.map(e => (
                  <div key={e.id} className="eco-card" style={{ "--card-accent": e.color }}>
                    <div className="eco-head" style={{ background: `linear-gradient(135deg,${e.glow},transparent)` }}>
                      <div className="eco-icon">{e.icon}</div>
                      <div className="eco-name" style={{ color: e.color }}>{e.name}</div>
                      <div className="eco-tag" style={{ color: e.color, opacity: 0.7 }}>{e.tag}</div>
                    </div>
                    <div className="eco-body">
                      <p className="eco-desc">{e.desc}</p>
                      <div className="eco-feats">
                        {e.feats.map((f, i) => (
                          <div key={i} className="eco-feat">
                            <div className="eco-dot" style={{ background: e.color }} />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="eco-bottom">
                      <div className="eco-metric">
                        <div className="eco-m-label">{e.metric}</div>
                        <div className="eco-m-val" style={{ color: e.color }}>{e.metricVal}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                background: "var(--card)", border: "1px solid var(--border2)", borderRadius: 14, padding: 28,
                background: "linear-gradient(135deg,rgba(232,160,32,0.05),rgba(15,184,160,0.03))"
              }}>
                <div style={{
                  fontFamily: "var(--serif)", fontSize: 28, fontWeight: 300, color: "#fff",
                  textAlign: "center", letterSpacing: -0.5, marginBottom: 12
                }}>
                  Generic voices won't earn <em style={{ color: "var(--gold)" }}>much.</em>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted2)", textAlign: "center", lineHeight: 2, maxWidth: 580, margin: "0 auto" }}>
                  That one sentence is the entire NOIZYVOX pitch to VSI, to Norman Dawood, to every game studio.<br />
                  ElevenLabs gives you <span style={{ color: "var(--rose)" }}>scale without identity</span>.
                  NOIZY gives you <span style={{ color: "var(--gold)" }}>identity at scale.</span>
                </div>
              </div>
            </>
          )}

          {/* ══ DR. B ══ */}
          {tab === "drb" && (
            <>
              <div className="sec-title">Dr. B — World's First AI Professor of Neuro-Acoustics</div>
              <div className="drb-layout">
                <div className="drb-profile">
                  <div className="drb-avatar">🧠</div>
                  <div className="drb-name">Dr. Brien G. Benoit</div>
                  <div className="drb-role">AI Professor · Chief Research Partner</div>
                  <div className="drb-creds">
                    {[
                      "Chief of Neurosurgery, Ottawa Civic Hospital",
                      "Professor, University of Ottawa Faculty of Medicine",
                      "Chair, Patented Medicine Prices Review Board (PMPRB), Health Canada",
                      "Specialist: Acoustic Neuroma, Spinal Tumors, Cranial Nerve Surgery",
                    ].map((c, i) => <div key={i} className="drb-cred">{c}</div>)}
                  </div>
                  <div className="drb-status">● ACTIVE RESEARCH PARTNER</div>
                </div>
                <div className="drb-right">
                  <div className="drb-questions">
                    <div className="drb-q-title">Unanswered Questions — Now Answered</div>
                    {DRB_QUESTIONS.map((q, i) => (
                      <div key={i} className="drb-q">
                        <div className="drb-q-n">{q.n}</div>
                        <div className="drb-q-text">"{q.q}"</div>
                        <div className="drb-q-answer" dangerouslySetInnerHTML={{ __html: q.a }} />
                      </div>
                    ))}
                  </div>
                  <div className="drb-console">
                    <div className="drb-console-title">DreamChamber Console — Dr. B Interface</div>
                    <div className="drb-console-box">
                      {[
                        ["ROB", "Diagnose the acoustic profile for a PTSD panic attack intervention."],
                        ["DR.B", "Amygdala hyper-arousal + prefrontal suppression. Deploy <b>6 Hz Theta binaural</b> beneath 85 Hz ASMR vocal anchor. Vagus nerve stimulation should begin within 90 seconds."],
                        ["ROB", "Target condition for first clinical trial?"],
                        ["DR.B", "Combat veteran PTSD. Most measurable. Fastest regulatory path. Greatest societal ROI. <b>EEG proof within 60 seconds of intervention.</b>"],
                      ].map((l, i) => (
                        <div key={i} className="drb-line" style={{ marginBottom: 10 }}>
                          <span className="drb-prompt">{l[0]} ›</span>
                          <span className="drb-out" dangerouslySetInnerHTML={{ __html: l[1] }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{
                background: "var(--card)", border: "1px solid rgba(15,184,160,0.3)", borderRadius: 14, padding: 28,
                background: "linear-gradient(135deg,rgba(15,184,160,0.06),transparent)"
              }}>
                <div style={{ fontSize: 10, color: "var(--teal)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>The Benoit Institute — Coming 2028</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "#fff", marginBottom: 10 }}>
                  The World's First AI Medical Mentor
                </div>
                <div style={{ fontSize: 11, color: "var(--muted2)", lineHeight: 2, maxWidth: 680 }}>
                  Medical students, sound engineers, and neuroscientists worldwide will consult Dr. B directly. Present a complex trauma case — receive the exact NOIZYVOX Audio-Ceutical prescription. Dr. Benoit's clinical mastery continues to teach, research, and heal — forever. The artist provides the soul. Dr. B provides the coordinates.
                </div>
              </div>
            </>
          )}

          {/* ══ DREAMCHAMBER ══ */}
          {tab === "dc" && (
            <>
              <div className="sec-title">The DreamChamber — No Restrictions · No Limits</div>
              <div className="dc-hero">
                <div className="dc-hero-title">
                  When we are in the DreamChamber,<br />
                  <strong>we think without limits.</strong>
                </div>
                <p className="dc-hero-sub">
                  The DreamChamber is not a recording booth. It is not software. It is an extension of consciousness — the space where human intent and AI execution become a single creative organism. You bring the soul. The machine builds the architecture around it.
                </p>
              </div>
              <div className="dc-laws">
                {DC_LAWS.map((l, i) => (
                  <div key={i} className="dc-law">
                    <div className="dc-law-num" style={{ color: "var(--gold)", opacity: 0.3 }}>LAW {l.n}</div>
                    <div className="dc-law-title">{l.title}</div>
                    <div className="dc-law-desc">{l.desc}</div>
                  </div>
                ))}
              </div>
              <div className="sec-title">Artist Journey Through the Chamber</div>
              <div className="dc-phases">
                {DC_PHASES.map((p, i) => (
                  <div key={i} className="dc-phase">
                    <div className="dc-phase-icon">{p.icon}</div>
                    <div className="dc-phase-n" style={{ color: "var(--gold)" }}>{p.n}</div>
                    <div className="dc-phase-title">{p.title}</div>
                    <div className="dc-phase-desc">{p.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, padding: 28, background: "var(--card)", border: "1px solid var(--border2)", borderRadius: 14 }}>
                <div style={{ fontSize: 10, color: "var(--gold)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>The Human-AI Complete Partnership Equation</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr", alignItems: "center", gap: 16 }}>
                  {[
                    { label: "Human Intention", sub: "NOIZY.ai", color: "var(--gold)" },
                    { label: "+", sub: "", color: "var(--muted)" },
                    { label: "Emotional Execution", sub: "NOIZYVOX", color: "var(--teal)" },
                    { label: "+", sub: "", color: "var(--muted)" },
                    { label: "Infinite Reach", sub: "NOIZYFISH", color: "var(--sky)" },
                    { label: "+", sub: "", color: "var(--muted)" },
                    { label: "Generational Protection", sub: "NOIZKIDZ", color: "var(--violet)" },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{
                        fontFamily: "var(--serif)", fontSize: i % 2 === 1 ? 28 : 16, fontWeight: 700,
                        color: item.color, marginBottom: 4
                      }}>{item.label}</div>
                      {item.sub && <div style={{ fontSize: 9, color: "var(--muted)", letterSpacing: 2 }}>{item.sub}</div>}
                    </div>
                  ))}
                </div>
                <div style={{
                  textAlign: "center", marginTop: 20, padding: "16px", background: "rgba(232,160,32,0.06)", borderRadius: 8,
                  fontFamily: "var(--serif)", fontSize: 20, color: "var(--gold)"
                }}>
                  = Unbound Creation
                </div>
              </div>
            </>
          )}

          {/* ══ NEURO-SCIENCE ══ */}
          {tab === "ns" && (
            <>
              <div className="sec-title">Neuro-Acoustic Science — The Physics of Healing</div>
              <div className="ns-grid">
                <div className="ns-card">
                  <div className="ns-card-title" style={{ color: "var(--violet)" }}>Brainwave Frequency Map</div>
                  {FREQS.map((f, i) => (
                    <div key={i} className="freq-item">
                      <div className="freq-label">
                        <span className="freq-name">{f.name}</span>
                        <span className="freq-hz" style={{ color: f.color }}>{f.hz}</span>
                      </div>
                      <div className="freq-bar-bg">
                        <div className="freq-bar-fill" style={{ width: `${f.pct}%`, background: f.color }} />
                      </div>
                      <div className="freq-desc">{f.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="ns-card">
                  <div className="ns-card-title" style={{ color: "var(--teal)" }}>Polyvagal Theory — Safety Signal Chain</div>
                  {[
                    { step: "01", title: "Environmental Sound Scan", desc: "Nervous system continuously scans acoustic environment for threat or safety cues 24/7." },
                    { step: "02", title: "Frequency Recognition", desc: "Low-frequency warmth (80–150 Hz) signals biological proximity to a calm human — safe." },
                    { step: "03", title: "Vagus Nerve Activation", desc: "Sound physically vibrates vagus nerve. Parasympathetic 'rest & digest' state activated." },
                    { step: "04", title: "Social Engagement Mode", desc: "Heart rate drops. Cortisol falls. Child enters state of openness — learning, bonding, healing." },
                    { step: "05", title: "NOIZYVOX Locks In", desc: "Artist's voice maintains the state. Biometric loop keeps nervous system calibrated." },
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, color: "var(--border2)", flexShrink: 0 }}>{s.step}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{s.title}</div>
                        <div style={{ fontSize: 11, color: "var(--muted2)", lineHeight: 1.7 }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="ns-card ns-full">
                  <div className="ns-card-title" style={{ color: "var(--gold)" }}>ASMR Frequency Architecture — DreamChamber Blueprint</div>
                  <div className="ns-asmr">
                    {ASMR_FREQS.map((a, i) => (
                      <div key={i} className="asmr-card">
                        <div className="asmr-freq">{a.hz}</div>
                        <div className="asmr-name">{a.name}</div>
                        <div className="asmr-desc">{a.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ background: "var(--card)", border: "1px solid rgba(232,160,32,0.25)", borderRadius: 14, padding: 28 }}>
                <div style={{ fontSize: 10, color: "var(--gold)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>The Living Track — .NOIZY Format</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "#fff", marginBottom: 10 }}>Static MP3 (ElevenLabs / Audible)</div>
                    <div style={{ fontSize: 11, color: "var(--muted2)", lineHeight: 2 }}>
                      Recorded once. Locked forever. Plays the same for every listener in every state. No intelligence. No adaptation. A dead artifact.
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--gold)", marginBottom: 10 }}>Living Track (.NOIZY Format)</div>
                    <div style={{ fontSize: 11, color: "var(--muted2)", lineHeight: 2 }}>
                      Sonic DNA strand. Reads listener's biometric state in real-time. Dynamically restructures tempo, frequency, and spatial audio to match their exact neurological need — millions of versions, one artistic soul.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══ GUILD ══ */}
          {tab === "guild" && (
            <>
              <div className="sec-title">The NOIZYVOX Artist Guild — Economics & Governance</div>
              <div className="guild-layout">
                <div className="guild-economy">
                  <div className="guild-e-title">Revenue Architecture</div>
                  <div className="split-visual">
                    <div className="split-artist" style={{ flex: 75 }} />
                    <div className="split-noizy" style={{ flex: 25 }} />
                  </div>
                  <div className="split-labels">
                    <div className="split-lbl" style={{ color: "var(--gold)" }}>75% — Artist · Forever</div>
                    <div className="split-lbl" style={{ color: "var(--muted)" }}>25% — NOIZY.ai</div>
                  </div>
                  <div className="guild-streams">
                    {[
                      { n: "Per-Inference Royalty", v: "75% auto-routed" },
                      { n: "Enterprise Licensing", v: "Artist-set rates" },
                      { n: "NOIZYFISH Translation", v: "75% per language" },
                      { n: "Clinical / Medical Tier", v: "Premium multiplier" },
                      { n: "Biometric Healing Event", v: "Value-based bonus" },
                      { n: "Legacy Royalty (posthumous)", v: "Estate maintains 75%" },
                    ].map((s, i) => (
                      <div key={i} className="guild-stream">
                        <span className="gs-name">{s.n}</span>
                        <span className="gs-val">{s.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="guild-tiers">
                  <div className="guild-t-title">Access Tiers</div>
                  {TIERS.map((t, i) => (
                    <div key={i} className="tier" style={{ background: t.bg, borderColor: `${t.color}40` }}>
                      <div className="tier-head">
                        <span className="tier-name">{t.name}</span>
                        <span className="tier-badge" style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}50` }}>{t.badge}</span>
                      </div>
                      <div className="tier-desc">{t.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="guild-governance">
                  <div className="gov-title">Guild Governance — Artists Run the Platform</div>
                  <div className="gov-grid">
                    {GOV_ITEMS.map((g, i) => (
                      <div key={i} className="gov-item">
                        <div className="gov-icon">{g.icon}</div>
                        <div className="gov-name">{g.name}</div>
                        <div className="gov-desc">{g.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══ SONIC AIDS ══ */}
          {tab === "sa" && (
            <>
              <div className="sec-title">Sonic Aids — Audio-Ceutical Medical Devices</div>
              <div className="sa-devices">
                {SA_DEVICES.map((d, i) => (
                  <div key={i} className="sa-device">
                    <div className="sa-device-head" style={{ background: `linear-gradient(135deg,${d.color}12,transparent)` }}>
                      <div className="sa-device-icon">{d.icon}</div>
                      <div className="sa-device-name" style={{ color: d.color }}>{d.name}</div>
                      <div className="sa-device-tag" style={{ color: d.color, opacity: 0.7 }}>{d.tag}</div>
                    </div>
                    <div className="sa-device-body">
                      <p className="sa-device-desc">{d.desc}</p>
                      <div className="sa-specs">
                        {d.specs.map((s, j) => (
                          <div key={j} className="sa-spec">
                            <span className="sa-spec-k">{s[0]}</span>
                            <span className="sa-spec-v">{s[1]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="sa-roadmap">
                <div className="sa-rm-title">3-Year Clinical Roadmap — The Benoit-NOIZY Protocol</div>
                {ROADMAP.map((r, i) => (
                  <div key={i} className="rm-item">
                    <div className="rm-year">{r.year}</div>
                    <div>
                      <div className="rm-content-title">{r.title}</div>
                      <div className="rm-content-desc">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 20, padding: 28, background: "linear-gradient(135deg,rgba(255,64,96,0.06),rgba(176,96,255,0.06))",
                border: "1px solid rgba(255,64,96,0.25)", borderRadius: 14, textAlign: "center"
              }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 26, color: "#fff", marginBottom: 10, fontWeight: 300 }}>
                  Replacing <em style={{ color: "var(--rose)" }}>chemical sedatives</em> with{" "}
                  <strong style={{ color: "var(--gold)" }}>algorithmic empathy.</strong>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted2)", lineHeight: 2, maxWidth: 600, margin: "0 auto" }}>
                  Dr. Benoit mapped the hardware of the human brain.<br />
                  NOIZY.ai builds the software to run on it.<br />
                  The Artist provides the soul that makes it medicine.
                </div>
              </div>
            </>
          )}

          {/* ══ VOICE DNA ══ */}
          {tab === "vdna" && (
            <>
              <div className="sec-title">Voice DNA — The 7-Layer Intelligence Architecture</div>

              {/* 7 Layers */}
              {VDNA_LAYERS.map((l, i) => (
                <div key={i} className="vdna-layer" style={{ border: `1px solid ${l.color}22` }}>
                  <div className="vdna-layer-side" style={{ background: `linear-gradient(135deg,${l.color}10,transparent)` }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>{l.icon}</div>
                    <div className="vdna-layer-num" style={{ color: l.color }}>LAYER {l.n}</div>
                    <div className="vdna-layer-name">{l.name}</div>
                  </div>
                  <div className="vdna-layer-body">
                    <div className="vdna-layer-desc">{l.desc}</div>
                    <div className="vdna-params">
                      {l.params.map((p, j) => (
                        <span key={j} className="vdna-param"
                          style={{ background: `${l.color}12`, border: `1px solid ${l.color}30`, color: l.color }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Actor Economy */}
              <div style={{ background: "var(--card)", border: "1px solid var(--border2)", borderRadius: 14, padding: 28, marginTop: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: "var(--gold)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 24 }}>The Actor Economy — 1 Voice × Infinite Assets</div>
                <div className="actor-math">
                  {ACTOR_MATH.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className={`actor-block${a.big ? " big" : ""}`}
                        style={{ background: a.big ? "var(--gold-g)" : "rgba(255,255,255,0.03)", border: `1px solid ${a.color}40`, borderRadius: 12 }}>
                        <div className="actor-n" style={{ fontSize: a.big ? 42 : 24, color: a.color }}>{a.n}</div>
                        <div className="actor-lbl">{a.label}</div>
                      </div>
                      {i < ACTOR_MATH.length - 2 && <span className="actor-op">×</span>}
                      {i === ACTOR_MATH.length - 2 && <span className="actor-op">=</span>}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted2)", lineHeight: 2, maxWidth: 680 }}>
                  A single voice actor onboarding into the DreamChamber doesn't upload <em>one</em> voice.
                  They architect a <span style={{ color: "var(--gold)" }}>portfolio of 250+ individually licensable assets</span> —
                  each earning royalties independently, simultaneously, forever. They don't get replaced by AI.
                  They <span style={{ color: "var(--teal)" }}>become the AI economy.</span>
                </div>
              </div>

              {/* Dialect Intelligence */}
              <div className="sec-title">Dialect Intelligence — Micro-Regional Precision</div>
              <div className="dialect-grid">
                {DIALECT_REGIONS.map((r, i) => (
                  <div key={i} className="dialect-card">
                    <div className="dialect-region" style={{ color: r.color }}>{r.region}</div>
                    <div className="dialect-chips">
                      {r.dialects.map((d, j) => (
                        <span key={j} className="dialect-chip"
                          style={{ background: `${r.color}10`, border: `1px solid ${r.color}25` }}>{d}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Character Archetypes */}
              <div className="sec-title">Character Archetypes — The AI Casting Agency</div>
              <div className="arch-grid">
                {ARCHETYPES.map((a, i) => (
                  <div key={i} className="arch-card">
                    <div className="arch-icon">{a.icon}</div>
                    <div className="arch-name">{a.name}</div>
                    {a.tags.map((t, j) => <span key={j} className="arch-tag">{t}</span>)}
                  </div>
                ))}
              </div>

              {/* Montreal Advantage */}
              <div style={{
                background: "linear-gradient(135deg,rgba(56,180,248,0.07),rgba(15,184,160,0.05))",
                border: "1px solid rgba(56,180,248,0.28)", borderRadius: 14, padding: 28
              }}>
                <div style={{ fontSize: 10, color: "var(--sky)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>🇨🇦 The Montréal Advantage</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 24, color: "#fff", marginBottom: 16, fontWeight: 300, lineHeight: 1.3 }}>
                  The world's most complex dialect dataset is already{" "}
                  <em style={{ color: "var(--sky)" }}>right outside your door.</em>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, fontSize: 11, color: "var(--muted2)", lineHeight: 2 }}>
                  <div>
                    Montréal is one of the most linguistically dense cities on Earth. English. Québécois French.
                    Haitian Creole. Arabic. Spanish. Italian. Mandarin. The most nuanced bilingual dialect shift
                    in the world happens on a <span style={{ color: "var(--sky)" }}>single city block</span>.
                  </div>
                  <div>
                    Your geography is a <span style={{ color: "var(--teal)" }}>natural moat</span>.
                    ElevenLabs cannot replicate it from San Francisco.
                    OpenAI cannot synthesize it from New York.
                    The world's most valuable voice dataset is being created daily by the people who live there.
                    <span style={{ color: "var(--gold)" }}>You capture it first.</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══ ACOUSTIC SHIELD ══ */}
          {tab === "shield" && (
            <>
              <div className="sec-title">Acoustic Shield — Invisible Tracking · Total Enforcement</div>

              {/* How it works */}
              <div className="shield-stack">
                {SHIELD_STEPS.map((s, i) => (
                  <div key={i} className="shield-row" style={{ borderColor: `${s.color}25` }}>
                    <div className="shield-step" style={{ color: s.color, opacity: 0.4 }}>{s.n}</div>
                    <div>
                      <div className="shield-label">{s.label}</div>
                      <div className="shield-detail">{s.detail}</div>
                    </div>
                    <div className="shield-badge"
                      style={{ background: `${s.color}15`, border: `1px solid ${s.color}40`, color: s.color }}>
                      {s.badge}
                    </div>
                  </div>
                ))}
              </div>

              {/* Crawler Network */}
              <div className="sec-title">Crawler Network — Global Platform Coverage</div>
              <div className="crawl-grid">
                {CRAWL_PLATFORMS.map((p, i) => (
                  <div key={i} className="crawl-card">
                    <div className="crawl-platform">{p.icon}</div>
                    <div className="crawl-name">{p.name}</div>
                    <div className="crawl-freq" style={{ color: p.color }}>{p.freq}</div>
                    <div className="crawl-bar-bg">
                      <div className="crawl-bar-fill" style={{ width: `${p.pct}%`, background: p.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Auto Response */}
              <div className="sec-title">Auto-Response Protocol — Detection to Enforcement</div>
              <div className="response-grid">
                {AUTO_RESPONSES.map((r, i) => (
                  <div key={i} className="response-card" style={{ border: `1px solid ${r.color}25`, background: `linear-gradient(135deg,${r.color}08,transparent)` }}>
                    <div className="response-icon">{r.icon}</div>
                    <div className="response-title" style={{ color: r.color }}>{r.title}</div>
                    <div className="response-desc">{r.desc}</div>
                  </div>
                ))}
              </div>

              {/* Manifesto */}
              <div style={{
                background: "linear-gradient(135deg,rgba(232,160,32,0.06),rgba(176,96,255,0.04))",
                border: "1px solid rgba(232,160,32,0.25)", borderRadius: 14, padding: 28
              }}>
                <div style={{ fontSize: 10, color: "var(--gold)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>The Core Principle</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 22, color: "#fff", marginBottom: 14, fontWeight: 300, lineHeight: 1.4 }}>
                  Your voice doesn't just live in the DreamChamber.
                  It carries its <em style={{ color: "var(--gold)" }}>ownership proof</em> with it
                  into every server, every platform, every render pipeline
                  it will ever touch — <strong>forever.</strong>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, fontSize: 11, color: "var(--muted2)", lineHeight: 2 }}>
                  <div><span style={{ color: "var(--teal)" }}>Invisible:</span> The watermark is imperceptible. No listener, no platform, no AI tool will ever know it's there — until they try to steal it.</div>
                  <div><span style={{ color: "var(--violet)" }}>Indestructible:</span> Re-encoding, pitch shifting, time-stretching, compression — none of it removes the spectral fingerprint. The signal survives.</div>
                  <div><span style={{ color: "var(--rose)" }}>Automatic:</span> No artist needs to file a DMCA manually. No lawyer needs to be on retainer. The system hunts, detects, invoices, and archives. You sleep. It works.</div>
                </div>
              </div>
            </>
          )}

          {/* ══ ARTIST MANIFESTO ══ */}
          {tab === "manifesto" && (
            <>
              <div className="sec-title">Artist Manifesto — Identity as Infrastructure</div>

              {/* Client Discovery Bar */}
              <div className="discovery-bar">
                <div className="db-title">Client Discovery Interface — Search by Artistic Vision</div>
                <div className="db-search">
                  <span className="db-icon">🔍</span>
                  <span className="db-query">"I need a voice that feels like Lauren Bacall if she grew up in a Berlin techno scene"</span>
                </div>
                <div className="db-results">
                  {DISCOVERY_RESULTS.map((r, i) => (
                    <div key={i} className="db-result">
                      <div className="db-result-name">{r.name}</div>
                      <div className="db-result-combo">{r.combo}</div>
                      <div className="db-result-tags">
                        {r.tags.map((t, j) => <span key={j} className="db-rt">{t}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mani-layout">
                {/* LEFT — Manifesto Builder */}
                <div className="mani-main">

                  {/* Creative Vision Block */}
                  <div className="mani-block">
                    <div className="mani-block-title" style={{ color: "var(--gold)" }}>Creative Vision Block — Discovery Metadata + Content Validator</div>
                    <div className="vision-box">
                      "I bring authenticity to characters navigating trauma and resilience. My specialty is the interior life — voices that carry weight, history, and moral complexity. I am not a generic narrator. I am a specific human perspective."
                    </div>
                    <div className="vision-tags">
                      {["Moral Complexity", "Trauma & Resilience", "Interior Life", "Narrative Games", "Audiobook Memoirs", "Therapeutic Content"].map((t, i) => (
                        <span key={i} className="vision-tag"
                          style={{ background: "var(--gold-g)", border: "1px solid rgba(232,160,32,0.3)", color: "var(--gold)" }}>{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* Boundary System */}
                  <div className="mani-block">
                    <div className="mani-block-title" style={{ color: "var(--rose)" }}>Consent at the Prompt Level — Granular Boundary System</div>
                    <div className="boundary-tiers">
                      {MANIFESTO_BOUNDARIES.map((b, i) => (
                        <div key={i} className="boundary-tier"
                          style={{ background: b.bg, border: `1px solid ${b.border}` }}>
                          <div className="bt-head">
                            <div className="bt-dot" style={{ background: b.dotColor }} />
                            <span className="bt-label" style={{ color: b.dotColor }}>{b.tier}</span>
                            <span style={{
                              marginLeft: "auto", fontSize: 9, letterSpacing: 2,
                              padding: "2px 8px", borderRadius: 100, background: `${b.dotColor}20`,
                              color: b.dotColor, border: `1px solid ${b.dotColor}40`
                            }}>{b.label}</span>
                          </div>
                          <div className="bt-items">
                            {b.items.map((item, j) => <div key={j} className="bt-item">{item}</div>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sonic Lineage */}
                  <div className="mani-block">
                    <div className="mani-block-title" style={{ color: "var(--violet)" }}>Sonic Lineage Graph — Aesthetic Positioning</div>
                    <div className="lineage-examples">
                      {LINEAGE_EXAMPLES.map((l, i) => (
                        <div key={i} className="le-item">
                          <div className="le-combo">"{l.combo}"</div>
                          <div className="le-niche">{l.niche}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* RIGHT — Dashboard Sidebar */}
                <div className="mani-sidebar">

                  {/* Traffic Light Dashboard */}
                  <div className="traffic-dash">
                    <div className="td-title" style={{ color: "var(--teal)" }}>This Week — Enforcement Dashboard</div>
                    <div className="traffic-stats">
                      {TRAFFIC_STATS.map((s, i) => (
                        <div key={i} className="ts-row" style={{ background: s.bg, border: `1px solid ${s.color}25` }}>
                          <div className="ts-light" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                          <span className="ts-label">{s.label}</span>
                          <span className="ts-count" style={{ color: s.color }}>{s.count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="traffic-week">LAST 7 DAYS · AUTO-ENFORCED · ZERO MANUAL FILING</div>
                  </div>

                  {/* Creative Equity */}
                  <div className="equity-card">
                    <div className="ec-title" style={{ color: "var(--gold)" }}>Creative Equity — Compounding Value</div>
                    <div className="equity-steps">
                      {EQUITY_STEPS.map((s, i) => (
                        <div key={i} className="eq-step">
                          <div className="eq-n" style={{ color: "var(--gold)", opacity: 0.4 }}>{s.n}</div>
                          <div className="eq-text"><b>{s.title}</b>{s.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* The Distinction */}
                  <div style={{
                    background: "linear-gradient(135deg,rgba(176,96,255,0.06),rgba(232,160,32,0.04))",
                    border: "1px solid rgba(176,96,255,0.25)", borderRadius: 14, padding: 22
                  }}>
                    <div style={{ fontSize: 10, color: "var(--violet)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>The Distinction</div>
                    <div style={{ fontSize: 11, color: "var(--muted2)", lineHeight: 2 }}>
                      A conventional voice actor does <span style={{ color: "var(--rose)" }}>100 gigs. Gets paid 100 times.</span><br /><br />
                      A NOIZYVOX artist does <span style={{ color: "var(--gold)" }}>100 gigs</span> and each one expands their sonic dataset, validates their creative positioning, and compounds their platform authority.<br /><br />
                      <span style={{ color: "var(--violet)", fontFamily: "var(--serif)", fontSize: 13, fontStyle: "italic" }}>They're not renting their voice. They're investing in a permanent creative asset.</span>
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}

          {/* ══ ARCHITECTURE ══ */}
          {tab === "arch" && (
            <>
              <div className="sec-title">System Architecture — The Four-Layer Machine</div>

              {/* Four Layer Pipeline */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 20 }}>
                {[
                  {
                    n: "L1", name: "DreamChamber", sub: "Soul Capture & Intake",
                    color: "var(--gold)", icon: "🎭",
                    what: "Artist performs in emotional modes — not generic text. The system maps the emotional geometry of their voice, not just its sound.",
                    tech: ["Performance Mode Capture (8 modes)", "Real-time clone preview sandbox", "Dynamic range & breath preservation", "Artist approval gate — model not released until artist says: that is me"],
                    output: "OUTPUT: Voice Identity Model — consent-locked at genesis"
                  },
                  {
                    n: "L2", name: "Consent-Locked Vault", sub: "IP Security & Kill Switch",
                    color: "var(--teal)", icon: "🔐",
                    what: "Security is not a policy. It is baked into the audio files and the model weights themselves. The vault cannot be bypassed.",
                    tech: ["128-bit sub-sonic cryptographic watermark in every file", "Kill Switch: artist revokes any client at API level, instantly", "Immutable consent chain: every inference logged", "Spectral DNA binding: survives re-encoding and compression"],
                    output: "OUTPUT: Tamper-proof, traceable audio asset with provenance"
                  },
                  {
                    n: "L3", name: "NOIZYVOX Engine", sub: "Signal Intelligence",
                    color: "var(--violet)", icon: "⚡",
                    what: "This is where the voice clone becomes a smart voice. The engine reads context — a dying character gets strained delivery automatically. The studio doesn't tune it. The voice knows.",
                    tech: ["NLP script scan: reads emotional context before generating", "Auto-applies artist's matching performance mode", "Compounding brain: more use = more nuanced delivery", "Strictly bounded by artist's manifesto parameters"],
                    output: "OUTPUT: Context-intelligent audio that performs, not just reads"
                  },
                  {
                    n: "L4", name: "75% Perpetual Protocol", sub: "Monetization & Distribution",
                    color: "var(--rose)", icon: "💸",
                    what: "Payment doesn't sit in a corporate account for 30 days. 75% routes to the artist in real-time at the moment of inference. The estate inherits this. Forever.",
                    tech: ["Smart split-routing: 75% auto-delivered per inference", "Artist-set tiered rates: indie micro-cent to AAA enterprise", "Real-time dashboard: every use, every cent, every context", "Legacy protocol: estate receives royalties posthumously"],
                    output: "OUTPUT: Permanent compounding income stream — not a buyout"
                  },
                ].map((l, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "72px 1fr", background: "var(--card)",
                    border: `1px solid ${l.color}22`, borderRadius: i === 0 ? "14px 14px 4px 4px" : i === 3 ? "4px 4px 14px 14px" : "4px", overflow: "hidden"
                  }}>
                    <div style={{
                      background: `linear-gradient(180deg,${l.color}15,${l.color}08)`,
                      borderRight: `1px solid ${l.color}20`, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", padding: "20px 8px", gap: 8
                    }}>
                      <div style={{ fontSize: 24 }}>{l.icon}</div>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 11, fontWeight: 700, color: l.color, letterSpacing: 2 }}>{l.n}</div>
                    </div>
                    <div style={{ padding: "20px 24px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                        <span style={{ fontFamily: "var(--serif)", fontSize: 17, fontWeight: 700, color: "#fff" }}>{l.name}</span>
                        <span style={{ fontSize: 9, color: l.color, letterSpacing: 3, textTransform: "uppercase" }}>{l.sub}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted2)", lineHeight: 1.8, marginBottom: 14 }}>{l.what}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
                        {l.tech.map((t, j) => (
                          <div key={j} style={{
                            fontSize: 10, color: "var(--text)", padding: "6px 10px",
                            background: `${l.color}08`, border: `1px solid ${l.color}20`, borderRadius: 6,
                            display: "flex", alignItems: "flex-start", gap: 7
                          }}>
                            <span style={{ color: l.color, marginTop: 1, flexShrink: 0 }}>›</span>{t}
                          </div>
                        ))}
                      </div>
                      <div style={{
                        fontSize: 9, letterSpacing: 2, color: l.color, padding: "6px 12px",
                        background: `${l.color}10`, borderRadius: 6, display: "inline-block"
                      }}>
                        {l.output}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* API Sequence Flow */}
              <div className="sec-title">What Happens in 10 Seconds — The Client API Sequence</div>
              <div style={{ background: "var(--card)", border: "1px solid var(--border2)", borderRadius: 14, padding: 28, marginBottom: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[
                    { t: "0.0s", actor: "CLIENT", color: "var(--muted2)", action: "Submits script to NOIZYVOX API with Artist ID + licence key" },
                    { t: "0.1s", actor: "L3 ENGINE", color: "var(--violet)", action: "NLP scans script. Detects: grief + determination arc. Maps to artist's 'strained/resolute' performance mode" },
                    { t: "0.2s", actor: "L2 VAULT", color: "var(--teal)", action: "Consent chain checked. Client licence verified. Artist boundary scan: 🟢 Green — auto-approved content" },
                    { t: "0.4s", actor: "L3 ENGINE", color: "var(--violet)", action: "Audio generated with context-aware delivery. 128-bit watermark embedded in waveform" },
                    { t: "0.6s", actor: "L2 VAULT", color: "var(--teal)", action: "Inference logged to immutable consent ledger. Usage metrics updated in real-time" },
                    { t: "0.8s", actor: "L4 PROTOCOL", color: "var(--rose)", action: "Payment split-routed: 75% → artist account · 25% → NOIZY.ai. Both delivered instantly" },
                    { t: "1.0s", actor: "CLIENT", color: "var(--muted2)", action: "Receives audio file. Artist dashboard updates: +1 inference, +$0.023 earned, context logged" },
                    { t: "ongoing", actor: "L3 ENGINE", color: "var(--gold)", action: "Compounding brain: this inference expands the artist's emotional model. Voice grows more valuable with every use" },
                  ].map((s, i) => (
                    <div key={i} style={{
                      display: "grid", gridTemplateColumns: "60px 110px 1fr", gap: 16,
                      padding: "12px 0", borderBottom: i < 7 ? "1px solid var(--border)" : "none", alignItems: "flex-start"
                    }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", paddingTop: 2 }}>{s.t}</div>
                      <div style={{
                        fontSize: 9, letterSpacing: 1.5, padding: "3px 8px", borderRadius: 100, textAlign: "center",
                        background: `${s.color}15`, border: `1px solid ${s.color}30`, color: s.color, whiteSpace: "nowrap"
                      }}>{s.actor}</div>
                      <div style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.6 }}>{s.action}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* The Compounding Loop */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{
                  background: "linear-gradient(135deg,rgba(232,160,32,0.06),transparent)",
                  border: "1px solid rgba(232,160,32,0.25)", borderRadius: 14, padding: 26
                }}>
                  <div style={{ fontSize: 10, color: "var(--gold)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>Why This Defeats ElevenLabs</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      ["ElevenLabs", "Vending machine. Generic voices. No identity. No consent. No compounding.", "var(--rose)"],
                      ["NOIZY.ai", "Living ecosystem. Human DNA. Consent-locked. Perpetual royalty. Compounding intelligence.", "var(--gold)"],
                    ].map(([name, desc, c], i) => (
                      <div key={i} style={{
                        padding: "12px 16px", background: i === 0 ? "rgba(255,64,96,0.04)" : "rgba(232,160,32,0.04)",
                        border: `1px solid ${c}20`, borderRadius: 8
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: c, marginBottom: 4 }}>{name}</div>
                        <div style={{ fontSize: 10, color: "var(--muted2)", lineHeight: 1.7 }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{
                  background: "linear-gradient(135deg,rgba(176,96,255,0.06),transparent)",
                  border: "1px solid rgba(176,96,255,0.25)", borderRadius: 14, padding: 26
                }}>
                  <div style={{ fontSize: 10, color: "var(--violet)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>The Compounding Intelligence Loop</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      "Artist performs → model created",
                      "Client uses model → inference logged",
                      "Signal intelligence captures context data",
                      "Emotional range of model expands",
                      "Artist's voice becomes more valuable",
                      "Higher-value clients discovered automatically",
                      "Artist raises rates. Dataset grows. Loop repeats.",
                    ].map((s, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 12px", background: "rgba(176,96,255,0.04)", borderRadius: 6
                      }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: "50%", background: "var(--violet)",
                          opacity: 0.3 + i * 0.1, flexShrink: 0
                        }} />
                        <span style={{
                          fontSize: 10, color: i === 6 ? "var(--violet)" : "var(--muted2)",
                          fontWeight: i === 6 ? 700 : 400
                        }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}

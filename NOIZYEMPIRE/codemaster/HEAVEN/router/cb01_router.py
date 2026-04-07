#!/usr/bin/env python3
import argparse
import json
import subprocess
import sys
import shutil
from pathlib import Path


def load_config() -> dict:
    cfg_path = Path(__file__).resolve().parent / "router_config.json"
    return json.loads(cfg_path.read_text(encoding="utf-8"))


def score_keywords(text_lower: str, keywords: list[str]) -> tuple[int, list[str]]:
    matched: list[str] = []
    score = 0
    for raw in keywords:
        k = raw.lower().strip()
        if not k:
            continue

        # Phrase match (contains spaces) gets higher weight.
        if " " in k:
            if k in text_lower:
                score += 3
                matched.append(raw)
        else:
            if k in text_lower:
                score += 1
                matched.append(raw)

    return score, matched


def pick_agent_by_keywords(text: str, cfg: dict) -> tuple[str, str, float]:
    t = text.lower()
    keywords_map = cfg.get("routing", {}).get("keywords", {})

    best_agent = "GABRIEL" if "GABRIEL" in keywords_map else "ENGR_KEITH"
    best_score = -1
    best_matched: list[str] = []

    for agent, words in keywords_map.items():
        score, matched = score_keywords(t, list(words))
        if score > best_score:
            best_agent = agent
            best_score = score
            best_matched = matched

    # Confidence heuristic: grows with score, capped.
    confidence = min(0.95, 0.25 + (max(best_score, 0) * 0.08))
    reason = f"keyword_score={max(best_score, 0)} matched={best_matched[:6]}"
    return best_agent, reason, confidence


def ollama_run_capture(model: str, prompt: str) -> tuple[int, str]:
    p = subprocess.run(
        ["ollama", "run", model],
        input=prompt,
        text=True,
        capture_output=True,
    )
    out = (p.stdout or "")
    if p.stderr:
        out = out + ("\n" if out and not out.endswith("\n") else "") + p.stderr
    return p.returncode, out


def speak(text: str) -> None:
    # Prefer user helper if available; otherwise fall back to macOS say.
    sayjamie = shutil.which("sayjamie")
    if sayjamie:
        subprocess.run([sayjamie], input=text, text=True)
        return

    if shutil.which("say"):
        subprocess.run(["say", "-v", "Jamie (Premium)", text])


def main() -> int:
    parser = argparse.ArgumentParser(description="Local CB01 router (keyword-based) for HEAVEN agents")
    parser.add_argument("--agent", help="Force agent name (e.g., ENGR_KEITH)")
    parser.add_argument("--dry-run", action="store_true", help="Only print routing decision")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON (decision + output)")
    parser.add_argument("--speak", action="store_true", help="Speak the agent output via sayjamie/Jamie voice")
    parser.add_argument("text", nargs="*", help="Text to route; if empty, read stdin")
    args = parser.parse_args()

    cfg = load_config()

    if args.text:
        text = " ".join(args.text)
    else:
        text = sys.stdin.read()

    if not text.strip():
        print("No input received", file=sys.stderr)
        return 2

    if args.agent:
        agent = args.agent
        reason = "forced"
        confidence = 1.0
    else:
        agent, reason, confidence = pick_agent_by_keywords(text, cfg)

    decision = {"agent": agent, "reason": reason, "confidence": confidence}

    if args.dry_run:
        if args.json:
            print(json.dumps({"decision": decision}, ensure_ascii=False))
        else:
            print(json.dumps(decision, indent=2, ensure_ascii=False))
        return 0

    model = cfg["agents"].get(agent, {}).get("ollama_model")
    if not model:
        print(f"Unknown agent '{agent}' in config", file=sys.stderr)
        return 3

    rc, out = ollama_run_capture(model, text)

    if args.speak and out.strip():
        speak(out)

    if args.json:
        payload = {
            "decision": decision,
            "ollama_model": model,
            "returncode": rc,
            "output": out,
        }
        print(json.dumps(payload, ensure_ascii=False))
        return rc

    header = f"[ROUTED] {json.dumps(decision, ensure_ascii=False)}\n\n"
    sys.stdout.write(header)
    sys.stdout.write(out)
    if out and not out.endswith("\n"):
        sys.stdout.write("\n")
    sys.stdout.flush()
    return rc


if __name__ == "__main__":
    raise SystemExit(main())

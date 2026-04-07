#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from lib.fx_pipeline import apply_fx_chain, save_fx_report


def main() -> int:
    parser = argparse.ArgumentParser(description="Run FX chain on rendered audio.")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--preset", default="aaa_dialogue")
    args = parser.parse_args()

    input_wav = Path(args.input)
    output_wav = Path(args.output)
    report = apply_fx_chain(input_wav=input_wav, output_wav=output_wav, preset=args.preset)
    report_path = output_wav.with_suffix(".fx.json")
    save_fx_report(report_path, report)
    print(f"[fx] wrote output: {output_wav}")
    print(f"[fx] wrote report: {report_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

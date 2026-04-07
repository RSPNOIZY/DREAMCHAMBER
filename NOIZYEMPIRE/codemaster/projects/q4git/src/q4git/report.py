from typing import Iterable

from .scientist import Finding


def format_findings(findings: Iterable[Finding]) -> str:
    lines = []
    for item in findings:
        lines.append(f"[{item.severity}] {item.title}")
        lines.append(f"  Evidence: {item.evidence}")
        lines.append(f"  Action  : {item.action}")
    return "\n".join(lines)

from dataclasses import dataclass
from typing import List

from .gittools import (
    ensure_repo,
    get_status_porcelain,
    get_upstream,
    get_ahead_behind,
    get_branch,
    get_status_short,
)


@dataclass
class Finding:
    severity: str
    title: str
    evidence: str
    action: str


def diagnose(repo_path) -> List[Finding]:
    ensure_repo(repo_path)
    findings: List[Finding] = []

    status_lines = get_status_porcelain(repo_path)
    if status_lines:
        findings.append(
            Finding(
                severity="medium",
                title="Working tree has uncommitted changes",
                evidence=f"{len(status_lines)} file(s) modified",
                action="Review changes and commit or stash to keep history clean.",
            )
        )

    upstream = get_upstream(repo_path)
    if not upstream:
        findings.append(
            Finding(
                severity="low",
                title="No upstream branch configured",
                evidence=f"Branch: {get_branch(repo_path)}",
                action="Set an upstream: git push -u origin <branch>",
            )
        )
    else:
        behind, ahead = get_ahead_behind(repo_path, upstream)
        if behind > 0:
            findings.append(
                Finding(
                    severity="high",
                    title="Local branch is behind upstream",
                    evidence=f"Behind by {behind} commit(s)",
                    action="Pull or rebase to avoid drift before pushing.",
                )
            )
        if ahead > 0:
            findings.append(
                Finding(
                    severity="medium",
                    title="Local branch is ahead of upstream",
                    evidence=f"Ahead by {ahead} commit(s)",
                    action="Push to share changes or open a PR.",
                )
            )

    if not findings:
        findings.append(
            Finding(
                severity="low",
                title="Repo looks clean",
                evidence=get_status_short(repo_path) or "Clean status",
                action="No action required.",
            )
        )

    return findings

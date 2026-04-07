import subprocess
from pathlib import Path
from typing import List, Optional, Tuple


def _run_git(args: List[str], cwd: Path) -> Tuple[int, str, str]:
    proc = subprocess.run(
        ["git"] + args,
        cwd=str(cwd),
        text=True,
        capture_output=True,
    )
    return proc.returncode, proc.stdout.strip(), proc.stderr.strip()


def ensure_repo(cwd: Path) -> None:
    code, _, _ = _run_git(["rev-parse", "--is-inside-work-tree"], cwd)
    if code != 0:
        raise RuntimeError("Not a git repository")


def get_branch(cwd: Path) -> str:
    code, out, _ = _run_git(["rev-parse", "--abbrev-ref", "HEAD"], cwd)
    return out if code == 0 else "unknown"


def get_status_porcelain(cwd: Path) -> List[str]:
    code, out, _ = _run_git(["status", "--porcelain=v1"], cwd)
    return out.splitlines() if code == 0 and out else []


def get_status_short(cwd: Path) -> str:
    code, out, _ = _run_git(["status", "-sb"], cwd)
    return out if code == 0 else ""


def get_remotes(cwd: Path) -> List[str]:
    code, out, _ = _run_git(["remote", "-v"], cwd)
    return out.splitlines() if code == 0 and out else []


def get_recent_commits(cwd: Path, limit: int = 5) -> List[str]:
    code, out, _ = _run_git(["log", "--oneline", f"-n{limit}"], cwd)
    return out.splitlines() if code == 0 and out else []


def get_diff_stat(cwd: Path) -> List[str]:
    code, out, _ = _run_git(["diff", "--stat"], cwd)
    return out.splitlines() if code == 0 and out else []


def get_ahead_behind(cwd: Path, upstream: Optional[str]) -> Tuple[int, int]:
    if not upstream:
        return 0, 0
    code, out, _ = _run_git(["rev-list", "--left-right", "--count", f"{upstream}...HEAD"], cwd)
    if code != 0 or not out:
        return 0, 0
    left, right = out.split()
    return int(left), int(right)


def get_upstream(cwd: Path) -> Optional[str]:
    code, out, _ = _run_git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], cwd)
    return out if code == 0 and out else None

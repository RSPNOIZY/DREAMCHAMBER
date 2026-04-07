import argparse
import json
import sys
from pathlib import Path
from shutil import which

from .config import Config
from .gittools import (
    ensure_repo,
    get_branch,
    get_status_short,
    get_remotes,
    get_recent_commits,
    get_diff_stat,
)
from .github import list_issues, resolve_repo
from .report import format_findings
from .scientist import diagnose


def _print_section(title: str) -> None:
    print(f"\n== {title} ==")


def cmd_status(cfg: Config, args: argparse.Namespace) -> int:
    ensure_repo(cfg.repo_path)
    _print_section("Repository")
    print(f"Path   : {cfg.repo_path}")
    print(f"Branch : {get_branch(cfg.repo_path)}")
    print(f"Status : {get_status_short(cfg.repo_path)}")

    _print_section("Remotes")
    remotes = get_remotes(cfg.repo_path)
    print("\n".join(remotes) if remotes else "No remotes configured")

    _print_section("Recent Commits")
    commits = get_recent_commits(cfg.repo_path, limit=args.limit)
    print("\n".join(commits) if commits else "No commits found")

    if args.diff:
        _print_section("Diff Summary")
        diff = get_diff_stat(cfg.repo_path)
        print("\n".join(diff) if diff else "No diff")

    return 0


def cmd_scan(cfg: Config, _args: argparse.Namespace) -> int:
    findings = diagnose(cfg.repo_path)
    print(format_findings(findings))
    return 0


def cmd_issues(cfg: Config, args: argparse.Namespace) -> int:
    ensure_repo(cfg.repo_path)
    repo = resolve_repo(cfg.repo_path, cfg.github_token)
    if not repo:
        print("No GitHub remote detected. Add a GitHub remote or pass --repo.", file=sys.stderr)
        return 2
    if not cfg.github_token:
        print("Missing GitHub token. Set GITHUB_TOKEN or GITHUB_PERSONAL_ACCESS_TOKEN.", file=sys.stderr)
        return 2

    issues = list_issues(repo, cfg.github_token, args.state, args.limit)
    if args.json:
        print(json.dumps(issues, indent=2))
        return 0

    if not issues:
        print("No issues returned.")
        return 0

    for item in issues:
        number = item.get("number")
        title = item.get("title")
        state = item.get("state")
        url = item.get("html_url")
        print(f"#{number} [{state}] {title}")
        print(f"  {url}")
    return 0


def cmd_doctor(cfg: Config, _args: argparse.Namespace) -> int:
    print("Q4GIT Doctor")
    print("-----------")
    print(f"git present        : {'yes' if which('git') else 'no'}")
    print(f"repo path exists   : {'yes' if cfg.repo_path.exists() else 'no'}")

    try:
        ensure_repo(cfg.repo_path)
        repo_ok = True
    except RuntimeError:
        repo_ok = False

    print(f"is git repo        : {'yes' if repo_ok else 'no'}")
    print(f"github token set   : {'yes' if cfg.github_token else 'no'}")

    if repo_ok:
        repo = resolve_repo(cfg.repo_path, cfg.github_token)
        print(f"github remote      : {repo if repo else 'none detected'}")

    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="q4git", description="Q4GIT - super Git manager")
    parser.add_argument("--repo", help="Path to git repository (default: cwd)")

    sub = parser.add_subparsers(dest="command", required=True)

    p_status = sub.add_parser("status", help="Show repo summary")
    p_status.add_argument("--limit", type=int, default=5, help="Number of commits to show")
    p_status.add_argument("--diff", action="store_true", help="Include diff stat")

    sub.add_parser("scan", help="Run scientist diagnostics")

    p_issues = sub.add_parser("issues", help="List GitHub issues")
    p_issues.add_argument("--state", default="open", choices=["open", "closed", "all"])
    p_issues.add_argument("--limit", type=int, default=10)
    p_issues.add_argument("--json", action="store_true")

    sub.add_parser("doctor", help="Check environment and setup")

    return parser


def main(argv=None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    cfg = Config.from_args(args.repo)

    if args.command == "status":
        return cmd_status(cfg, args)
    if args.command == "scan":
        return cmd_scan(cfg, args)
    if args.command == "issues":
        return cmd_issues(cfg, args)
    if args.command == "doctor":
        return cmd_doctor(cfg, args)

    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())

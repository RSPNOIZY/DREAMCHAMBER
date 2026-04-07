#!/usr/bin/env python3

from __future__ import annotations

import json
import os
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path


TRACKED_SUFFIXES = {
    ".code-workspace",
    ".html",
    ".json",
    ".js",
    ".md",
    ".py",
    ".sh",
    ".talon",
    ".toml",
    ".ts",
    ".txt",
    ".yaml",
    ".yml",
}

EXCLUDED_PARTS = {
    ".git",
    ".venv",
    "__pycache__",
    "07_LEGACY",
    "OneDrive",
    "_ORGANIZED",
    "node_modules",
}

GENERATED_RELATIVE_PATHS = {
    "NOIZY_ARCHIVE/06_APPENDIX/workspace-atlas.md",
    "NOIZY_ARCHIVE/06_APPENDIX/workspace-manifest.json",
    "NOIZY_ARCHIVE/06_APPENDIX/project-date-fishnet.md",
}

UTILITY_PROJECTS = {
    ".skills",
    ".vscode",
    "CODEMASTER/logs",
    "NOIZY_ARCHIVE/scripts",
}


@dataclass(frozen=True)
class FileRecord:
    path: str
    project: str
    kind: str
    modified_date: str
    modified_at: str
    size_bytes: int


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def output_dir(root: Path) -> Path:
    return root / "NOIZY_ARCHIVE" / "06_APPENDIX"


def should_skip(path: Path) -> bool:
    return any(part in EXCLUDED_PARTS for part in path.parts)


def is_tracked_file(path: Path) -> bool:
    if path.suffix.lower() in TRACKED_SUFFIXES:
        return True
    return path.name.endswith(".code-workspace")


def classify_kind(path: Path) -> str:
    suffix = path.suffix.lower()

    if "logs" in path.parts or suffix == ".log":
        return "log"
    if suffix in {".md", ".txt", ".html"}:
        return "doc"
    if suffix in {".py", ".js", ".ts", ".sh"}:
        return "code"
    if suffix in {".json", ".toml", ".yaml", ".yml", ".code-workspace"}:
        return "config"
    if suffix == ".talon":
        return "automation"
    return "other"


def classify_project(path: Path) -> str:
    parts = path.parts

    if len(parts) == 1:
        return "ROOT"

    if parts[0] == "CODEMASTER":
        if len(parts) >= 3 and parts[1] == "projects":
            return f"CODEMASTER/projects/{parts[2]}"
        if len(parts) >= 2 and parts[1] in {"docs", "logs", "news"}:
            return f"CODEMASTER/{parts[1]}"
        return "CODEMASTER"

    if parts[0] == "NOIZY_ARCHIVE":
        if len(parts) >= 3:
            return f"NOIZY_ARCHIVE/{parts[1]}"
        return "NOIZY_ARCHIVE"

    if parts[0] in {"GABRIEL", "SystemGuardian"}:
        return parts[0]

    if parts[0] in {".skills", ".vscode", "logs"}:
        return parts[0]

    return parts[0]


def collect_records(root: Path) -> list[FileRecord]:
    records: list[FileRecord] = []

    for path in root.rglob("*"):
        if not path.is_file():
            continue

        relative = path.relative_to(root)

        if relative.as_posix() in GENERATED_RELATIVE_PATHS:
            continue

        if should_skip(relative) or not is_tracked_file(relative):
            continue

        stat = path.stat()
        modified = datetime.fromtimestamp(stat.st_mtime)
        records.append(
            FileRecord(
                path=relative.as_posix(),
                project=classify_project(relative),
                kind=classify_kind(relative),
                modified_date=modified.strftime("%Y-%m-%d"),
                modified_at=modified.isoformat(timespec="seconds"),
                size_bytes=stat.st_size,
            )
        )

    return sorted(records, key=lambda item: (item.modified_at, item.path), reverse=True)


def relative_link(output_directory: Path, root: Path, record: FileRecord) -> str:
    target = root / record.path
    return Path(os.path.relpath(target, output_directory)).as_posix()


def index_records(
    records: list[FileRecord],
) -> tuple[defaultdict[str, list[FileRecord]], defaultdict[str, list[FileRecord]]]:
    projects: defaultdict[str, list[FileRecord]] = defaultdict(list)
    dates: defaultdict[str, list[FileRecord]] = defaultdict(list)

    for record in records:
        projects[record.project].append(record)
        dates[record.modified_date].append(record)

    return projects, dates


def build_project_links(
    projects: defaultdict[str, list[FileRecord]],
) -> dict[str, list[dict[str, object]]]:
    project_dates = {
        project: {item.modified_date for item in items}
        for project, items in projects.items()
    }
    project_sizes = {project: len(items) for project, items in projects.items()}
    links: dict[str, list[dict[str, object]]] = {}

    for project, own_dates in project_dates.items():
        primary_links: list[dict[str, object]] = []
        fallback_links: list[dict[str, object]] = []

        for other, other_dates in project_dates.items():
            if other == project:
                continue

            shared_dates = sorted(own_dates & other_dates, reverse=True)
            if not shared_dates:
                continue

            link_record = (
                {
                    "project": other,
                    "shared_date_count": len(shared_dates),
                    "shared_dates": shared_dates,
                }
            )

            if other in UTILITY_PROJECTS:
                fallback_links.append(link_record)
            else:
                primary_links.append(link_record)

        primary_links.sort(
            key=lambda item: (
                -int(item["shared_date_count"]),
                -project_sizes[str(item["project"])],
                str(item["project"]),
            )
        )
        fallback_links.sort(
            key=lambda item: (
                -int(item["shared_date_count"]),
                -project_sizes[str(item["project"])],
                str(item["project"]),
            )
        )
        links[project] = primary_links + fallback_links

    return links


def build_manifest(records: list[FileRecord]) -> dict:
    project_summary: dict[str, dict] = {}
    date_summary: dict[str, dict] = {}
    projects, dates = index_records(records)
    project_links = build_project_links(projects)

    for project, items in sorted(projects.items()):
        kinds = Counter(item.kind for item in items)
        active_dates = sorted({item.modified_date for item in items}, reverse=True)
        project_summary[project] = {
            "file_count": len(items),
            "first_updated": min(item.modified_date for item in items),
            "last_updated": max(item.modified_date for item in items),
            "active_date_count": len(active_dates),
            "active_dates": active_dates,
            "kinds": dict(sorted(kinds.items())),
            "recent_files": [item.path for item in items[:5]],
            "linked_projects": project_links.get(project, [])[:5],
        }

    for modified_date, items in sorted(dates.items(), reverse=True):
        per_project = Counter(item.project for item in items)
        date_summary[modified_date] = {
            "file_count": len(items),
            "project_count": len(per_project),
            "projects": dict(sorted(per_project.items())),
        }

    cross_project_days = [
        {
            "date": modified_date,
            "project_count": summary["project_count"],
            "file_count": summary["file_count"],
            "projects": list(summary["projects"].keys()),
        }
        for modified_date, summary in date_summary.items()
        if summary["project_count"] > 1
    ]

    return {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "tracked_file_count": len(records),
        "project_count": len(projects),
        "project_summary": project_summary,
        "date_summary": date_summary,
        "cross_project_days": cross_project_days,
        "files": [record.__dict__ for record in records],
    }


def render_markdown(root: Path, records: list[FileRecord]) -> str:
    out_dir = output_dir(root)
    manifest_path = "workspace-manifest.json"
    fishnet_path = "project-date-fishnet.md"
    projects, dates = index_records(records)
    project_links = build_project_links(projects)

    summary_rows = []
    for project, items in projects.items():
        kinds = Counter(item.kind for item in items)
        summary_rows.append(
            (
                max(item.modified_date for item in items),
                project,
                len(items),
                kinds.get("doc", 0),
                kinds.get("code", 0),
                kinds.get("config", 0),
                kinds.get("automation", 0),
            )
        )

    summary_rows.sort(key=lambda row: (row[0], row[2], row[1]), reverse=True)

    lines = [
        "# Workspace Atlas",
        "",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        f"Tracked files: {len(records)}",
        "",
        f"Machine-readable manifest: [{manifest_path}](./{manifest_path})",
        "",
        f"Project/date fishnet: [{fishnet_path}](./{fishnet_path})",
        "",
        "This atlas groups tracked workspace files by project and modification date.",
        "",
        "## Project Summary",
        "",
        "| Project | Files | Docs | Code | Config | Automation | Last Updated |",
        "|---|---:|---:|---:|---:|---:|---|",
    ]

    for last_updated, project, total, docs, code, config, automation in summary_rows:
        lines.append(
            f"| `{project}` | {total} | {docs} | {code} | {config} | {automation} | {last_updated} |"
        )

    lines.extend(
        [
            "",
            "## Cross-Project Pulse",
            "",
            "| Date | Projects Active | Files | Clusters |",
            "|---|---:|---:|---|",
        ]
    )

    for modified_date in sorted(dates.keys(), reverse=True):
        items = dates[modified_date]
        active_projects = sorted({item.project for item in items})
        clusters = ", ".join(f"`{project}`" for project in active_projects)
        lines.append(
            f"| {modified_date} | {len(active_projects)} | {len(items)} | {clusters} |"
        )

    lines.extend(
        [
            "",
            "## Activity By Date",
            "",
        ]
    )

    for modified_date in sorted(dates.keys(), reverse=True):
        lines.append(f"### {modified_date}")
        lines.append("")

        for record in sorted(dates[modified_date], key=lambda item: (item.project, item.path)):
            link = relative_link(out_dir, root, record)
            lines.append(
                f"- [`{record.path}`]({link}) | `{record.project}` | `{record.kind}`"
            )

        lines.append("")

    lines.extend(
        [
            "## Project Details",
            "",
        ]
    )

    for _, project, *_ in summary_rows:
        items = sorted(projects[project], key=lambda item: (item.modified_at, item.path), reverse=True)
        kinds = Counter(item.kind for item in items)
        mix = ", ".join(f"{kind} {count}" for kind, count in sorted(kinds.items()))

        lines.append(f"### {project}")
        lines.append("")
        lines.append(f"- Files: {len(items)}")
        lines.append(f"- Last Updated: {max(item.modified_date for item in items)}")
        lines.append(f"- First Seen: {min(item.modified_date for item in items)}")
        lines.append(
            f"- Active Dates: {', '.join(sorted({item.modified_date for item in items}, reverse=True))}"
        )
        lines.append(f"- Mix: {mix}")
        linked = project_links.get(project, [])[:3]
        if linked:
            link_summary = ", ".join(
                f"`{item['project']}` ({item['shared_date_count']} shared date"
                f"{'s' if item['shared_date_count'] != 1 else ''})"
                for item in linked
            )
            lines.append(f"- Strongest Links: {link_summary}")
        lines.append("")
        lines.append("| Date | Kind | File |")
        lines.append("|---|---|---|")

        for record in items:
            link = relative_link(out_dir, root, record)
            lines.append(
                f"| {record.modified_date} | `{record.kind}` | [`{record.path}`]({link}) |"
            )

        lines.append("")

    return "\n".join(lines)


def render_fishnet(root: Path, records: list[FileRecord]) -> str:
    out_dir = output_dir(root)
    projects, dates = index_records(records)
    project_links = build_project_links(projects)

    lines = [
        "# Project-Date Fishnet",
        "",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "This is the cross-project map of the workspace.",
        "",
        "Use it when you want to answer:",
        "",
        "- which projects are active together",
        "- which dates represent major bursts of activity",
        "- which clusters are most connected",
        "",
        "## Cross-Project Days",
        "",
        "| Date | Projects | Files | Active Clusters |",
        "|---|---:|---:|---|",
    ]

    for modified_date in sorted(dates.keys(), reverse=True):
        items = dates[modified_date]
        active_projects = sorted({item.project for item in items})
        if len(active_projects) <= 1:
            continue

        lines.append(
            f"| {modified_date} | {len(active_projects)} | {len(items)} | "
            f"{', '.join(f'`{project}`' for project in active_projects)} |"
        )

    lines.extend(
        [
            "",
            "## Project Arcs",
            "",
            "| Project | First Seen | Last Seen | Active Dates | Strongest Links |",
            "|---|---|---|---:|---|",
        ]
    )

    project_rows = []
    for project, items in projects.items():
        active_dates = sorted({item.modified_date for item in items}, reverse=True)
        linked = project_links.get(project, [])[:3]
        link_summary = ", ".join(
            f"`{item['project']}` ({item['shared_date_count']})" for item in linked
        ) or "-"
        project_rows.append(
            (
                max(item.modified_date for item in items),
                project,
                min(item.modified_date for item in items),
                len(active_dates),
                link_summary,
            )
        )

    project_rows.sort(key=lambda row: (row[0], row[3], row[1]), reverse=True)

    for last_seen, project, first_seen, active_date_count, link_summary in project_rows:
        lines.append(
            f"| `{project}` | {first_seen} | {last_seen} | {active_date_count} | {link_summary} |"
        )

    lines.extend(
        [
            "",
            "## Cluster Threads",
            "",
        ]
    )

    for _, project, _, _, _ in project_rows:
        items = projects[project]
        active_dates = sorted({item.modified_date for item in items}, reverse=True)
        linked = project_links.get(project, [])[:5]

        lines.append(f"### {project}")
        lines.append("")
        lines.append(f"- File Count: {len(items)}")
        lines.append(f"- Date Range: {min(active_dates)} to {max(active_dates)}")
        lines.append(f"- Active Dates: {', '.join(active_dates)}")
        if linked:
            lines.append(
                "- Linked Clusters: "
                + ", ".join(
                    f"`{item['project']}` on {', '.join(item['shared_dates'][:3])}"
                    for item in linked
                )
            )
        else:
            lines.append("- Linked Clusters: none yet")
        lines.append("- Recent Anchors:")
        for record in items[:5]:
            link = relative_link(out_dir, root, record)
            lines.append(
                f"  - [`{record.path}`]({link}) | `{record.modified_date}` | `{record.kind}`"
            )
        lines.append("")

    return "\n".join(lines)


def main() -> None:
    root = repo_root()
    out_dir = output_dir(root)
    out_dir.mkdir(parents=True, exist_ok=True)

    records = collect_records(root)
    manifest = build_manifest(records)

    manifest_file = out_dir / "workspace-manifest.json"
    atlas_file = out_dir / "workspace-atlas.md"
    fishnet_file = out_dir / "project-date-fishnet.md"

    manifest_file.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    atlas_file.write_text(render_markdown(root, records), encoding="utf-8")
    fishnet_file.write_text(render_fishnet(root, records), encoding="utf-8")

    print(f"Wrote {manifest_file.relative_to(root)}")
    print(f"Wrote {atlas_file.relative_to(root)}")
    print(f"Wrote {fishnet_file.relative_to(root)}")


if __name__ == "__main__":
    main()

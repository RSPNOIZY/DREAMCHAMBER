#!/usr/bin/env python3
"""DreamChamber orchestration actions.

Safe local automation for visual blueprint workflows.
"""

from __future__ import annotations

import datetime as dt
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
WORKSTATION_DIR = ROOT / "workstation"
STATE_PATH = WORKSTATION_DIR / "state.json"
AQ_PATH = WORKSTATION_DIR / "aquarium_state.json"
RESEARCH_DIR = ROOT / "research"
SLIDES_DIR = ROOT / "slides"
PROTOTYPES_DIR = ROOT / "prototypes"
DIAGRAMS_DIR = WORKSTATION_DIR / "diagrams"


def timestamp() -> str:
    return dt.datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %Z")


def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text or "item"


def load_state() -> dict:
    if not STATE_PATH.exists():
        return {"mode": "exploration", "last_updated": timestamp(), "project": "noizy"}
    return json.loads(STATE_PATH.read_text(encoding="utf-8"))


def save_state(state: dict) -> None:
    state["last_updated"] = timestamp()
    WORKSTATION_DIR.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, indent=2), encoding="utf-8")


def activate() -> int:
    state = load_state()
    state["active"] = True
    state.setdefault("mode", "exploration")
    save_state(state)
    print(f"[dreamchamber] activated in mode={state['mode']}")
    return 0


def set_mode(mode: str) -> int:
    mode = mode.lower().strip()
    allowed = {"exploration", "creation", "collaboration"}
    if mode not in allowed:
        print(f"[dreamchamber] invalid mode: {mode}. allowed={sorted(allowed)}")
        return 2
    state = load_state()
    state["mode"] = mode
    state["active"] = True
    save_state(state)
    print(f"[dreamchamber] mode -> {mode}")
    return 0


def research(topic: str) -> int:
    topic = topic.strip()
    if not topic:
        print("[dreamchamber] missing research topic")
        return 2
    RESEARCH_DIR.mkdir(parents=True, exist_ok=True)
    fn = f"{dt.date.today().isoformat()}-{slugify(topic)}.md"
    path = RESEARCH_DIR / fn
    content = f"""# Research Brief: {topic}

Generated: {timestamp()}
Mode: DreamChamber Research

## Objective
- Define what we need to learn about: **{topic}**

## Questions
- What is the current state?
- What are the strongest primary sources?
- What are the implementation risks?
- How does this map to NOIZY.AI / DreamChamber?

## Notes
- Add sourced findings here.
"""
    path.write_text(content, encoding="utf-8")
    print(f"[dreamchamber] research scaffold created: {path}")
    return 0


def pitch(topic: str) -> int:
    topic = topic.strip() or "NOIZY.AI"
    out_dir = SLIDES_DIR / "outlines"
    out_dir.mkdir(parents=True, exist_ok=True)
    fn = f"{dt.date.today().isoformat()}-{slugify(topic)}-pitch.md"
    path = out_dir / fn
    content = f"""# Pitch Outline: {topic}

Generated: {timestamp()}

## Slide 1 - Title
- {topic}
- One-line category claim

## Slide 2 - Problem
- What is broken now

## Slide 3 - Solution
- DreamChamber + AVA + ENGR

## Slide 4 - Product
- Core modules and workflow

## Slide 5 - Economics
- 75/25 creator-first revenue split

## Slide 6 - Go-to-Market
- Who adopts first and why

## Slide 7 - Roadmap
- 90-day build milestones
"""
    path.write_text(content, encoding="utf-8")
    print(f"[dreamchamber] pitch outline created: {path}")
    return 0


def prototype(kind: str) -> int:
    kind = kind.lower().strip()
    if kind != "ava":
        print("[dreamchamber] only 'ava' prototype scaffold is supported right now")
        return 2
    base = PROTOTYPES_DIR / "ava_engine"
    base.mkdir(parents=True, exist_ok=True)
    (base / "README.md").write_text(
        """# AVA Engine Prototype

## Flow
1. Voice input (STT)
2. Persona retrieval (RAG)
3. LLM response
4. Voice output (TTS)
5. Policy + audit logging

## Next
- Wire FastAPI endpoints
- Add dataset approval gates
- Add versioning/revocation controls
""",
        encoding="utf-8",
    )
    (base / "pipeline.mmd").write_text(
        """flowchart LR
  A[Voice Input] --> B[STT]
  B --> C[Persona RAG]
  C --> D[LLM]
  D --> E[TTS]
  E --> F[Output]
  D --> G[Policy Check]
  G --> H[Audit Log]
""",
        encoding="utf-8",
    )
    print(f"[dreamchamber] prototype scaffold created: {base}")
    return 0


def visualize(target: str) -> int:
    target = target.lower().strip()
    DIAGRAMS_DIR.mkdir(parents=True, exist_ok=True)
    if target != "ava":
        print("[dreamchamber] only 'ava' visualization is supported right now")
        return 2
    path = DIAGRAMS_DIR / "ava-architecture.md"
    path.write_text(
        """# AVA Architecture Diagram

```mermaid
flowchart LR
  U[Actor Input] --> STT[Speech-to-Text]
  STT --> RAG[Persona Memory Retrieval]
  RAG --> LLM[Reasoning Model]
  LLM --> TTS[Voice Synthesis]
  TTS --> OUT[Performance Output]
  LLM --> POL[Policy + Consent]
  POL --> AUD[Audit + Provenance]
```
""",
        encoding="utf-8",
    )
    print(f"[dreamchamber] visualization created: {path}")
    return 0


def usage() -> int:
    print(
        "Usage:\n"
        "  dreamchamber_orchestrator.py activate\n"
        "  dreamchamber_orchestrator.py mode <exploration|creation|collaboration>\n"
        "  dreamchamber_orchestrator.py research <topic>\n"
        "  dreamchamber_orchestrator.py pitch <topic>\n"
        "  dreamchamber_orchestrator.py prototype ava\n"
        "  dreamchamber_orchestrator.py visualize ava\n"
        "  dreamchamber_orchestrator.py aquarium seed <text>\n"
        "  dreamchamber_orchestrator.py aquarium grow <text>\n"
        "  dreamchamber_orchestrator.py aquarium retrieve <text>\n"
        "  dreamchamber_orchestrator.py aquarium join-composer <name>\n"
        "  dreamchamber_orchestrator.py aquarium promote-teacher <name-or-id>\n"
        "  dreamchamber_orchestrator.py aquarium list-guild\n"
        "  dreamchamber_orchestrator.py aquarium list-teachers"
    )
    return 1


def load_aquarium() -> dict:
    if not AQ_PATH.exists():
        return {
            "items": [],
            "composer_guild": [],
            "noizykidz_teachers": [],
            "last_updated": timestamp(),
        }
    data = json.loads(AQ_PATH.read_text(encoding="utf-8"))
    data.setdefault("items", [])
    data.setdefault("composer_guild", [])
    data.setdefault("noizykidz_teachers", [])
    return data


def save_aquarium(data: dict) -> None:
    data["last_updated"] = timestamp()
    WORKSTATION_DIR.mkdir(parents=True, exist_ok=True)
    AQ_PATH.write_text(json.dumps(data, indent=2), encoding="utf-8")


def aquarium_seed(text: str) -> int:
    text = text.strip()
    if not text:
        print("[aquarium] missing seed text")
        return 2
    data = load_aquarium()
    item = {
        "id": slugify(text)[:40] + "-" + dt.datetime.now().strftime("%H%M%S"),
        "title": text,
        "stage": "seed",
        "created": timestamp(),
    }
    data["items"].append(item)
    save_aquarium(data)
    print(f"[aquarium] seeded: {item['title']} ({item['id']})")
    return 0


def aquarium_grow(query: str) -> int:
    query = query.strip().lower()
    if not query:
        print("[aquarium] missing concept query")
        return 2
    data = load_aquarium()
    for item in reversed(data.get("items", [])):
        if query in item["title"].lower() or query in item["id"]:
            stage_order = ["seed", "coral", "reef"]
            idx = min(stage_order.index(item["stage"]) + 1, len(stage_order) - 1)
            item["stage"] = stage_order[idx]
            item["updated"] = timestamp()
            save_aquarium(data)
            print(f"[aquarium] grew '{item['title']}' -> {item['stage']}")
            return 0
    print("[aquarium] no matching concept found")
    return 3


def aquarium_retrieve(query: str) -> int:
    query = query.strip().lower()
    if not query:
        print("[aquarium] missing retrieve query")
        return 2
    data = load_aquarium()
    matches = [
        i for i in data.get("items", [])
        if query in i["title"].lower() or query in i["id"]
    ]
    if not matches:
        print("[aquarium] no matches")
        return 3
    print("[aquarium] matches:")
    for item in matches[-10:]:
        print(f"  - {item['id']} | {item['stage']} | {item['title']}")
    return 0


def aquarium_join_composer(name: str) -> int:
    name = " ".join(name.strip().split())
    if not name:
        print("[aquarium] missing composer name")
        return 2
    data = load_aquarium()
    normalized = name.lower()
    for composer in data.get("composer_guild", []):
        if composer.get("name", "").lower() == normalized:
            print(f"[aquarium] composer already in guild: {composer['name']}")
            return 0
    composer = {
        "id": f"composer-{slugify(name)}-{dt.datetime.now().strftime('%H%M%S')}",
        "name": name,
        "status": "composer",
        "joined": timestamp(),
        "source": "dreamchamber-aquarium",
    }
    data["composer_guild"].append(composer)
    save_aquarium(data)
    print(f"[aquarium] composer joined guild: {composer['name']} ({composer['id']})")
    return 0


def aquarium_promote_teacher(query: str) -> int:
    query = query.strip().lower()
    if not query:
        print("[aquarium] missing composer name or id for promotion")
        return 2
    data = load_aquarium()
    composers = data.get("composer_guild", [])
    candidate = None
    for composer in composers:
        name = composer.get("name", "").lower()
        composer_id = composer.get("id", "").lower()
        if query in name or query in composer_id:
            candidate = composer
            break
    if not candidate:
        print("[aquarium] no composer found for promotion")
        return 3

    candidate["status"] = "teacher"
    candidate["teacher_since"] = timestamp()

    teachers = data.get("noizykidz_teachers", [])
    if not any(t.get("id") == candidate.get("id") for t in teachers):
        teachers.append(
            {
                "id": candidate["id"],
                "name": candidate["name"],
                "joined": candidate.get("joined"),
                "teacher_since": candidate.get("teacher_since"),
            }
        )
    data["noizykidz_teachers"] = teachers
    save_aquarium(data)
    print(
        "[aquarium] promoted to NOIZYKIDZ Music AI Teacher: "
        f"{candidate['name']} ({candidate['id']})"
    )
    return 0


def aquarium_list_guild() -> int:
    data = load_aquarium()
    guild = data.get("composer_guild", [])
    if not guild:
        print("[aquarium] composer guild is empty")
        return 0
    print("[aquarium] composer guild:")
    for composer in guild[-25:]:
        print(
            f"  - {composer['id']} | {composer['status']} | {composer['name']}"
        )
    return 0


def aquarium_list_teachers() -> int:
    data = load_aquarium()
    teachers = data.get("noizykidz_teachers", [])
    if not teachers:
        print("[aquarium] no NOIZYKIDZ teachers yet")
        return 0
    print("[aquarium] NOIZYKIDZ Music AI Teachers:")
    for teacher in teachers[-25:]:
        print(
            f"  - {teacher['id']} | {teacher['name']} | since {teacher.get('teacher_since', 'n/a')}"
        )
    return 0


def main() -> int:
    if len(sys.argv) < 2:
        return usage()
    cmd = sys.argv[1].lower()
    if cmd == "activate":
        return activate()
    if cmd == "mode" and len(sys.argv) >= 3:
        return set_mode(sys.argv[2])
    if cmd == "research" and len(sys.argv) >= 3:
        return research(" ".join(sys.argv[2:]))
    if cmd == "pitch" and len(sys.argv) >= 3:
        return pitch(" ".join(sys.argv[2:]))
    if cmd == "prototype" and len(sys.argv) >= 3:
        return prototype(sys.argv[2])
    if cmd == "visualize" and len(sys.argv) >= 3:
        return visualize(sys.argv[2])
    if cmd == "aquarium" and len(sys.argv) >= 3:
        action = sys.argv[2].lower()
        arg = " ".join(sys.argv[3:]) if len(sys.argv) >= 4 else ""
        if action == "seed":
            return aquarium_seed(arg)
        if action == "grow":
            return aquarium_grow(arg)
        if action == "retrieve":
            return aquarium_retrieve(arg)
        if action == "join-composer":
            return aquarium_join_composer(arg)
        if action == "promote-teacher":
            return aquarium_promote_teacher(arg)
        if action == "list-guild":
            return aquarium_list_guild()
        if action == "list-teachers":
            return aquarium_list_teachers()
        print(f"[aquarium] unsupported action: {action}")
        return 2
    return usage()


if __name__ == "__main__":
    raise SystemExit(main())

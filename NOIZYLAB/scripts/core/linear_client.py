"""
linear_client — Gabriel's direct Linear API client.

Stdlib only. Talks to https://api.linear.app/graphql with a personal API key
from the LINEAR_API_KEY environment variable. If the key is missing, every
call returns a structured error so the gabriel_serve endpoints can degrade
gracefully instead of crashing.

Get a key: https://linear.app/settings/api → Personal API keys → Create new
Then: export LINEAR_API_KEY=lin_api_...
"""
from __future__ import annotations

import json
import os
import urllib.request
from typing import Any

LINEAR_URL = "https://api.linear.app/graphql"
TIMEOUT = 15


def _missing_key() -> dict:
    return {
        "ok": False,
        "error": "LINEAR_API_KEY not set",
        "hint": "export LINEAR_API_KEY=lin_api_... (get from linear.app/settings/api)",
    }


def query(graphql: str, variables: dict | None = None) -> dict:
    key = os.environ.get("LINEAR_API_KEY")
    if not key:
        return _missing_key()
    body = json.dumps({"query": graphql, "variables": variables or {}}).encode()
    req = urllib.request.Request(
        LINEAR_URL,
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": key,
            "User-Agent": "Gabriel/1.0 (NOIZY)",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            payload = json.loads(resp.read().decode())
        if "errors" in payload:
            return {"ok": False, "errors": payload["errors"]}
        return {"ok": True, "data": payload.get("data", {})}
    except Exception as e:
        return {"ok": False, "error": str(e)}


# ── High-level helpers ─────────────────────────────────────────────────────
def list_issues(team_key: str = "NOI", limit: int = 25, state: str | None = None) -> dict:
    filt = f'team: {{ key: {{ eq: "{team_key}" }} }}'
    if state:
        filt += f', state: {{ name: {{ eq: "{state}" }} }}'
    gql = f"""
    query {{
      issues(first: {limit}, filter: {{ {filt} }}, orderBy: updatedAt) {{
        nodes {{
          id identifier title priority dueDate updatedAt url
          state {{ name }}
          project {{ name }}
        }}
      }}
    }}"""
    return query(gql)


def critical_path(team_key: str = "NOI") -> dict:
    """Issues with a dueDate, sorted by urgency. Pure cache miss → API."""
    gql = f"""
    query {{
      issues(first: 50,
             filter: {{
               team: {{ key: {{ eq: "{team_key}" }} }},
               dueDate: {{ null: false }},
               state: {{ type: {{ nin: ["completed", "canceled"] }} }}
             }},
             orderBy: updatedAt) {{
        nodes {{
          id identifier title priority dueDate url
          state {{ name }}
          project {{ name }}
        }}
      }}
    }}"""
    result = query(gql)
    if not result.get("ok"):
        return result
    today = __import__("datetime").date.today().isoformat()
    nodes = result["data"]["issues"]["nodes"]
    overdue = [n for n in nodes if n["dueDate"] and n["dueDate"] < today]
    upcoming = [n for n in nodes if n["dueDate"] and n["dueDate"] >= today]
    return {"ok": True, "today": today, "overdue": overdue, "upcoming": upcoming}


def create_issue(title: str, team_key: str = "NOI", description: str = "", priority: int = 3) -> dict:
    # First we need the team UUID
    team_q = query(f'query {{ teams(filter: {{ key: {{ eq: "{team_key}" }} }}) {{ nodes {{ id }} }} }}')
    if not team_q.get("ok"):
        return team_q
    team_nodes = team_q["data"]["teams"]["nodes"]
    if not team_nodes:
        return {"ok": False, "error": f"team {team_key} not found"}
    team_id = team_nodes[0]["id"]
    gql = """
    mutation CreateIssue($title: String!, $teamId: String!, $desc: String, $priority: Int) {
      issueCreate(input: {title: $title, teamId: $teamId, description: $desc, priority: $priority}) {
        success
        issue { id identifier title url }
      }
    }"""
    return query(gql, {"title": title, "teamId": team_id, "desc": description, "priority": priority})


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("usage: linear_client.py {issues|critical|create <title>}")
        sys.exit(0)
    cmd = sys.argv[1]
    if cmd == "issues":
        print(json.dumps(list_issues(), indent=2))
    elif cmd == "critical":
        print(json.dumps(critical_path(), indent=2))
    elif cmd == "create" and len(sys.argv) > 2:
        print(json.dumps(create_issue(" ".join(sys.argv[2:])), indent=2))
    else:
        print("unknown command")

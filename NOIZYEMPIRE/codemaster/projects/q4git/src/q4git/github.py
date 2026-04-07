import json
import re
from typing import Dict, List, Optional
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .gittools import get_remotes

GITHUB_API = "https://api.github.com"


def _extract_github_repo(url: str) -> Optional[str]:
    # Supports:
    # - git@github.com:owner/repo.git
    # - https://github.com/owner/repo.git
    # - ssh://git@github.com/owner/repo.git
    pattern = r"github\.com[:/](?P<owner>[A-Za-z0-9_.-]+)/(?P<repo>[A-Za-z0-9_.-]+)(?:\.git)?$"
    match = re.search(pattern, url)
    if not match:
        return None
    owner = match.group("owner")
    repo = match.group("repo")
    return f"{owner}/{repo}"


def repo_from_remotes(remotes: List[str]) -> Optional[str]:
    for line in remotes:
        parts = line.split()
        if not parts:
            continue
        url = parts[1] if len(parts) > 1 else ""
        repo = _extract_github_repo(url)
        if repo:
            return repo
    return None


def api_get(path: str, token: Optional[str], params: Optional[Dict[str, str]] = None) -> Dict:
    query = f"?{urlencode(params)}" if params else ""
    req = Request(f"{GITHUB_API}{path}{query}")
    req.add_header("Accept", "application/vnd.github+json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with urlopen(req) as resp:
        raw = resp.read().decode("utf-8")
        return json.loads(raw)


def list_issues(owner_repo: str, token: Optional[str], state: str, limit: int) -> List[Dict]:
    params = {"state": state, "per_page": str(min(limit, 100))}
    data = api_get(f"/repos/{owner_repo}/issues", token, params)
    if not isinstance(data, list):
        return []
    return data[:limit]


def resolve_repo(cwd, token: Optional[str]) -> Optional[str]:
    remotes = get_remotes(cwd)
    return repo_from_remotes(remotes)

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


def _env_first(*names: str) -> Optional[str]:
    for name in names:
        value = os.getenv(name)
        if value:
            return value
    return None


@dataclass
class Config:
    repo_path: Path
    github_token: Optional[str]

    @classmethod
    def from_args(cls, repo: Optional[str]) -> "Config":
        repo_path = Path(repo or os.getcwd()).resolve()
        github_token = _env_first("GITHUB_TOKEN", "GITHUB_PERSONAL_ACCESS_TOKEN")
        return cls(repo_path=repo_path, github_token=github_token)

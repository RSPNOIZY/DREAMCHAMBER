from __future__ import annotations

from lib.gemma_orchestrator import parse_command


def test_parse_ingest() -> None:
    cmd = parse_command("ingest this session and analyze it")
    assert cmd.intent == "ingest"


def test_parse_deploy() -> None:
    cmd = parse_command("deploy the pack")
    assert cmd.intent == "deploy"

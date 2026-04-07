from __future__ import annotations

import httpx

from ..config import get_settings


def trigger_n8n(event: str, payload: dict) -> str:
    settings = get_settings()
    if not settings.n8n_webhook_url:
        return "n8n webhook not configured; event captured locally only"

    body = {"event": event, "payload": payload}
    try:
        response = httpx.post(settings.n8n_webhook_url, json=body, timeout=30)
        response.raise_for_status()
        return "n8n workflow triggered"
    except httpx.HTTPError as exc:
        return f"n8n webhook failed: {exc}"


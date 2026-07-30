import html as html_module
import json
import re

import httpx
from fastapi import APIRouter, HTTPException

from backend.app.config import settings

router = APIRouter(prefix="/api")


def _format_response(text: str, content_type: str) -> str:
    if "text/html" not in content_type:
        return text

    # Strip scripts, styles, and tags, then decode HTML entities
    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = html_module.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()

    if len(text) > 4000:
        text = text[:4000] + "\n\n[truncated]"
    return text


@router.post("/chat")
def chat(payload: dict) -> dict:
    message = payload.get("message", "")
    gateway = payload.get("gateway", settings.hermes_api_base_url).rstrip("/")
    gateway = gateway.replace("127.0.0.1:9119", "hermes-agent:9119").replace("127.0.0.1:8642", "hermes-agent:8642").replace("localhost:9119", "hermes-agent:9119").replace("localhost:8642", "hermes-agent:8642")
    endpoint = payload.get("endpoint", "v1/chat/completions").lstrip("/")
    timeout = payload.get("timeout", 30)

    if not message:
        raise HTTPException(status_code=400, detail="message is required")

    url = f"{gateway}/{endpoint}"
    username = payload.get("username") or settings.hermes_dashboard_username
    password = payload.get("password") or settings.hermes_dashboard_password

    auth = None
    headers = {}
    if username and password and "9119" in gateway:
        auth = httpx.BasicAuth(username, password)
    elif settings.hermes_api_server_key:
        headers["Authorization"] = f"Bearer {settings.hermes_api_server_key}"

    if "v1/chat/completions" in endpoint:
        body = {
            "model": payload.get("model", "hermes-agent"),
            "messages": [{"role": "user", "content": message}],
            "stream": False,
        }
    else:
        body = {"message": message}

    try:
        with httpx.Client(timeout=timeout, verify=False, follow_redirects=True) as client:
            resp = client.post(url, json=body, headers=headers, auth=auth)
            try:
                data = resp.json()
            except Exception:
                data = None

            if isinstance(data, dict) and "choices" in data:
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                model = data.get("model", "")
                usage = data.get("usage", {})
                prompt = usage.get("prompt_tokens", 0)
                completion = usage.get("completion_tokens", 0)
                total = usage.get("total_tokens", 0)
                response_text = content
                if model:
                    response_text += f"\n\nModel: {model}"
                if total:
                    response_text += f"\nTokens: {prompt} prompt / {completion} completion / {total} total"
            else:
                response_text = _format_response(resp.text, resp.headers.get("content-type", ""))

            return {"status": resp.status_code, "body": response_text}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Chat request failed: {e}")

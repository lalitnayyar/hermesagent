import os

import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api")


def _default_ollama_host() -> str:
    return os.getenv("OLLAMA_HOST", "http://host.docker.internal:11434")


@router.post("/ollama")
def ollama(payload: dict) -> dict:
    prompt = payload.get("message", "")
    model = payload.get("model", "gemma4:cloud")
    host = payload.get("host") or _default_ollama_host()
    if not prompt:
        raise HTTPException(status_code=400, detail="message is required")

    try:
        with httpx.Client(timeout=120, verify=False) as client:
            resp = client.post(
                f"{host}/api/generate",
                json={"model": model, "prompt": prompt, "stream": False},
            )
            data = resp.json()
            text = data.get("response") if isinstance(data, dict) else str(data)
            return {"status": resp.status_code, "body": text or str(data)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Ollama request failed: {e}")

import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api")


@router.post("/ollama")
def ollama(payload: dict) -> dict:
    prompt = payload.get("message", "")
    model = payload.get("model", "gemma4:cloud")
    if not prompt:
        raise HTTPException(status_code=400, detail="message is required")

    try:
        with httpx.Client(timeout=120, verify=False) as client:
            resp = client.post(
                "http://127.0.0.1:11434/api/generate",
                json={"model": model, "prompt": prompt, "stream": False},
            )
            data = resp.json()
            text = data.get("response") if isinstance(data, dict) else str(data)
            return {"status": resp.status_code, "body": text or str(data)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Ollama request failed: {e}")

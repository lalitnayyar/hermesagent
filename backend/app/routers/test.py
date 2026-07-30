import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api")


def _truncate(text: str, limit: int = 500) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + "..."


@router.post("/test")
def _resolve_url(url: str) -> str:
    return (url
            .replace("127.0.0.1:9119", "hermes-agent:9119")
            .replace("127.0.0.1:8642", "hermes-agent:8642")
            .replace("localhost:9119", "hermes-agent:9119")
            .replace("localhost:8642", "hermes-agent:8642")
            .replace("127.0.0.1:11434", "host.docker.internal:11434")
            .replace("localhost:11434", "host.docker.internal:11434"))


def test_connection(payload: dict) -> dict:
    url = _resolve_url(payload.get("url", "").rstrip("/"))
    if not url:
        raise HTTPException(status_code=400, detail="url is required")
    try:
        with httpx.Client(timeout=10, verify=False) as client:
            resp = client.get(url)
            body = _truncate(resp.text[:2000])
            return {
                "reachable": resp.status_code < 400,
                "status": resp.status_code,
                "body": body,
            }
    except Exception as e:
        return {"reachable": False, "error": str(e)}

import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api")


def _truncate(text: str, limit: int = 500) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + "..."


@router.post("/test")
def test_connection(payload: dict) -> dict:
    url = payload.get("url", "")
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

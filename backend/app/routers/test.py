import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api")


@router.post("/test")
def test_connection(payload: dict) -> dict:
    url = payload.get("url", "")
    if not url:
        raise HTTPException(status_code=400, detail="url is required")
    try:
        with httpx.Client(timeout=10, verify=False) as client:
            resp = client.get(url)
            return {
                "reachable": resp.status_code < 500,
                "status": resp.status_code,
            }
    except Exception as e:
        return {"reachable": False, "error": str(e)}

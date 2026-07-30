import httpx
from backend.app.config import settings
from backend.app.schemas import HermesHealth


class HermesClient:
    def __init__(self):
        self.base_url = settings.hermes_api_base_url.rstrip("/")
        self.timeout = settings.hermes_request_timeout
        self.headers = {}
        if settings.hermes_api_server_key:
            self.headers["Authorization"] = f"Bearer {settings.hermes_api_server_key}"

    def _client(self) -> httpx.Client:
        return httpx.Client(base_url=self.base_url, timeout=self.timeout, headers=self.headers, verify=settings.hermes_verify_tls)

    def health(self) -> dict:
        with self._client() as client:
            resp = client.get("/health")
            resp.raise_for_status()
            return resp.json()

    def get_sessions(self) -> list[dict]:
        with self._client() as client:
            resp = client.get("/api/sessions")
            if resp.status_code == 404:
                return []
            resp.raise_for_status()
            return resp.json()

    def create_job(self, payload: dict) -> dict:
        with self._client() as client:
            resp = client.post("/api/jobs", json=payload)
            resp.raise_for_status()
            return resp.json()

    def get_job(self, job_id: str) -> dict:
        with self._client() as client:
            resp = client.get(f"/api/jobs/{job_id}")
            resp.raise_for_status()
            return resp.json()


def hermes_health() -> HermesHealth:
    try:
        client = HermesClient()
        data = client.health()
        return HermesHealth(reachable=True, version=data.get("version"), error=None)
    except Exception as e:
        return HermesHealth(reachable=False, version=None, error=str(e))


def hermes_client() -> HermesClient:
    return HermesClient()

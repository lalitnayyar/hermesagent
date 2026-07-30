import asyncio
import threading
import time
from datetime import datetime
from typing import Any

from backend.app.config import settings
from backend.app.hermes_client import hermes_client


class Stream:
    def __init__(self, loop: asyncio.AbstractEventLoop, queue: asyncio.Queue):
        self.loop = loop
        self.queue = queue


class RunManager:
    def __init__(self):
        self._streams: dict[str, Stream] = {}
        self._buffers: dict[str, list[dict]] = {}

    def _utc_now(self) -> str:
        return datetime.utcnow().isoformat() + "Z"

    def create_stream(self, run_id: str) -> asyncio.Queue:
        if run_id in self._streams:
            return self._streams[run_id].queue
        loop = asyncio.get_running_loop()
        queue: asyncio.Queue = asyncio.Queue()
        self._streams[run_id] = Stream(loop, queue)
        # Replay any events that were emitted before the client connected.
        for event in self._buffers.get(run_id, []):
            loop.call_soon_threadsafe(queue.put_nowait, event)
        return queue

    def close_stream(self, run_id: str) -> None:
        self._streams.pop(run_id, None)

    def emit_sync(self, run_id: str, event: dict[str, Any]) -> None:
        event.setdefault("runId", run_id)
        event.setdefault("timestamp", self._utc_now())
        self._buffers.setdefault(run_id, []).append(event)
        stream = self._streams.get(run_id)
        if stream:
            stream.loop.call_soon_threadsafe(stream.queue.put_nowait, event)

    def start(self, run_id: str, run_type: str, payload: dict[str, Any]) -> None:
        threading.Thread(target=self._execute, args=(run_id, run_type, payload), daemon=True).start()

    def _execute(self, run_id: str, run_type: str, payload: dict[str, Any]) -> None:
        try:
            if settings.agentflow_simulation_mode:
                self._simulate(run_id, run_type, payload)
                return

            title = payload.get("title", "run")
            self.emit_sync(run_id, {"type": "status", "message": f"Connecting to Hermes for {run_type} '{title}'"})
            try:
                client = hermes_client()
                job = client.create_job({"type": run_type, "payload": payload})
                self.emit_sync(run_id, {"type": "status", "message": f"Hermes job created: {job.get('id', 'unknown')}"})
                for _ in range(300):
                    status = client.get_job(job["id"])
                    self.emit_sync(run_id, {"type": "status", "message": f"Status: {status.get('status')}"})
                    if status.get("status") in ("completed", "failed", "cancelled"):
                        self.emit_sync(run_id, {"type": "output", "data": status.get("output", "")})
                        break
                    time.sleep(1)
                self.emit_sync(run_id, {"type": "done", "status": status.get("status", "completed")})
            except Exception as e:
                self.emit_sync(run_id, {"type": "error", "message": f"Hermes connection failed: {e}. Falling back to simulation."})
                self._simulate(run_id, run_type, payload)
        finally:
            self.close_stream(run_id)

    def _simulate(self, run_id: str, run_type: str, payload: dict[str, Any]) -> None:
        title = payload.get("title", "run")
        steps = [
            {"type": "status", "message": f"Initializing {run_type} '{title}'"},
            {"type": "thought", "message": "Hermes simulation mode active."},
            {"type": "tool_call", "tool": "search", "args": {"query": title}},
            {"type": "tool_result", "tool": "search", "result": "Relevant context retrieved."},
            {"type": "output", "data": "Step 1 completed."},
            {"type": "output", "data": "Step 2 completed."},
            {"type": "output", "data": "Step 3 completed."},
            {"type": "status", "message": f"{run_type} '{title}' finished."},
        ]
        total = len(steps)
        for idx, step in enumerate(steps):
            progress = int((idx + 1) / total * 100)
            self.emit_sync(run_id, {**step, "progress": progress})
            time.sleep(0.8)
        self.emit_sync(run_id, {"type": "done", "status": "completed"})


run_manager = RunManager()

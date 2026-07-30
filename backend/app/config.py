from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = Path("/app/data" if __name__.startswith("app") else ROOT / "data")
DATABASE_URL_DEFAULT = f"sqlite:///{DATA_DIR}/database/agentflow.db"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Hermes AgentFlow Backend"
    app_version: str = "0.1.0"
    environment: str = "development"
    log_level: str = "INFO"

    host: str = "0.0.0.0"
    port: int = 8080
    cors_origins: list[str] = ["http://localhost:3080", "http://127.0.0.1:3080"]

    database_url: str = DATABASE_URL_DEFAULT
    database_dir: Path = DATA_DIR / "database"
    uploads_dir: Path = DATA_DIR / "uploads"
    reports_dir: Path = DATA_DIR / "reports"
    logs_dir: Path = DATA_DIR / "logs"
    backups_dir: Path = DATA_DIR / "backups"

    hermes_api_base_url: str = "http://hermes-agent:8642"
    hermes_gateway_url: str = "http://hermes-agent:9119"
    hermes_workspace_url: str = "http://hermes-workspace:3000"
    hermes_api_server_key: str = ""
    hermes_default_profile: str = "default"
    hermes_request_timeout: int = 300
    hermes_streaming_enabled: bool = True
    hermes_verify_tls: bool = False

    agentflow_secret_key: str = "change-me"
    agentflow_admin_username: str = "admin"
    agentflow_admin_password: str = "admin"
    agentflow_simulation_mode: bool = True
    agentflow_max_parallel_agents: int = 7
    agentflow_max_configured_agents: int = 25

    def ensure_dirs(self) -> None:
        for path in [self.database_dir, self.uploads_dir, self.reports_dir, self.logs_dir, self.backups_dir]:
            path.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_dirs()

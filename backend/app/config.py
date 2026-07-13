from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="ANNI_", env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./anni.db"
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"
    cors_origins: list[str] = ["http://localhost:3000"]


@lru_cache
def get_settings() -> Settings:
    return Settings()

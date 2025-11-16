import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_HOST: str = 'localhost'
    DB_PORT: int = 5432
    DB_NAME: str = 'scp-database'
    DB_USER: str = 'postgres'
    DB_PASSWORD: str = 'password'
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
    )


settings = Settings()


def get_db_url():
    return f"postgresql+asyncpg://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

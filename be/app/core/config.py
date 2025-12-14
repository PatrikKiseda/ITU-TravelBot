# Author:             Patrik Kišeda ( xkised00 )
# File:                   config.py
# Functionality :   application configuration settings

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, Field
from typing import List, Optional


class Settings(BaseSettings):
	# application settings loaded from environment variables
	model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

	ENV: str = Field(default="local")
	DB_URL: str = Field(default="sqlite:///./travelbot.db")
	ALLOWED_ORIGINS: str = Field(default="http://localhost:5173")
	OPENAI_API_KEY: Optional[str] = None
	OPENAI_MODEL: str = Field(default="gpt-4o-mini")
	IMAGE_PROVIDER: str = Field(default="stub")
	UNSPLASH_KEY: Optional[str] = None
	PEXELS_API_KEY: Optional[str] = None
	RATE_LIMIT_PER_MINUTE: int = Field(default=10)
	RATE_LIMIT_EXPLORE_PER_MINUTE: int = Field(default=10)

	def allowed_origins_list(self) -> List[str]:
		return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


settings = Settings()  # load once

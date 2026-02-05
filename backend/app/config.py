from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    comfyui_url: str = "http://comfyui:8890"
    image_output_dir: str = "/app/images"
    cors_origins: str = "http://localhost:8888,http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [s.strip() for s in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()

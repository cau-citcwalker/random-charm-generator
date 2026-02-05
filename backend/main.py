import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import gacha, generate, status, images, choices

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(title="Keyring Gacha API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gacha.router, prefix="/api")
app.include_router(generate.router, prefix="/api")
app.include_router(status.router, prefix="/api")
app.include_router(images.router, prefix="/api")
app.include_router(choices.router, prefix="/api")


@app.get("/api/health")
async def health():
    from app.services.comfyui_client import comfyui_client

    comfyui_ok = await comfyui_client.is_healthy()
    return {
        "status": "ok",
        "comfyui": "connected" if comfyui_ok else "unavailable",
    }

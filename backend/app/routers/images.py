from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.config import settings

router = APIRouter()


@router.get("/images/{generation_id}")
async def get_image(generation_id: str):
    image_path = Path(settings.image_output_dir) / f"{generation_id}.png"
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(image_path, media_type="image/png")

import uuid
import logging
from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.models.schemas import GenerateRequest, GenerateResponse
from app.services.prompt_builder import build_workflow
from app.services.comfyui_client import comfyui_client

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory store for generation tracking
# In production, use Redis or a database
generation_store: dict[str, dict] = {}


async def run_generation(generation_id: str, workflow: dict):
    """Background task that submits workflow to ComfyUI and tracks progress."""
    client_id = generation_id
    try:
        generation_store[generation_id]["status"] = "queued"
        prompt_id = await comfyui_client.queue_prompt(workflow, client_id)
        generation_store[generation_id]["prompt_id"] = prompt_id
        generation_store[generation_id]["status"] = "generating"

        async for event in comfyui_client.track_progress(prompt_id, client_id):
            generation_store[generation_id].update(event)
            if event["status"] in ("complete", "error"):
                break

        # If complete, fetch and save image
        if generation_store[generation_id].get("status") == "complete":
            filename = generation_store[generation_id].get("image_filename")
            subfolder = generation_store[generation_id].get("subfolder", "")
            if filename:
                image_data = await comfyui_client.get_image(filename, subfolder)
                from app.config import settings
                from pathlib import Path

                output_dir = Path(settings.image_output_dir)
                output_dir.mkdir(parents=True, exist_ok=True)
                image_path = output_dir / f"{generation_id}.png"
                image_path.write_bytes(image_data)
                generation_store[generation_id]["image_url"] = f"/api/images/{generation_id}"
                logger.info("Image saved: %s", image_path)

    except Exception as e:
        logger.error("Generation %s failed: %s", generation_id, e)
        generation_store[generation_id]["status"] = "error"
        generation_store[generation_id]["message"] = str(e)


@router.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest, background_tasks: BackgroundTasks):
    generation_id = str(uuid.uuid4())
    workflow = build_workflow(request)

    generation_store[generation_id] = {
        "status": "queued",
        "progress": 0,
    }

    background_tasks.add_task(run_generation, generation_id, workflow)

    return GenerateResponse(generation_id=generation_id)

import json
import asyncio
from fastapi import APIRouter
from starlette.responses import StreamingResponse

router = APIRouter()


@router.get("/status/{generation_id}")
async def generation_status(generation_id: str):
    async def event_stream():
        from app.routers.generate import generation_store

        last_progress = -1
        while True:
            data = generation_store.get(generation_id)
            if data is None:
                yield f"data: {json.dumps({'status': 'error', 'progress': 0, 'message': 'Not found'})}\n\n"
                return

            current_progress = data.get("progress", 0)
            status = data.get("status", "queued")

            # Only send update if progress changed or status is terminal
            if current_progress != last_progress or status in ("complete", "error"):
                event = {
                    "status": status,
                    "progress": current_progress,
                }
                if data.get("step") is not None:
                    event["step"] = data["step"]
                if data.get("total_steps") is not None:
                    event["total_steps"] = data["total_steps"]
                if data.get("image_url"):
                    event["image_url"] = data["image_url"]
                if data.get("message"):
                    event["message"] = data["message"]

                yield f"data: {json.dumps(event)}\n\n"
                last_progress = current_progress

                if status in ("complete", "error"):
                    return

            await asyncio.sleep(0.5)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )

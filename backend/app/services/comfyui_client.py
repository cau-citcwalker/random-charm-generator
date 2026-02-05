import json
import uuid
import asyncio
import logging
from typing import AsyncGenerator

import httpx
import websockets

from app.config import settings

logger = logging.getLogger(__name__)


class ComfyUIClient:
    def __init__(self):
        self.base_url = settings.comfyui_url
        self.ws_url = settings.comfyui_url.replace("http", "ws")

    async def is_healthy(self) -> bool:
        """Check if ComfyUI is reachable."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/system_stats",
                    timeout=5.0,
                )
                return response.status_code == 200
        except Exception:
            return False

    async def queue_prompt(self, workflow: dict, client_id: str) -> str:
        """Submit a workflow to ComfyUI and return the prompt_id."""
        payload = {
            "prompt": workflow,
            "client_id": client_id,
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/prompt",
                json=payload,
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()
            return data["prompt_id"]

    async def track_progress(
        self, prompt_id: str, client_id: str
    ) -> AsyncGenerator[dict, None]:
        """Connect to ComfyUI WebSocket and yield progress events.

        ComfyUI WebSocket event flow:
        1. status         - queue info
        2. execution_start - prompt begins
        3. executing      - each node starts (node=id), prompt done when node=null
        4. progress       - KSampler step progress
        5. executed        - node output (SaveImage has images array)
        6. execution_error - on failure
        """
        ws_url = f"{self.ws_url}/ws?clientId={client_id}"
        image_info = None

        try:
            async with websockets.connect(ws_url) as ws:
                async for message in ws:
                    if isinstance(message, bytes):
                        # ComfyUI sends binary preview frames — skip them
                        continue

                    data = json.loads(message)
                    msg_type = data.get("type")

                    if msg_type == "progress":
                        # KSampler step-by-step progress
                        msg_data = data.get("data", {})
                        if msg_data.get("prompt_id", prompt_id) == prompt_id:
                            value = msg_data["value"]
                            max_val = msg_data["max"]
                            yield {
                                "status": "generating",
                                "progress": value / max_val,
                                "step": value,
                                "total_steps": max_val,
                            }

                    elif msg_type == "executed":
                        # A node finished — only SaveImage nodes produce images
                        msg_data = data.get("data", {})
                        if msg_data.get("prompt_id") == prompt_id:
                            output = msg_data.get("output", {})
                            images = output.get("images", [])
                            if images:
                                image_info = images[0]
                                logger.info(
                                    "Image output captured: %s",
                                    image_info.get("filename"),
                                )

                    elif msg_type == "executing":
                        # node=null signals prompt execution is complete
                        msg_data = data.get("data", {})
                        if msg_data.get("prompt_id") == prompt_id:
                            if msg_data.get("node") is None:
                                if image_info:
                                    yield {
                                        "status": "complete",
                                        "progress": 1.0,
                                        "image_filename": image_info.get("filename"),
                                        "subfolder": image_info.get("subfolder", ""),
                                    }
                                else:
                                    yield {
                                        "status": "complete",
                                        "progress": 1.0,
                                    }
                                return

                    elif msg_type == "execution_error":
                        msg_data = data.get("data", {})
                        if msg_data.get("prompt_id") == prompt_id:
                            error_msg = msg_data.get(
                                "exception_message",
                                msg_data.get("traceback", "Unknown error"),
                            )
                            logger.error("ComfyUI execution error: %s", error_msg)
                            yield {
                                "status": "error",
                                "progress": 0,
                                "message": str(error_msg),
                            }
                            return

        except websockets.exceptions.ConnectionClosedError as e:
            logger.error("WebSocket connection closed: %s", e)
            yield {
                "status": "error",
                "progress": 0,
                "message": f"WebSocket connection lost: {e}",
            }
        except Exception as e:
            logger.error("ComfyUI tracking error: %s", e)
            yield {
                "status": "error",
                "progress": 0,
                "message": str(e),
            }

    async def get_image(self, filename: str, subfolder: str = "") -> bytes:
        """Fetch a generated image from ComfyUI."""
        params = {"filename": filename, "subfolder": subfolder, "type": "output"}
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/view",
                params=params,
                timeout=30.0,
            )
            response.raise_for_status()
            return response.content


comfyui_client = ComfyUIClient()

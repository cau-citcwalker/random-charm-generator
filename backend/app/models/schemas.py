from pydantic import BaseModel


class GachaSpinResponse(BaseModel):
    base_element: str
    display_name: str
    rarity: str
    icon: str


class GenerateRequest(BaseModel):
    base_element: str
    potions: list[str]
    shape: str
    pattern: str
    color: str


class GenerateResponse(BaseModel):
    generation_id: str


class StatusEvent(BaseModel):
    status: str
    progress: float
    step: int | None = None
    total_steps: int | None = None
    image_url: str | None = None
    message: str | None = None


class PotionMeta(BaseModel):
    id: str
    name: str
    color: str
    icon: str


class ColorMeta(BaseModel):
    id: str
    hex: str
    name: str


class ChoicesResponse(BaseModel):
    potions: list[PotionMeta]
    shapes: list[str]
    patterns: list[str]
    colors: list[ColorMeta]

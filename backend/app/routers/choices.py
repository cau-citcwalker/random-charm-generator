from fastapi import APIRouter
from app.models.schemas import ChoicesResponse, PotionMeta, ColorMeta

router = APIRouter()

POTIONS = [
    PotionMeta(id="potion_a", name="별빛 정수", color="#FFD700", icon="star-bottle"),
    PotionMeta(id="potion_b", name="그림자 잉크", color="#2D1B69", icon="dark-bottle"),
    PotionMeta(id="potion_c", name="숲의 이슬", color="#2ECC71", icon="leaf-bottle"),
    PotionMeta(id="potion_d", name="바다의 눈물", color="#3498DB", icon="water-bottle"),
    PotionMeta(id="potion_e", name="불사조 재", color="#E74C3C", icon="fire-bottle"),
    PotionMeta(id="potion_f", name="서리꽃", color="#85C1E9", icon="ice-bottle"),
    PotionMeta(id="potion_g", name="꿀 넥타르", color="#F39C12", icon="honey-bottle"),
    PotionMeta(id="potion_h", name="꿈의 안개", color="#D7BDE2", icon="dream-bottle"),
]

SHAPES = ["circle", "star", "heart", "hexagon", "cloud", "diamond"]

PATTERNS = ["swirl", "dots", "stripes", "floral", "geometric", "plain"]

COLORS = [
    ColorMeta(id="ocean_blue", hex="#006994", name="오션 블루"),
    ColorMeta(id="sunset_pink", hex="#FF6B6B", name="선셋 핑크"),
    ColorMeta(id="forest_green", hex="#228B22", name="포레스트 그린"),
    ColorMeta(id="royal_purple", hex="#7851A9", name="로열 퍼플"),
    ColorMeta(id="golden", hex="#FFD700", name="골든"),
    ColorMeta(id="midnight", hex="#191970", name="미드나잇"),
    ColorMeta(id="rose", hex="#FF007F", name="로즈"),
    ColorMeta(id="mint", hex="#98FF98", name="민트"),
]


@router.get("/choices", response_model=ChoicesResponse)
async def get_choices():
    return ChoicesResponse(
        potions=POTIONS,
        shapes=SHAPES,
        patterns=PATTERNS,
        colors=COLORS,
    )

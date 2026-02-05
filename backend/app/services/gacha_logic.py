import random
from app.models.schemas import GachaSpinResponse

BASE_ELEMENTS = [
    {
        "base_element": "crystal",
        "display_name": "신비한 크리스탈",
        "rarity": "rare",
        "icon": "💎",
        "weight": 10,
    },
    {
        "base_element": "wood",
        "display_name": "나무 조각",
        "rarity": "common",
        "icon": "🪵",
        "weight": 25,
    },
    {
        "base_element": "metal",
        "display_name": "금속 파편",
        "rarity": "common",
        "icon": "⚙️",
        "weight": 25,
    },
    {
        "base_element": "plush",
        "display_name": "봉제 인형",
        "rarity": "uncommon",
        "icon": "🧸",
        "weight": 15,
    },
    {
        "base_element": "glass",
        "display_name": "유리 구슬",
        "rarity": "uncommon",
        "icon": "🔮",
        "weight": 15,
    },
    {
        "base_element": "clay",
        "display_name": "점토 덩어리",
        "rarity": "common",
        "icon": "🏺",
        "weight": 20,
    },
    {
        "base_element": "resin",
        "display_name": "레진 캡슐",
        "rarity": "rare",
        "icon": "💧",
        "weight": 10,
    },
    {
        "base_element": "enchanted",
        "display_name": "마법의 정수",
        "rarity": "legendary",
        "icon": "✨",
        "weight": 5,
    },
]


def spin_gacha() -> GachaSpinResponse:
    weights = [e["weight"] for e in BASE_ELEMENTS]
    chosen = random.choices(BASE_ELEMENTS, weights=weights, k=1)[0]
    return GachaSpinResponse(
        base_element=chosen["base_element"],
        display_name=chosen["display_name"],
        rarity=chosen["rarity"],
        icon=chosen["icon"],
    )

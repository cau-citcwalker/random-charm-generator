from fastapi import APIRouter
from app.models.schemas import GachaSpinResponse
from app.services.gacha_logic import spin_gacha

router = APIRouter()


@router.post("/gacha/spin", response_model=GachaSpinResponse)
async def gacha_spin():
    return spin_gacha()

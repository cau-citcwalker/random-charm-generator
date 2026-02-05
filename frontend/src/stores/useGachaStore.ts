import { create } from 'zustand'
import type { Screen, GachaType, GenerationStatus, BaseElement } from '@/types/choices'

interface GachaState {
  // 현재 화면
  screen: Screen
  setScreen: (screen: Screen) => void

  // 가챠 타입 (랜덤 선택)
  gachaType: GachaType
  randomizeGachaType: () => void

  // 가챠 결과 (기본 재질)
  baseElement: BaseElement | null
  setBaseElement: (element: BaseElement) => void

  // 포션 선택 (제한 없음)
  selectedPotions: string[]
  addPotion: (potionId: string) => void
  removePotion: (potionId: string) => void
  clearPotions: () => void

  // 결합 선택
  selectedShape: string | null
  selectedPattern: string | null
  selectedColor: string | null
  setShape: (shape: string) => void
  setPattern: (pattern: string) => void
  setColor: (color: string) => void

  // 이미지 생성
  generationId: string | null
  generationStatus: GenerationStatus
  generationProgress: number
  imageUrl: string | null
  setGenerationId: (id: string) => void
  setGenerationStatus: (status: GenerationStatus) => void
  setGenerationProgress: (progress: number) => void
  setImageUrl: (url: string) => void

  // 전체 리셋
  reset: () => void
}

const GACHA_TYPES: GachaType[] = ['shell', 'machine', 'roulette']

const initialState = {
  screen: 'title' as Screen,
  gachaType: 'shell' as GachaType,
  baseElement: null,
  selectedPotions: [] as string[],
  selectedShape: null,
  selectedPattern: null,
  selectedColor: null,
  generationId: null,
  generationStatus: 'idle' as GenerationStatus,
  generationProgress: 0,
  imageUrl: null,
}

export const useGachaStore = create<GachaState>((set) => ({
  ...initialState,

  setScreen: (screen) => set({ screen }),

  randomizeGachaType: () =>
    set({ gachaType: GACHA_TYPES[Math.floor(Math.random() * GACHA_TYPES.length)] }),

  setBaseElement: (element) => set({ baseElement: element }),

  addPotion: (potionId) =>
    set((state) => ({
      selectedPotions: state.selectedPotions.includes(potionId)
        ? state.selectedPotions
        : [...state.selectedPotions, potionId],
    })),

  removePotion: (potionId) =>
    set((state) => ({
      selectedPotions: state.selectedPotions.filter((id) => id !== potionId),
    })),

  clearPotions: () => set({ selectedPotions: [] }),

  setShape: (shape) => set({ selectedShape: shape }),
  setPattern: (pattern) => set({ selectedPattern: pattern }),
  setColor: (color) => set({ selectedColor: color }),

  setGenerationId: (id) => set({ generationId: id }),
  setGenerationStatus: (status) => set({ generationStatus: status }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  setImageUrl: (url) => set({ imageUrl: url }),

  reset: () => set(initialState),
}))

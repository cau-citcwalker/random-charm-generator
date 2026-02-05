export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'

export interface BaseElement {
  base_element: string
  display_name: string
  rarity: Rarity
  icon: string
}

export interface Potion {
  id: string
  name: string
  color: string
  icon: string
}

export interface ColorOption {
  id: string
  hex: string
  name: string
}

export interface ChoicesMetadata {
  potions: Potion[]
  shapes: string[]
  patterns: string[]
  colors: ColorOption[]
}

export type Screen =
  | 'title'
  | 'gacha'
  | 'potion'
  | 'combination'
  | 'generation'

export type GachaType = 'shell' | 'machine' | 'roulette'

export type GenerationStatus = 'idle' | 'queued' | 'generating' | 'complete' | 'error'

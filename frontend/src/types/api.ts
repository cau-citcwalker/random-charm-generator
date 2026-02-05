import type { BaseElement, ChoicesMetadata } from './choices'

export interface GachaSpinResponse extends BaseElement {}

export interface GenerateRequest {
  base_element: string
  potions: string[]
  shape: string
  pattern: string
  color: string
}

export interface GenerateResponse {
  generation_id: string
}

export interface StatusEvent {
  status: 'queued' | 'generating' | 'complete' | 'error'
  progress: number
  step?: number
  total_steps?: number
  image_url?: string
  message?: string
}

export interface ChoicesResponse extends ChoicesMetadata {}

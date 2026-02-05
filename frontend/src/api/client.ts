import type {
  GachaSpinResponse,
  GenerateRequest,
  GenerateResponse,
  StatusEvent,
  ChoicesResponse,
} from '@/types/api'

const API_BASE = '/api'

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function gachaSpin(): Promise<GachaSpinResponse> {
  return fetchJson<GachaSpinResponse>('/gacha/spin', { method: 'POST' })
}

export async function submitGenerate(request: GenerateRequest): Promise<GenerateResponse> {
  return fetchJson<GenerateResponse>('/generate', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export async function getChoices(): Promise<ChoicesResponse> {
  return fetchJson<ChoicesResponse>('/choices')
}

export function subscribeToStatus(
  generationId: string,
  onEvent: (event: StatusEvent) => void,
  onError?: (error: Event) => void,
): EventSource {
  const eventSource = new EventSource(`${API_BASE}/status/${generationId}`)

  eventSource.onmessage = (e) => {
    const data: StatusEvent = JSON.parse(e.data)
    onEvent(data)
    if (data.status === 'complete' || data.status === 'error') {
      eventSource.close()
    }
  }

  eventSource.onerror = (e) => {
    onError?.(e)
    eventSource.close()
  }

  return eventSource
}

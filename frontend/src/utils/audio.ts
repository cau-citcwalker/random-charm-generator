let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {
    // Web Audio API not available
  }
}

export function playClick() {
  playTone(800, 0.08, 'square', 0.15)
}

export function playGachaReveal() {
  playTone(523, 0.15, 'sine', 0.25)
  setTimeout(() => playTone(659, 0.15, 'sine', 0.25), 100)
  setTimeout(() => playTone(784, 0.3, 'sine', 0.3), 200)
}

export function playPotionDrop() {
  playTone(300, 0.2, 'sine', 0.2)
  setTimeout(() => playTone(500, 0.15, 'sine', 0.15), 80)
}

export function playShuffle() {
  playTone(200, 0.1, 'triangle', 0.15)
}

export function playComplete() {
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'sine', 0.25), i * 150)
  })
}

export function playError() {
  playTone(200, 0.3, 'sawtooth', 0.15)
  setTimeout(() => playTone(150, 0.4, 'sawtooth', 0.15), 200)
}

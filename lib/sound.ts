// Web Audio API 기반 효과음 생성기 (파일 없이 순수 코드로 생성)

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  return ctx
}

function playTone(
  frequency: number, type: OscillatorType, duration: number,
  volume = 0.3, delay = 0, freqEnd?: number
) {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = type
    osc.frequency.setValueAtTime(frequency, c.currentTime + delay)
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + delay + duration)
    gain.gain.setValueAtTime(volume, c.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration)
    osc.start(c.currentTime + delay)
    osc.stop(c.currentTime + delay + duration)
  } catch (e) {}
}

// 정답 효과음 — 밝고 경쾌한 두 음
export function playCorrect() {
  playTone(523, 'sine', 0.12, 0.3, 0)      // C5
  playTone(659, 'sine', 0.18, 0.3, 0.1)    // E5
  playTone(784, 'sine', 0.22, 0.3, 0.2)    // G5
}

// 오답 효과음 — 낮고 짧은 버즈
export function playWrong() {
  playTone(200, 'sawtooth', 0.15, 0.25, 0)
  playTone(150, 'sawtooth', 0.15, 0.2, 0.1)
}

// 콤보 효과음 — 올라가는 음계
export function playCombo(level: number) {
  const base = 400 + level * 80
  playTone(base, 'sine', 0.1, 0.3, 0)
  playTone(base * 1.2, 'sine', 0.1, 0.3, 0.08)
  playTone(base * 1.5, 'sine', 0.15, 0.35, 0.16)
  if (level >= 5) {
    playTone(base * 2, 'sine', 0.2, 0.4, 0.26)
  }
}

// 아이템 획득 효과음 — 반짝이는 느낌
export function playItemGet() {
  playTone(880, 'sine', 0.1, 0.25, 0)
  playTone(1100, 'sine', 0.1, 0.25, 0.08)
  playTone(1320, 'sine', 0.12, 0.3, 0.16)
  playTone(1760, 'sine', 0.15, 0.35, 0.24)
}

// 아이템 사용 효과음
export function playItemUse() {
  playTone(600, 'triangle', 0.08, 0.2, 0)
  playTone(800, 'triangle', 0.1, 0.2, 0.07)
}

// 룰렛 틱 효과음 — 빠른 클릭 소리
export function playRouletteTick() {
  playTone(800, 'square', 0.05, 0.15, 0)
}

// 룰렛 완료 효과음
export function playRouletteDone() {
  playTone(440, 'sine', 0.1, 0.3, 0)
  playTone(554, 'sine', 0.1, 0.3, 0.1)
  playTone(659, 'sine', 0.1, 0.3, 0.2)
  playTone(880, 'sine', 0.2, 0.35, 0.3)
}

// 결과 완료 (통과)
export function playSuccess() {
  const notes = [523, 659, 784, 1047]
  notes.forEach((f, i) => playTone(f, 'sine', 0.18, 0.3, i * 0.1))
}

// 결과 완료 (실패)
export function playFail() {
  playTone(400, 'sine', 0.2, 0.25, 0, 250)
  playTone(280, 'sine', 0.2, 0.2, 0.25, 200)
}

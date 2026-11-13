/**
 * Draws the movie still for the screen: a warm desert at sunset.
 * Generated in code on a <canvas>, so there are no image licensing issues.
 * Everything is deterministic (no randomness), so it looks the same every time.
 */
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

type DuneLayer = {
  /** Ridge height as a fraction of the image height (0 = top). */
  base: number
  /** Sine waves that shape the ridge: [amplitude (fraction of height), frequency, phase]. */
  waves: [number, number, number][]
  /** Sunlit top colour → shadowed bottom colour. */
  light: string
  shadow: string
}

// Far → near. Nearer dunes are taller, darker and have bigger curves.
const DUNES: DuneLayer[] = [
  {
    base: 0.6,
    waves: [
      [0.02, 2.1, 0.4],
      [0.01, 5.3, 1.7],
    ],
    light: '#e9925a',
    shadow: '#b9603e',
  },
  {
    base: 0.66,
    waves: [
      [0.035, 1.6, 2.2],
      [0.012, 4.1, 0.3],
    ],
    light: '#d8743f',
    shadow: '#9c4a2c',
  },
  {
    base: 0.75,
    waves: [
      [0.05, 1.2, 4.0],
      [0.015, 3.3, 2.6],
    ],
    light: '#c05a2f',
    shadow: '#7a3420',
  },
  {
    base: 0.87,
    waves: [
      [0.06, 0.9, 1.1],
      [0.02, 2.7, 5.2],
    ],
    light: '#8f3d22',
    shadow: '#4a1c12',
  },
]

/** y position of a dune ridge at horizontal position u (0 … 1). */
function ridgeY(layer: DuneLayer, u: number, height: number): number {
  let y = layer.base
  for (const [amp, freq, phase] of layer.waves) y += amp * Math.sin(u * freq * Math.PI * 2 + phase)
  return y * height
}

export function createDesertTexture(width = 1520, height = 800): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const horizon = height * 0.62

  // 1. Sky: dusky purple at the top to warm orange at the horizon.
  const sky = ctx.createLinearGradient(0, 0, 0, horizon)
  sky.addColorStop(0, '#2a1a3c')
  sky.addColorStop(0.4, '#8c3f5c')
  sky.addColorStop(0.75, '#ec8048')
  sky.addColorStop(1, '#ffc480')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, width, height)

  // 2. Sun: a big soft glow plus a bright disc, sitting just above the dunes.
  const sunX = width * 0.64
  const sunY = horizon - height * 0.08
  const sunR = height * 0.075
  const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.5, sunX, sunY, sunR * 6)
  glow.addColorStop(0, 'rgba(255, 214, 140, 0.75)')
  glow.addColorStop(1, 'rgba(255, 170, 100, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#fff1cf'
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
  ctx.fill()

  // 3. Dunes, far to near. Each is filled with a top-lit gradient and gets a thin bright rim.
  for (const layer of DUNES) {
    const top = layer.base * height - 0.1 * height
    const fill = ctx.createLinearGradient(0, top, 0, height)
    fill.addColorStop(0, layer.light)
    fill.addColorStop(1, layer.shadow)

    ctx.beginPath()
    ctx.moveTo(0, height)
    for (let x = 0; x <= width; x += 8) ctx.lineTo(x, ridgeY(layer, x / width, height))
    ctx.lineTo(width, height)
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()

    ctx.beginPath()
    for (let x = 0; x <= width; x += 8) ctx.lineTo(x, ridgeY(layer, x / width, height))
    ctx.strokeStyle = 'rgba(255, 220, 170, 0.35)'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  // The screen is seen from the inside of a cylinder, which mirrors the image; flip it back.
  texture.wrapS = RepeatWrapping
  texture.repeat.x = -1
  return texture
}

/** Soft radial glow used as a halo behind the screen. */
export function createGlowTexture(size = 256, rgb = '255, 170, 120'): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, `rgba(${rgb}, 0.5)`)
  gradient.addColorStop(0.5, `rgba(${rgb}, 0.14)`)
  gradient.addColorStop(0.85, `rgba(${rgb}, 0)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

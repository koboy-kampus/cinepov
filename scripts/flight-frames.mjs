/**
 * Steps through the map -> 3D transition frame by frame and saves each frame,
 * so the flight can be checked for jumps or flashes regardless of how fast
 * the (software-rendered, headless) browser draws.
 *
 * Needs the dev server (npm run dev). Usage:
 *   node scripts/flight-frames.mjs [seat] [frames]
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173'
const SEAT = process.argv[2] ?? 'F8'
const FRAMES = Number(process.argv[3] ?? 30)
const OUT_DIR = `.screenshots/flight-${SEAT}`

await mkdir(OUT_DIR, { recursive: true })
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message))
page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()))
await page.goto(BASE_URL, { waitUntil: 'networkidle' })
await page.click(`[data-seat="${SEAT}"]`)
await page.waitForTimeout(400)
await page.click('[data-continue]')
await page.waitForSelector('canvas')
// Let the real transition finish, then take control of the timeline.
await page.waitForTimeout(4000)

await page.evaluate(async () => {
  const { stageProgress } = await import('/src/store/useStage.ts')
  window.__stage = stageProgress
})
for (let i = 0; i <= FRAMES; i++) {
  const T = i / FRAMES
  await page.evaluate((t) => window.__stage.jump(t), T)
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${OUT_DIR}/${String(i).padStart(3, '0')}.png` })
}
console.log('saved', FRAMES + 1, 'frames to', OUT_DIR)
await browser.close()

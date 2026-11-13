/**
 * Records a real-time video of map -> 3D -> map with Playwright, to look
 * for flashes, frozen frames or pops. Headless Chromium renders WebGL in
 * software, so the frame rate is low; judge smoothness on a real device.
 *
 * Needs the dev server (npm run dev). Usage:
 *   node scripts/record-flight.mjs [seat]
 * Saves .screenshots/flight-<seat>.webm
 */
import { mkdir, rename } from 'node:fs/promises'
import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173'
const SEAT = process.argv[2] ?? 'F8'
const OUT_DIR = '.screenshots'
const size = { width: 390, height: 844 }

await mkdir(OUT_DIR, { recursive: true })
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const context = await browser.newContext({
  viewport: size,
  recordVideo: { dir: `${OUT_DIR}/video-tmp`, size },
})
const page = await context.newPage()
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message))
await page.goto(BASE_URL, { waitUntil: 'networkidle' })
await page.click(`[data-seat="${SEAT}"]`)
await page.waitForTimeout(800)
await page.click('[data-continue]')
await page.getByText(`View from ${SEAT}`).waitFor({ timeout: 20000 })
await page.waitForTimeout(1200)
await page.getByRole('button', { name: /back to seats|change seat/i }).click()
await page.locator('[data-continue]').waitFor({ state: 'visible' })
await page.waitForTimeout(2500)
const video = page.video()
await context.close()
await rename(await video.path(), `${OUT_DIR}/flight-${SEAT}.webm`)
await browser.close()
console.log(`saved ${OUT_DIR}/flight-${SEAT}.webm`)

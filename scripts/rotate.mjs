/**
 * Rotates the "phone" mid-flight and while seated, and checks that the
 * layout and the camera recover: no page scroll, the seat details in the
 * right place, and the flight back to the map still working.
 *
 * Needs the dev server (npm run dev), which exposes window.__cinepov.
 * Usage: node scripts/rotate.mjs [seat]
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173'
const SEAT = process.argv[2] ?? 'F8'
const OUT_DIR = '.screenshots/rotate'
const PORTRAIT = { width: 390, height: 844 }
const LANDSCAPE = { width: 844, height: 390 }

await mkdir(OUT_DIR, { recursive: true })
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage({ viewport: PORTRAIT, deviceScaleFactor: 2 })
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message))

let step = 0
async function shot(name) {
  const state = await page.evaluate(() => {
    const sheet = document.querySelector('section[aria-labelledby="seat-sheet-title"]')
    const r = sheet?.getBoundingClientRect()
    return {
      scrolls: document.scrollingElement.scrollHeight > window.innerHeight,
      sheet: r && [r.left, r.top, r.width, r.height].map(Math.round),
    }
  })
  const file = `${OUT_DIR}/${String(++step).padStart(2, '0')}-${name}.png`
  await page.screenshot({ path: file })
  console.log(file, JSON.stringify(state))
}

await page.goto(BASE_URL, { waitUntil: 'networkidle' })
await page.click(`[data-seat="${SEAT}"]`)
await page.waitForTimeout(400)
await page.click('[data-continue]')
await page.waitForSelector('canvas')
// Rotate when the flight is about half way.
await page.waitForFunction(() => window.__cinepov.stageProgress.get() > 0.4, null, {
  timeout: 30000,
  polling: 50,
})
await page.setViewportSize(LANDSCAPE)
await shot('rotated-mid-flight')
await page.getByText(`View from ${SEAT}`).waitFor({ timeout: 30000 })
await page.waitForTimeout(900)
await shot('landed-sideways')

await page.setViewportSize(PORTRAIT)
await page.waitForTimeout(1200)
await shot('seated-back-to-portrait')

await page.setViewportSize(LANDSCAPE)
await page.waitForTimeout(1200)
await shot('seated-sideways-again')

await page.getByRole('button', { name: 'Change seat' }).click()
await page.waitForFunction(
  () => {
    const { stageProgress, useStage } = window.__cinepov
    return stageProgress.get() === 0 && useStage.getState().settled
  },
  null,
  { timeout: 30000, polling: 100 },
)
await page.waitForTimeout(300)
await shot('back-on-map-sideways')
const focused = await page.evaluate(() => document.activeElement?.hasAttribute('data-continue'))
console.log('focus back on Continue:', focused)
await browser.close()

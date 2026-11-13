/**
 * Takes screenshots of the running app at phone and desktop sizes.
 *
 * Usage: start the dev server (npm run dev), then in another terminal:
 *   npm run screenshots              -> uses http://localhost:5173
 *   BASE_URL=http://localhost:4173 npm run screenshots
 *
 * Images are saved to .screenshots/ (gitignored).
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT_DIR = '.screenshots'

const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'phone-short', width: 375, height: 667 },
  { name: 'desktop', width: 1440, height: 900 },
]

/** Each scene: a name, an optional URL query, and steps to get the page into that state. */
const SCENES = [
  { name: 'map-empty', steps: async () => {} },
  {
    name: 'map-selected-F8',
    steps: async (page) => {
      await page.click('[data-seat="F8"]')
      await page.waitForTimeout(400) // let the bottom bar animation finish
    },
  },
  // 3D views from seats with different tags (Up close, Sweet spot, Full picture, Side view)
  ...['B4', 'F8', 'I8', 'A1'].map((seat) => ({
    name: `pov-${seat}`,
    query: `?seat=${seat}`,
    steps: async (page) => {
      // The pill appears when the camera has landed (after the flight).
      await page.getByText(`View from ${seat}`).waitFor({ timeout: 30000 })
      await page.waitForTimeout(800) // let the sheet finish sliding in
    },
  })),
]

await mkdir(OUT_DIR, { recursive: true })
// Software WebGL so the 3D scene renders in headless mode (slow, but fine for screenshots).
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})

for (const viewport of VIEWPORTS) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
  })
  for (const scene of SCENES) {
    await page.goto(BASE_URL + (scene.query ?? ''), { waitUntil: 'networkidle' })
    await scene.steps(page)
    const file = `${OUT_DIR}/${scene.name}-${viewport.name}.png`
    await page.screenshot({ path: file })
    console.log('saved', file)
  }
  await page.close()
}

await browser.close()

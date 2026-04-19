/**
 * Capture README screenshots from a running MedCare UI (local or deployed).
 *
 * Prerequisites: API + UI running, database seeded (see server `npm run seed:demo`).
 *
 *   cd client && npm install && npx playwright install chromium
 *   MEDCARE_SCREENSHOT_URL=https://your-app.example npm run readme:screenshots
 *
 * Default base URL: http://localhost:5173
 */
import fs from 'fs'
import path from 'path'
import { setTimeout as sleep } from 'timers/promises'
import { fileURLToPath } from 'url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..', '..')
const outDir = path.join(repoRoot, 'docs', 'screenshots')

const baseURL = (process.env.MEDCARE_SCREENSHOT_URL || 'http://localhost:5173').replace(/\/$/, '')

const shots = [
  { path: '/', file: 'dashboard.png' },
  { path: '/patients', file: 'patients.png' },
  { path: '/appointments', file: 'appointments.png' },
  { path: '/billing', file: 'billing.png' },
  { path: '/doctors', file: 'doctors.png' },
]

fs.mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})
const page = await context.newPage()

for (const { path: routePath, file } of shots) {
  const url = `${baseURL}${routePath}`
  process.stdout.write(`Capturing ${url} → ${file} ... `)
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
    await page.waitForSelector('main', { state: 'visible', timeout: 30_000 })
    await sleep(1200)
    await page.screenshot({
      path: path.join(outDir, file),
      fullPage: false,
    })
    console.log('ok')
  } catch (e) {
    console.log('failed')
    console.error(e.message)
    await browser.close()
    process.exit(1)
  }
}

await browser.close()
console.log(`Screenshots saved under ${path.relative(repoRoot, outDir)}`)

/* QA af et fags emnesider i headless Chromium.
   For hvert emne: vent på figuren, klik alle trin igennem, mål pladens højde
   efter hvert trin (skal være konstant), gå til slutrammen, tag et skærmbillede
   af figuren og mål vandret overløb på siden. Konsolfejl rapporteres til sidst.

   Brug (dev-serveren skal køre):
     node scripts/qa-figurer.cjs <fag> [bredder] [ud-mappe] [--reduced] [--dark]
     node scripts/qa-figurer.cjs bad 1440,1280,375 /tmp/qa
   Miljø: QA_URL (standard http://localhost:5173), QA_ONLY=slug1,slug2 (kun disse
   emner), PLAYWRIGHT_PATH, CHROMIUM_PATH. Et fuldt fag tager ca. 15 s pr. emne
   pr. bredde — kør det i baggrunden. */

const path = require('path')
const fs = require('fs')

const PW =
  process.env.PLAYWRIGHT_PATH ??
  '/home/frederik/.nvm/versions/node/v24.15.0/lib/node_modules/@playwright/cli/node_modules/playwright'
const CHROME =
  process.env.CHROMIUM_PATH ??
  '/home/frederik/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'
const { chromium } = require(PW)

const args = process.argv.slice(2)
const flags = new Set(args.filter((a) => a.startsWith('--')))
const [course = 'bad', widthsArg = '1440,1280,375', outDir = path.join(process.cwd(), 'qa-out')] = args.filter(
  (a) => !a.startsWith('--'),
)
const widths = widthsArg.split(',').map(Number)
const BASE = process.env.QA_URL ?? 'http://localhost:5173'
const reduced = flags.has('--reduced')
const scheme = flags.has('--dark') ? 'dark' : 'light'
fs.mkdirSync(outDir, { recursive: true })

;(async () => {
  const browser = await chromium.launch({ executablePath: CHROME })
  let problems = 0
  for (const w of widths) {
    const page = await browser.newPage({
      viewport: { width: w, height: 900 },
      colorScheme: scheme,
      reducedMotion: reduced ? 'reduce' : 'no-preference',
    })
    const errors = []
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    page.on('pageerror', (e) => errors.push(String(e)))

    // Emnerne findes i sidebaren, når man står på fagets side.
    await page.goto(`${BASE}/${course}`)
    await page.waitForTimeout(500)
    const only = process.env.QA_ONLY?.split(',')
    const slugs = (
      await page.$$eval(`a.nav-topic[href^="/${course}/"]`, (as) => as.map((a) => a.getAttribute('href').split('/').pop()))
    ).filter((s) => !only || only.includes(s))
    if (!slugs.length) console.log(`${w} ${course}: ingen emner i sidebaren (er faget status 'ready'?)`)

    for (const slug of slugs) {
      await page.goto(`${BASE}/${course}/${slug}`)
      const hasFig = await page.waitForSelector('.fig-plate', { timeout: 8000 }).then(() => true, () => false)
      const doc = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      if (!hasFig) {
        console.log(`${w} ${slug}  INGEN FIGUR  docOverflow=${await doc()}`)
        problems++
        continue
      }
      const fig = page.locator('figure.fig').first()
      await fig.scrollIntoViewIfNeeded()
      const heights = new Set()
      if (reduced) {
        await page.waitForTimeout(600)
        const count = await fig.locator('.fig-count').innerText()
        const [a, b] = count.split('/').map((x) => x.trim())
        if (a !== b) {
          console.log(`${w} ${slug}  reduced motion viser trin ${count}, ikke slutrammen`)
          problems++
        }
      } else {
        const ticks = fig.locator('.fig-tick')
        const n = await ticks.count()
        for (let i = 0; i < n; i++) {
          await ticks.nth(i).click()
          await page.waitForTimeout(1600) // lad animationer falde på plads, før der måles
          heights.add(Math.round(await fig.locator('.fig-plate').evaluate((p) => p.getBoundingClientRect().height)))
        }
      }
      await page.waitForTimeout(600)
      const overflow = await doc()
      const file = path.join(outDir, `${course}-${slug}-${w}-${scheme}${reduced ? '-rm' : ''}.png`)
      await fig.screenshot({ path: file })
      // Én pixel kan skyldes afrunding; mere end det er et hop.
      const unstable = heights.size > 1 && Math.max(...heights) - Math.min(...heights) > 1
      if (overflow > 0 || unstable) problems++
      console.log(
        `${w} ${slug}  højder=[${[...heights].join(',')}]${unstable ? '  USTABIL' : ''}  docOverflow=${overflow}${overflow > 0 ? '  OVERLØB' : ''}`,
      )
    }
    if (errors.length) {
      problems++
      console.log(`${w} KONSOLFEJL:`, errors.slice(0, 10))
    }
    await page.close()
  }
  await browser.close()
  console.log(problems ? `\n${problems} problem(er).` : '\nIngen problemer.')
  console.log(`Skærmbilleder: ${outDir}  (samlet oversigt: montage ${outDir}/*.png -tile 4x -geometry 600x+6+6 ark.png)`)
  process.exit(problems ? 1 : 0)
})()

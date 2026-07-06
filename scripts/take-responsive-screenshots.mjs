import { chromium } from 'playwright';
import fs from 'fs/promises';

const APP_URL = process.env.APP_URL || 'http://127.0.0.1:4173?mode=demo';
const OUT_DIR = process.env.OUT_DIR || 'artifacts/responsive';
const viewports = [
  { name: 'desktop-1200', width: 1200, height: 900 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-480', width: 480, height: 900 }
];

await fs.mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await page.goto(APP_URL, { waitUntil: 'networkidle' });
  await page.fill('input[name="username"]', process.env.DEMO_USER || 'admin');
  await page.fill('input[name="password"]', process.env.DEMO_PASS || 'admin123');
  await page.click('button[type="submit"]');
  await page.screenshot({ path: `${OUT_DIR}/${viewport.name}.png`, fullPage: true });
  await page.close();
}
await browser.close();

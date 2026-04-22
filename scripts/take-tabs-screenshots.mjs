import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = process.env.APP_URL || 'http://127.0.0.1:4173';
const outDir = path.resolve(process.env.OUT_DIR || 'artifacts/tabs');
fs.mkdirSync(outDir, { recursive: true });

const tabs = ['inicio', 'ingresos', 'egresos', 'base-datos', 'informes', 'tesoreria'];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });

await page.goto(baseUrl, { waitUntil: 'networkidle' });

// Login demo
await page.fill('input[name="username"]', process.env.DEMO_USER || 'admin');
await page.fill('input[name="password"]', process.env.DEMO_PASS || 'admin123');
await page.click('#loginForm button[type="submit"]');
await page.waitForTimeout(300);

for (const tab of tabs) {
  await page.click(`button[data-tab="${tab}"]`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, `${tab}.png`), fullPage: true });
  console.log(`capturado: ${tab}.png`);
}

await browser.close();
console.log(`Screenshots en: ${outDir}`);

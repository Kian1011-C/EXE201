import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const OUT_DIR = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/6ab20c52-dce6-4951-bd15-826bb2d141b6/scratch/real_web_captures');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log('[Test Capture] Launching Chrome via Playwright...');
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
});

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 2,
});

const page = await context.newPage();

try {
  // 1. Set localStorage with Admin / Staff session
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const adminUser = {
      id: 1,
      name: 'Super Admin',
      email: 'admin@insurmatch.us',
      role: 'admin',
      avatar: 'SA',
    };
    localStorage.setItem('tbri_user', JSON.stringify(adminUser));
    localStorage.setItem('tbri_token', 'admin_session_token_verified');
  });

  // 2. Capture Admin/Staff Dashboard (showing company overview + smart alerts radar)
  console.log('[Test Capture] Navigating to Dashboard...');
  await page.goto('http://localhost:5173/dashboard/admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(OUT_DIR, '01_real_dashboard.png') });

  // 3. Capture Contact Detail (Contact #20)
  console.log('[Test Capture] Navigating to Contact #20...');
  await page.goto('http://localhost:5173/dashboard/staff/contacts/20', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT_DIR, '02_real_contact_detail.png') });

  // 4. Capture Deals Kanban Pipeline
  console.log('[Test Capture] Navigating to Deals Kanban...');
  await page.goto('http://localhost:5173/dashboard/staff/deals', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT_DIR, '03_real_deals_kanban.png') });

  // 5. Capture Tasks List
  console.log('[Test Capture] Navigating to Tasks...');
  await page.goto('http://localhost:5173/dashboard/staff/tasks', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT_DIR, '04_real_tasks_list.png') });

  // 6. Capture Commission Ledger
  console.log('[Test Capture] Navigating to Commission Ledger...');
  await page.goto('http://localhost:5173/dashboard/staff/commission', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT_DIR, '05_real_commission_ledger.png') });

  console.log('[Test Capture] Completed capturing real populated web screens in:', OUT_DIR);
} catch (err) {
  console.error('[Test Capture] Error:', err);
} finally {
  await browser.close();
}

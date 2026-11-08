import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const OUT_DIR = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/6ab20c52-dce6-4951-bd15-826bb2d141b6/scratch/screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log('[Capture] Launching Chrome via Playwright...');
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
});

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 2, // 2x retina sharpness
});

const page = await context.newPage();

try {
  console.log('[Capture] Setting up agent auth session in localStorage...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    const mockUser = {
      id: 20,
      name: 'Nguyen Phuong Khai',
      email: 'khainpse183590@fpt.edu.vn',
      role: 'agent',
      npn: '123123',
      avatar: 'NK',
    };
    localStorage.setItem('tbri_user', JSON.stringify(mockUser));
    localStorage.setItem('tbri_token', 'session_token_agent_verified_2026');
  });

  // 1. Agent Dashboard Screenshot
  console.log('[Capture] Navigating to Agent Dashboard...');
  await page.goto('http://localhost:5173/dashboard/agent', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  console.log('[Capture] Capturing Screen 1: Agent Dashboard...');
  await page.screenshot({
    path: path.join(OUT_DIR, '01_agent_dashboard.png'),
    fullPage: false,
  });

  // 2. Contacts Detail Screenshot
  console.log('[Capture] Navigating to Contacts Detail #20...');
  await page.goto('http://localhost:5173/dashboard/agent/contacts/20', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  console.log('[Capture] Capturing Screen 2: Contacts Detail...');
  await page.screenshot({
    path: path.join(OUT_DIR, '02_contacts_detail.png'),
    fullPage: false,
  });

  // 3. Deals Kanban Screenshot
  console.log('[Capture] Navigating to Deals Kanban Pipeline...');
  await page.goto('http://localhost:5173/dashboard/agent/deals', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  console.log('[Capture] Capturing Screen 3: Deals Kanban Pipeline...');
  await page.screenshot({
    path: path.join(OUT_DIR, '03_deals_kanban.png'),
    fullPage: false,
  });

  // 4. Tasks Queue Screenshot
  console.log('[Capture] Navigating to Tasks List...');
  await page.goto('http://localhost:5173/dashboard/agent/tasks', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  console.log('[Capture] Capturing Screen 4: Tasks Queue...');
  await page.screenshot({
    path: path.join(OUT_DIR, '04_tasks_queue.png'),
    fullPage: false,
  });

  // 5. Commission Ledger Screenshot
  console.log('[Capture] Navigating to Commission Ledger...');
  await page.goto('http://localhost:5173/dashboard/agent/commission', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  console.log('[Capture] Capturing Screen 5: Commission Ledger...');
  await page.screenshot({
    path: path.join(OUT_DIR, '05_commission_ledger.png'),
    fullPage: false,
  });

  // 6. Subscription & VietQR Resource Quota Screenshot
  console.log('[Capture] Navigating to Subscription & Resource Management...');
  await page.goto('http://localhost:5173/dashboard/agent/subscription', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  console.log('[Capture] Capturing Screen 6: Agent Subscription...');
  await page.screenshot({
    path: path.join(OUT_DIR, '06_agent_subscription.png'),
    fullPage: false,
  });

  // 7. Presentation Slide 1 (Main Business Workflow)
  console.log('[Capture] Navigating to Presentation Slide 1...');
  await page.goto('http://localhost:5173/presentation', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  console.log('[Capture] Capturing Screen 7: Presentation Slide 1...');
  await page.screenshot({
    path: path.join(OUT_DIR, '07_slide_main_workflow.png'),
    fullPage: false,
  });

  // 8. Presentation Slide 2 & 3
  const nextBtn = page.locator('button[title*="Next Slide"]').first();
  if (await nextBtn.isVisible()) {
    await nextBtn.click();
    await page.waitForTimeout(1000);
    console.log('[Capture] Capturing Screen 8: Presentation Slide 2...');
    await page.screenshot({
      path: path.join(OUT_DIR, '08_slide_product_experience_1.png'),
      fullPage: false,
    });

    await nextBtn.click();
    await page.waitForTimeout(1000);
    console.log('[Capture] Capturing Screen 9: Presentation Slide 3...');
    await page.screenshot({
      path: path.join(OUT_DIR, '09_slide_product_experience_2.png'),
      fullPage: false,
    });
  }

  console.log('[Capture] ALL 8 SCREENSHOTS CAPTURED SUCCESSFULLY in:', OUT_DIR);
} catch (err) {
  console.error('[Capture] Error capturing screenshots:', err);
} finally {
  await browser.close();
}

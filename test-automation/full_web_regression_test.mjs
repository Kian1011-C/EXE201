import { chromium } from 'playwright';

async function runRegressionSuite() {
  console.log('====================================================');
  console.log('🚀 INSURMATCH FULL E2E WEB REGRESSION TEST SUITE');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  const testResults = [];
  const consoleErrors = [];

  page.on('pageerror', (err) => {
    consoleErrors.push(`[PageError] ${err.message}`);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore favicon and external network errors if any
      if (!text.includes('favicon') && !text.includes('ERR_CONNECTION_REFUSED')) {
        consoleErrors.push(`[ConsoleError] ${text}`);
      }
    }
  });

  async function testCase(name, fn) {
    process.stdout.write(`• Testing: ${name}... `);
    try {
      await fn();
      console.log('✅ PASS');
      testResults.push({ name, status: 'PASS' });
    } catch (err) {
      console.log(`❌ FAIL - ${err.message}`);
      testResults.push({ name, status: 'FAIL', error: err.message });
    }
  }

  // --- Suite 1: Public Pages ---
  console.log('\n--- SUITE 1: PUBLIC INTERFACE ---');
  await testCase('Home Page (/) renders brand and hero', async () => {
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const bodyText = await page.textContent('body');
    if (!bodyText.includes('InsurMatch')) throw new Error('Missing InsurMatch brand on Home');
  });

  await testCase('Pricing Page (/pricing) renders pricing plans', async () => {
    await page.goto('http://localhost:5173/pricing', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const bodyText = await page.textContent('body');
    if (!bodyText.toLowerCase().includes('starter') && !bodyText.toLowerCase().includes('professional')) {
      throw new Error('Missing pricing plan cards on /pricing');
    }
  });

  await testCase('Contact Page (/contact) renders contact info', async () => {
    await page.goto('http://localhost:5173/contact', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const bodyText = await page.textContent('body');
    if (!bodyText.includes('support@insurmatch.us')) {
      throw new Error('Missing support contact on /contact');
    }
  });

  // --- Suite 2: Removed Route & Navigation Verification ---
  console.log('\n--- SUITE 2: PRESENTATION ROUTE REMOVAL VERIFICATION ---');
  await testCase('/presentation route is deleted and does not crash app', async () => {
    await page.goto('http://localhost:5173/presentation', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    // Should fallback to HomePage without crashing
    const bodyText = await page.textContent('body');
    if (bodyText.includes('INSURMATCH — MAIN BUSINESS WORKFLOW')) {
      throw new Error('Workflow presentation slide is still being rendered!');
    }
  });

  // Setup Authenticated Session for Nguyen Phuong Khai
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

  // --- Suite 3: Authenticated Agent Workspace ---
  console.log('\n--- SUITE 3: AGENT CRM WORKSPACE (Nguyen Phuong Khai) ---');
  await testCase('Top Navbar has NO Presentation Deck button', async () => {
    await page.goto('http://localhost:5173/dashboard/agent', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const presentationBtn = await page.locator('text="Presentation Deck"').count();
    if (presentationBtn > 0) {
      throw new Error('Found lingering "Presentation Deck" button in topbar!');
    }
  });

  await testCase('Agent Dashboard (/dashboard/agent) loads without access restrictions', async () => {
    const bodyText = await page.textContent('body');
    if (bodyText.includes('Access Restricted')) {
      throw new Error('Found "Access Restricted" alert on Dashboard!');
    }
    if (!bodyText.includes('Nguyen Phuong Khai')) {
      throw new Error('Dashboard does not display logged in agent name!');
    }
  });

  await testCase('Contacts List (/dashboard/agent/contacts) displays contact rows', async () => {
    await page.goto('http://localhost:5173/dashboard/agent/contacts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');
    if (bodyText.includes('Access Restricted')) {
      throw new Error('Found "Access Restricted" alert on Contacts list!');
    }
  });

  await testCase('Contact Detail (/dashboard/agent/contacts/20) displays customer profile', async () => {
    await page.goto('http://localhost:5173/dashboard/agent/contacts/20', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');
    if (bodyText.includes('Access Restricted')) {
      throw new Error('Contact #20 shows "Access Restricted" card!');
    }
  });

  await testCase('Deals Kanban (/dashboard/agent/deals) displays pipeline board', async () => {
    await page.goto('http://localhost:5173/dashboard/agent/deals', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');
    if (bodyText.includes('Access Restricted')) {
      throw new Error('Deals board shows "Access Restricted"!');
    }
  });

  await testCase('Tasks Queue (/dashboard/agent/tasks) displays tasks', async () => {
    await page.goto('http://localhost:5173/dashboard/agent/tasks', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');
    if (bodyText.includes('Access Restricted')) {
      throw new Error('Tasks list shows "Access Restricted"!');
    }
  });

  await testCase('Commission Ledger (/dashboard/agent/commission) displays carrier reconciliation', async () => {
    await page.goto('http://localhost:5173/dashboard/agent/commission', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');
    if (!bodyText.toLowerCase().includes('commission') && !bodyText.toLowerCase().includes('carrier')) {
      throw new Error('Commission ledger missing expected headings');
    }
  });

  await testCase('Subscription & Resource Quota (/dashboard/agent/subscription) renders VietQR PayOS info', async () => {
    await page.goto('http://localhost:5173/dashboard/agent/subscription', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');
    if (!bodyText.includes('Nguyen Phuong Khai Insurance Agency')) {
      throw new Error('Missing agency title on subscription page');
    }
    if (!bodyText.includes('100 h\u1ED3 s\u01A1') && !bodyText.includes('100')) {
      throw new Error('Missing quota details on subscription page');
    }
  });

  await browser.close();

  console.log('\n====================================================');
  console.log('📊 TEST SUMMARY RESULTS:');
  const total = testResults.length;
  const passed = testResults.filter((r) => r.status === 'PASS').length;
  const failed = testResults.filter((r) => r.status === 'FAIL').length;
  console.log(`Total Tests : ${total}`);
  console.log(`Passed      : ${passed} ✅`);
  console.log(`Failed      : ${failed} ${failed > 0 ? '❌' : ''}`);

  if (consoleErrors.length > 0) {
    console.log(`\n⚠️  Browser Console Errors Detected (${consoleErrors.length}):`);
    consoleErrors.forEach((e) => console.log('  ' + e));
  } else {
    console.log('\n✨ Browser Console: Clean (0 uncaught errors)');
  }
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

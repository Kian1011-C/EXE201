const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:5173/dashboard/staff/tickets/T26041092');
  
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();

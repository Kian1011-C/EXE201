const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/dashboard/staff/contacts/CT26002600');
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Find Notes tab and click
  const tabs = await page.$$('button');
  for (const t of tabs) {
    const text = await page.evaluate(el => el.textContent, t);
    if (text.includes('Notes')) {
      await t.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'scratch/step1_notes_tab.png' });
  
  // Find Edit button
  const btns = await page.$$('button');
  let editClicked = false;
  for (const btn of btns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.trim().includes('editEdit') || text.trim() === 'Edit' || text.trim().includes('edit')) {
      // It might have icon text 'edit'
      const html = await page.evaluate(el => el.innerHTML, btn);
      if (html.includes('Edit')) {
         console.log('Found Edit button');
         await btn.click();
         editClicked = true;
         break;
      }
    }
  }
  
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'scratch/step2_after_edit_click.png' });
  
  await browser.close();
})();

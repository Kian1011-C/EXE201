const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/dashboard/staff/contacts/CT26002600');
  
  await new Promise(r => setTimeout(r, 2000)); // wait for load
  
  // Find Notes tab and click
  const tabs = await page.$$('button');
  for (const t of tabs) {
    const text = await page.evaluate(el => el.textContent, t);
    if (text.includes('Notes') || text.includes('Note')) {
      await t.click();
    }
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Find Actions button
  const actionsBtns = await page.$$('button');
  let clickedActions = false;
  for (const btn of actionsBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Actions')) {
      await btn.click();
      clickedActions = true;
      console.log('Clicked Actions button');
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 500));
  
  if (clickedActions) {
    // Find Edit button
    const btns = await page.$$('button');
    let editClicked = false;
    for (const btn of btns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.trim().includes('Edit')) {
        console.log('Found Edit button in dropdown:', text.trim());
        await btn.click();
        editClicked = true;
        console.log('Clicked Edit');
        break;
      }
    }
    
    if (editClicked) {
      await new Promise(r => setTimeout(r, 500));
      // Check if modal opened
      const modal = await page.evaluate(() => {
        const m = document.querySelector('div.fixed.inset-0'); // ANY fixed inset-0 overlay
        if (!m) return 'No fixed inset-0 found';
        return m.innerText ? m.innerText.substring(0, 100) : 'Found overlay but no text';
      });
      console.log('Modal text:', modal);
      
      const form = await page.evaluate(() => {
         return !!document.querySelector('form');
      });
      console.log('Form exists in DOM:', form);
    }
  } else {
    console.log('Could not find Actions button');
  }
  
  await browser.close();
})();

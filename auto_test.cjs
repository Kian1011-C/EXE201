const puppeteer = require('puppeteer');

(async () => {
    console.log("Khởi động Browser Agent...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Capture errors
    const errors = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`Console Error: ${msg.text()}`);
        }
    });

    page.on('response', async response => {
        const status = response.status();
        if (status >= 400) {
            const url = response.url();
            // Don't flag certain static files if they 404, mainly focus on APIs
            if (url.includes('/api/')) {
                let body = '';
                try { body = await response.text(); } catch(e) {}
                errors.push(`API Error: [${status}] ${url} - ${body.substring(0, 100)}`);
            }
        }
    });

    try {
        console.log("Navigating to Home Page...");
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
        
        console.log("Navigating to Login Page...");
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0', timeout: 10000 });
        
        console.log("Logging in as Admin...");
        await page.type('input[type="email"]', 'admin@insurmatch.us');
        await page.type('input[type="password"]', 'Admin@123');
        await page.click('button[type="submit"]');
        
        // Wait for dashboard to load
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log("Timeout waiting for nav, continuing..."));
        
        // Take a brief pause to let dashboard APIs load
        await new Promise(r => setTimeout(r, 2000));
        
        console.log("Navigating to Accounts tab...");
        await page.goto('http://localhost:5173/dashboard/admin/accounts', { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 2000));
        
        console.log("Navigating to Quotes tab...");
        await page.goto('http://localhost:5173/dashboard/admin/quotes', { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 2000));
        
        console.log("Navigating to Deals tab...");
        await page.goto('http://localhost:5173/dashboard/admin/deals', { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 2000));
        
        console.log("Logging out and logging in as Staff...");
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
        // staff login
        await page.evaluate(() => {
            document.querySelector('input[type="email"]').value = '';
            document.querySelector('input[type="password"]').value = '';
        });
        await page.type('input[type="email"]', 'staff@insurmatch.us');
        await page.type('input[type="password"]', 'Staff@123');
        await page.click('button[type="submit"]');
        await new Promise(r => setTimeout(r, 3000));
        
        console.log("Navigating to Contacts (CRM)...");
        await page.goto('http://localhost:5173/dashboard/staff/contacts', { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 2000));

    } catch (e) {
        errors.push(`Script Error: ${e.message}`);
    } finally {
        await browser.close();
        console.log("\n=== KẾT QUẢ TEST CỦA BROWSER AGENT ===");
        if (errors.length === 0) {
            console.log("Tuyệt vời! Không phát hiện lỗi Console hay lỗi gọi API nào.");
        } else {
            console.log("Phát hiện các lỗi sau trong quá trình duyệt qua các luồng:");
            errors.forEach(err => console.log("- " + err));
        }
        console.log("=====================================");
    }
})();

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Launching browser...');
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent('<h1>Hello from Playwright E2E PDF Generator!</h1><p>Testing PDF print function.</p>');
    const pdfPath = path.join(__dirname, 'test.pdf');
    await page.pdf({ path: pdfPath, format: 'A4' });
    await browser.close();
    console.log('PDF generated successfully at:', pdfPath);
    console.log('File size:', fs.statSync(pdfPath).size, 'bytes');
  } catch (error) {
    console.error('Playwright PDF failed:', error);
  }
}

run();

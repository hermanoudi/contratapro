const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();

  // Test Desktop
  console.log('Testing Desktop (1920x1080)...');
  const desktopPage = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  await desktopPage.goto('http://localhost:5173/login');
  await desktopPage.waitForTimeout(2000);

  // Get logo dimensions on desktop
  const desktopLogo = await desktopPage.locator('img[alt="ContrataPro"]').first();
  const desktopBox = await desktopLogo.boundingBox();

  console.log('Desktop Logo Dimensions:');
  console.log(`  Width: ${desktopBox?.width}px`);
  console.log(`  Height: ${desktopBox?.height}px`);
  console.log(`  X: ${desktopBox?.x}px`);
  console.log(`  Y: ${desktopBox?.y}px`);

  await desktopPage.screenshot({
    path: '/home/hermano/projetos/faz_de_tudo/screenshot-desktop-login.png',
    fullPage: true
  });
  console.log('Desktop screenshot saved: screenshot-desktop-login.png\n');

  // Test Mobile
  console.log('Testing Mobile (375x812 - iPhone X)...');
  const mobilePage = await browser.newPage({
    viewport: { width: 375, height: 812 }
  });

  await mobilePage.goto('http://localhost:5173/login');
  await mobilePage.waitForTimeout(2000);

  // Check if logo is visible on mobile
  const mobileLogos = await mobilePage.locator('img[alt="ContrataPro"]').all();
  console.log(`Number of logos found on mobile: ${mobileLogos.length}`);

  for (let i = 0; i < mobileLogos.length; i++) {
    const isVisible = await mobileLogos[i].isVisible();
    const box = await mobileLogos[i].boundingBox();
    console.log(`\nMobile Logo ${i + 1}:`);
    console.log(`  Visible: ${isVisible}`);
    if (box) {
      console.log(`  Width: ${box.width}px`);
      console.log(`  Height: ${box.height}px`);
      console.log(`  X: ${box.x}px`);
      console.log(`  Y: ${box.y}px`);
    } else {
      console.log('  Not rendered (display: none or hidden by CSS)');
    }
  }

  await mobilePage.screenshot({
    path: '/home/hermano/projetos/faz_de_tudo/screenshot-mobile-login.png',
    fullPage: true
  });
  console.log('\nMobile screenshot saved: screenshot-mobile-login.png');

  // Test Tablet
  console.log('\nTesting Tablet (768x1024 - iPad)...');
  const tabletPage = await browser.newPage({
    viewport: { width: 768, height: 1024 }
  });

  await tabletPage.goto('http://localhost:5173/login');
  await tabletPage.waitForTimeout(2000);

  const tabletLogos = await tabletPage.locator('img[alt="ContrataPro"]').all();
  console.log(`Number of logos found on tablet: ${tabletLogos.length}`);

  for (let i = 0; i < tabletLogos.length; i++) {
    const isVisible = await tabletLogos[i].isVisible();
    const box = await tabletLogos[i].boundingBox();
    console.log(`\nTablet Logo ${i + 1}:`);
    console.log(`  Visible: ${isVisible}`);
    if (box) {
      console.log(`  Width: ${box.width}px`);
      console.log(`  Height: ${box.height}px`);
      console.log(`  X: ${box.x}px`);
      console.log(`  Y: ${box.y}px`);
    } else {
      console.log('  Not rendered');
    }
  }

  await tabletPage.screenshot({
    path: '/home/hermano/projetos/faz_de_tudo/screenshot-tablet-login.png',
    fullPage: true
  });
  console.log('\nTablet screenshot saved: screenshot-tablet-login.png');

  await browser.close();

  console.log('\n=== ANALYSIS ===');
  console.log('Screenshots captured for:');
  console.log('1. Desktop (1920x1080)');
  console.log('2. Mobile (375x812)');
  console.log('3. Tablet (768x1024)');
  console.log('\nCheck the screenshot files to verify logo visibility and proportions.');
})();

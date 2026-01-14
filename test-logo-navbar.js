const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();

  // Test Home Navbar - Mobile
  console.log('=== HOME NAVBAR - MOBILE ===');
  const homeMobile = await browser.newPage({
    viewport: { width: 375, height: 812 }
  });
  await homeMobile.goto('http://localhost:5173/');
  await homeMobile.waitForTimeout(2000);

  const mobileLogos = await homeMobile.locator('img[alt="ContrataPro"]').all();
  console.log(`Found ${mobileLogos.length} logo(s) on mobile home`);

  for (let i = 0; i < mobileLogos.length; i++) {
    const box = await mobileLogos[i].boundingBox();
    const isVisible = await mobileLogos[i].isVisible();
    console.log(`\nLogo ${i + 1}:`);
    console.log(`  Visible: ${isVisible}`);
    if (box) {
      console.log(`  Width: ${box.width}px`);
      console.log(`  Height: ${box.height}px`);
      console.log(`  Position: (${box.x}, ${box.y})`);
    }
  }

  // Capture just the navbar area
  await homeMobile.screenshot({
    path: '/home/hermano/projetos/faz_de_tudo/screenshot-navbar-mobile.png',
    clip: { x: 0, y: 0, width: 375, height: 100 }
  });
  console.log('\nNavbar screenshot saved: screenshot-navbar-mobile.png');

  // Test Home Navbar - Desktop
  console.log('\n=== HOME NAVBAR - DESKTOP ===');
  const homeDesktop = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });
  await homeDesktop.goto('http://localhost:5173/');
  await homeDesktop.waitForTimeout(2000);

  const desktopLogos = await homeDesktop.locator('img[alt="ContrataPro"]').all();
  console.log(`Found ${desktopLogos.length} logo(s) on desktop home`);

  for (let i = 0; i < desktopLogos.length; i++) {
    const box = await desktopLogos[i].boundingBox();
    const isVisible = await desktopLogos[i].isVisible();
    console.log(`\nLogo ${i + 1}:`);
    console.log(`  Visible: ${isVisible}`);
    if (box) {
      console.log(`  Width: ${box.width}px`);
      console.log(`  Height: ${box.height}px`);
      console.log(`  Position: (${box.x}, ${box.y})`);
    }
  }

  // Capture just the navbar area
  await homeDesktop.screenshot({
    path: '/home/hermano/projetos/faz_de_tudo/screenshot-navbar-desktop.png',
    clip: { x: 0, y: 0, width: 1920, height: 100 }
  });
  console.log('\nNavbar screenshot saved: screenshot-navbar-desktop.png');

  await browser.close();

  console.log('\n=== DONE ===');
})();

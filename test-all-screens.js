const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();

  // Test Login page - Mobile
  console.log('=== LOGIN PAGE - MOBILE ===');
  const loginMobile = await browser.newPage({
    viewport: { width: 375, height: 812 }
  });
  await loginMobile.goto('http://localhost:5173/login');
  await loginMobile.waitForTimeout(2000);
  await loginMobile.screenshot({
    path: '/home/hermano/projetos/faz_de_tudo/screenshot-login-mobile.png',
    fullPage: true
  });
  console.log('Screenshot saved: screenshot-login-mobile.png');

  // Test Login page - Desktop
  console.log('\n=== LOGIN PAGE - DESKTOP ===');
  const loginDesktop = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });
  await loginDesktop.goto('http://localhost:5173/login');
  await loginDesktop.waitForTimeout(2000);
  await loginDesktop.screenshot({
    path: '/home/hermano/projetos/faz_de_tudo/screenshot-login-desktop.png',
    fullPage: false
  });
  console.log('Screenshot saved: screenshot-login-desktop.png');

  // Test Home page - Mobile
  console.log('\n=== HOME PAGE - MOBILE ===');
  const homeMobile = await browser.newPage({
    viewport: { width: 375, height: 812 }
  });
  await homeMobile.goto('http://localhost:5173/');
  await homeMobile.waitForTimeout(2000);
  await homeMobile.screenshot({
    path: '/home/hermano/projetos/faz_de_tudo/screenshot-home-mobile.png',
    fullPage: true
  });
  console.log('Screenshot saved: screenshot-home-mobile.png');

  // Test Home page - Desktop
  console.log('\n=== HOME PAGE - DESKTOP ===');
  const homeDesktop = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });
  await homeDesktop.goto('http://localhost:5173/');
  await homeDesktop.waitForTimeout(2000);
  await homeDesktop.screenshot({
    path: '/home/hermano/projetos/faz_de_tudo/screenshot-home-desktop.png',
    fullPage: false
  });
  console.log('Screenshot saved: screenshot-home-desktop.png');

  // Test Register Professional - Mobile
  console.log('\n=== REGISTER PROFESSIONAL - MOBILE ===');
  const regProfMobile = await browser.newPage({
    viewport: { width: 375, height: 812 }
  });
  await regProfMobile.goto('http://localhost:5173/register-professional');
  await regProfMobile.waitForTimeout(2000);
  await regProfMobile.screenshot({
    path: '/home/hermano/projetos/faz_de_tudo/screenshot-regprof-mobile.png',
    fullPage: true
  });
  console.log('Screenshot saved: screenshot-regprof-mobile.png');

  // Test Register Professional - Desktop
  console.log('\n=== REGISTER PROFESSIONAL - DESKTOP ===');
  const regProfDesktop = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });
  await regProfDesktop.goto('http://localhost:5173/register-professional');
  await regProfDesktop.waitForTimeout(2000);
  await regProfDesktop.screenshot({
    path: '/home/hermano/projetos/faz_de_tudo/screenshot-regprof-desktop.png',
    fullPage: false
  });
  console.log('Screenshot saved: screenshot-regprof-desktop.png');

  // Test Register Client - Mobile
  console.log('\n=== REGISTER CLIENT - MOBILE ===');
  const regClientMobile = await browser.newPage({
    viewport: { width: 375, height: 812 }
  });
  await regClientMobile.goto('http://localhost:5173/register-client');
  await regClientMobile.waitForTimeout(2000);
  await regClientMobile.screenshot({
    path: '/home/hermano/projetos/faz_de_tudo/screenshot-regclient-mobile.png',
    fullPage: true
  });
  console.log('Screenshot saved: screenshot-regclient-mobile.png');

  // Test Register Client - Desktop
  console.log('\n=== REGISTER CLIENT - DESKTOP ===');
  const regClientDesktop = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });
  await regClientDesktop.goto('http://localhost:5173/register-client');
  await regClientDesktop.waitForTimeout(2000);
  await regClientDesktop.screenshot({
    path: '/home/hermano/projetos/faz_de_tudo/screenshot-regclient-desktop.png',
    fullPage: false
  });
  console.log('Screenshot saved: screenshot-regclient-desktop.png');

  await browser.close();

  console.log('\n=== ALL SCREENSHOTS CAPTURED ===');
})();

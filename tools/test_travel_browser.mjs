import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const root = process.env.TRAVEL_TEST_ORIGIN || 'https://aganzo.com';
const prefix = ['', '/es', '/ja', '/zh-hans'];
const slugs = ['belgium', 'france', 'indonesia', 'spain'];
const results = [];
let failures = 0;

async function check(label, fn) {
  try {
    const detail = await fn();
    results.push({ status: 'PASS', label, detail: detail || '' });
    console.log('PASS', label, detail || '');
  } catch (error) {
    failures++;
    results.push({ status: 'FAIL', label, error: String(error) });
    console.error('FAIL', label, error.stack || error);
  }
}

await mkdir('travel-smoke-screenshots', { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const desktop = browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const mobile = browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const contexts = [await desktop, await mobile];

async function load(context, path, events) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.url().startsWith(root + '/') && response.status() >= 400)
      errors.push(response.status() + ' ' + response.url());
  });
  const response = await page.goto(root + path, { waitUntil: 'domcontentloaded', timeout: 45000 });
  assert.equal(response.status(), 200, path + ' HTTP status');
  if (events) await page.locator('html.travel-ready').waitFor({ timeout: 20000 });
  return { page, errors };
}

for (const p of prefix) {
  const path = p + '/travel/';
  await check(path + ' desktop rendering, SEO, JS, images', async () => {
    const { page, errors } = await load(contexts[0], path, true);
    assert.equal(await page.locator('.featured-card').count(), 4);
    assert.equal(await page.locator('[data-map-mode]').count(), 3);
    assert.equal(await page.locator('#atlas-preview').count(), 1);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), root + path);
    for (const l of ['en', 'es', 'ja', 'zh-Hans', 'x-default']) assert.equal(await page.locator('link[hreflang="'+l+'"]').count(), 1);
    assert.equal(await page.locator('#world-map-canvas svg.atlas-map').count(), 1);
    const images = await page.locator('.featured-card img').evaluateAll(nodes => nodes.map(n => ({src:n.src,ok:n.complete && n.naturalWidth > 0})));
    assert(images.length >= 2 && images.every(x=>x.ok), JSON.stringify(images));
    assert.deepEqual(errors, [], 'Page errors');
    await page.screenshot({ path: 'travel-smoke-screenshots/' + (p||'/en').replaceAll('/','') + '-desktop.png', fullPage: true });
    await page.close();
    return '4 cards · 3 maps · 5 hreflang · photos loaded';
  });
  await check(path + ' mobile layout and interaction', async () => {
    const { page, errors } = await load(contexts[1], path, true);
    const dims = await page.evaluate(() => ({ width: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    assert(dims.document <= dims.width + 4, 'Horizontal overflow: ' + JSON.stringify(dims));
    await page.locator('[data-map-mode="spain"]').click();
    await page.locator('#regional-map-shell:visible').waitFor();
    await page.locator('#regional-map-list [data-subregion="madrid"]').click();
    await page.locator('#atlas-preview h3').waitFor();
    assert((await page.locator('#atlas-preview h3').innerText()).toLowerCase().includes(p === '/ja'?'マドリード':p === '/zh-hans'?'马德里':'madrid'));
    assert(page.url().includes('subregion=madrid'));
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.locator('html.travel-ready').waitFor();
    assert(!page.url().includes('subregion=madrid'));
    assert.deepEqual(errors, [], 'Page errors');
    await page.screenshot({ path: 'travel-smoke-screenshots/' + (p||'/en').replaceAll('/','') + '-mobile.png', fullPage: true });
    await page.close();
    return '390px · regional click · Back history';
  });
}

await check('World country selection, Spain auto-switch, Indonesia regional map', async () => {
  const {page, errors} = await load(contexts[0], '/travel/', true);
  await page.locator('[data-map-mode="world"]').click();
  await page.locator('#world-map-canvas .atlas-country[data-country="ES"]').first().dispatchEvent('click');
  assert.equal(await page.locator('[data-map-mode="spain"]').getAttribute('aria-pressed'),'true');
  assert(page.url().includes('map=spain'));
  await page.locator('#regional-map-list [data-subregion="madrid"]').click();
  assert(page.url().includes('subregion=madrid'));
  await page.locator('#regional-map-back').click();
  assert.equal(await page.locator('[data-map-mode="world"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-map-mode="indonesia"]').click();
  await page.locator('#regional-map-list [data-subregion="java"]').click();
  assert(page.url().includes('map=indonesia') && page.url().includes('subregion=java'));
  assert.equal(await page.locator('#atlas-preview img').count(),1);
  await page.locator('.atlas-preview-link').click();
  assert(page.url().includes('/travel/indonesia/'));
  assert.deepEqual(errors, [], 'Page errors');
  await page.close();
  return 'world→Spain→Madrid→World→Indonesia→Java→album';
});

for (const p of prefix) for (const slug of slugs) {
  const path = p + '/travel/' + slug + '/';
  await check(path + ' full-page accessibility and content', async () => {
    const { page, errors } = await load(contexts[0], path, true);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('#country-detail').count(), 1);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),root+path);
    assert((await page.locator('#country-note').innerText()).length >= 25);
    for(const l of ['en','es','ja','zh-Hans','x-default'])assert.equal(await page.locator('link[hreflang="'+l+'"]').count(),1);
    if (slug === 'spain') {
      assert.equal(await page.locator('#regions').count(),1);
      await page.locator('#regional-map-list [data-subregion="madrid"]').waitFor();
      await page.locator('#regional-map-list [data-subregion="madrid"]').click();
      assert((await page.locator('#region-detail').innerText()).length>100);
    } else if (slug === 'indonesia' || slug === 'france') {
      const images=await page.locator('.journal-gallery img').evaluateAll(nodes => nodes.map(n=>({src:n.src,ready:n.complete && n.naturalWidth>0})));
      assert(images.length>1, 'Photo gallery not found');
      assert(images.every(i=>i.ready),JSON.stringify(images.filter(i=>!i.ready)));
      await page.locator('#journal-hero').click();
      await page.locator('dialog.journal-lightbox[open]').waitFor();
      await page.keyboard.press('ArrowRight');
      await page.locator('.journal-lightbox-close').click();
    }
    assert.deepEqual(errors,[], 'Page errors');
    await page.close();
    return 'canonical · content · gallery/regions';
  });
}

await Promise.all(contexts.map(c=>c.close()));
await browser.close();
console.log('\nSUMMARY ' + JSON.stringify({passed:results.length-failures,failed:failures,total:results.length}));
if (failures) process.exitCode = 1;

async page => {
  const B = 'http://localhost:8765/';
  const R = [];
  const ok = (name, cond, info) => R.push((cond ? 'PASS ' : 'FAIL ') + name + (info !== undefined ? '  [' + JSON.stringify(info).slice(0, 160) + ']' : ''));
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
  page.on('dialog', d => { R.push('INFO ' + d.type() + ' dialog on ' + page.url().slice(22)); d.accept(); });
  const mobile = page.viewportSize().width < 800;
  const go = async (p) => { await page.goto(B + p, { waitUntil: 'load' }); await page.waitForTimeout(400); };
  const vis = (sel) => page.locator(sel).first().isVisible();

  // 1. Header navigation
  await go('index.html');
  if (mobile) {
    const mb = page.locator('.menu-btn');
    await mb.click(); await page.waitForTimeout(300);
    ok('mobile menu opens', (await mb.getAttribute('aria-expanded')) === 'true' && await vis('#mnav'));
    ok('page scroll locked while menu open', await page.evaluate(() => document.documentElement.classList.contains('menu-open') || getComputedStyle(document.body).overflow === 'hidden'));
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    ok('Escape closes mobile menu', (await mb.getAttribute('aria-expanded')) === 'false');
  } else {
    const t = page.locator('.header nav [aria-expanded]').first();
    await t.click(); await page.waitForTimeout(300);
    ok('mega menu opens', (await t.getAttribute('aria-expanded')) === 'true');
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    ok('Escape closes mega menu', (await t.getAttribute('aria-expanded')) === 'false');
  }
  // carousel arrows move the paths track
  const track = page.locator('.h3-rv-cards .rv-track');
  const x0 = await track.evaluate(e => e.scrollLeft);
  await page.locator('.h3-rv-cards').scrollIntoViewIfNeeded(); await page.locator('.h3-rv-cards .rv-nav.next').click(); await page.waitForTimeout(700);
  ok('reviews arrow scrolls', Math.abs((await track.evaluate(e => e.scrollLeft)) - x0) > 20);
  // hero tile goes to its course
  await page.locator('.h3-big h3 a').click(); await page.waitForLoadState('load');
  ok('featured course tile opens its page', /course-pmp\.html/.test(page.url()), page.url().slice(22));
  await go('index.html');
  if (mobile) {
    ok('bottom tab bar on home', await vis('.m-tabbar') && (await page.locator('.m-tabbar a[aria-current=page]').getAttribute('href')) === 'index.html');
    await page.fill('#h3-q', 'PMP'); await page.locator('.h3-msearch button').click(); await page.waitForLoadState('load'); await page.waitForTimeout(400);
    ok('hero search opens filtered catalog', page.url().includes('q=PMP') && +(await page.locator('#course-count').textContent()) >= 1, page.url().slice(22));
  }

  // 2. Catalog filters + URL state
  await go('courses.html');
  const n0 = +(await page.locator('#course-count').textContent());
  if (mobile) { await page.locator('.f-open').click(); await page.waitForTimeout(300); }
  await page.locator('#course-filters input[name="cat"][value="pm"]').check({ force: true });
  if (mobile) { await page.locator('.f-apply').first().click(); await page.waitForTimeout(300); }
  const n1 = +(await page.locator('#course-count').textContent());
  ok('category filter narrows the list', n1 > 0 && n1 < n0, { n0, n1 });
  ok('filter written to URL', page.url().includes('cat=pm'), page.url().slice(22));
  await page.locator('#course-search').fill('PMP'); await page.waitForTimeout(200);
  const n2 = +(await page.locator('#course-count').textContent());
  ok('search narrows further', n2 > 0 && n2 <= n1, { n2 });
  await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(400);
  ok('state survives reload', +(await page.locator('#course-count').textContent()) === n2 && (await page.locator('#course-search').inputValue()) === 'PMP');

  // 3. Course page interactions
  await go('course-pmp.html');
  const tabs = page.locator('.about-tabs [role=tab]');
  await tabs.first().focus(); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(150);
  ok('tabs move with arrow keys (RTL)', (await tabs.nth(1).getAttribute('aria-selected')) === 'true');
  const acc = page.locator('.cp-outline details').nth(1);
  await acc.locator('summary').click(); await page.waitForTimeout(150);
  ok('module accordion opens', await acc.evaluate(d => d.open));
  await page.locator('.cp-expand').click();
  ok('FAQ expand all', await page.locator('#faq-list details').evaluateAll(ds => ds.every(d => d.open)));
  if (!mobile) {
    await page.locator('.cp-nav a[href="#faq"]').click(); await page.waitForTimeout(1800);
    const top = await page.locator('#faq-title').evaluate(e => e.getBoundingClientRect().top);
    ok('section bar link lands below the sticky bars', top > 100 && top < 400, Math.round(top));
  }

  if (mobile) {
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
    ok('course price bar shows on phones', await vis('.m-buybar') && !(await page.locator('.m-buybar').evaluate(b => b.classList.contains('is-hidden'))));
  }
  // 4. Add to cart → cart → checkout
  await page.evaluate(() => localStorage.removeItem('mt_cart'));
  await page.locator('[data-add-to-cart]').first().scrollIntoViewIfNeeded();
  await page.locator('[data-add-to-cart]').first().click(); await page.waitForTimeout(500);
  ok('add to cart stores the course', await page.evaluate(() => (JSON.parse(localStorage.getItem('mt_cart') || '[]')).length === 1));
  await go('cart.html');
  ok('cart shows the item', await vis('#cart-filled') && (await page.locator('#cart-list li').count()) >= 1);
  await page.locator('#pay-btn').click(); await page.waitForLoadState('load'); await page.waitForTimeout(400);
  ok('cart → checkout', page.url().includes('checkout.html'));
  await page.locator('#co-submit').click(); await page.waitForTimeout(300);
  const errsShown = await page.locator('[id$="-err"]:not([hidden])').count();
  ok('checkout shows inline errors when empty', errsShown >= 3, errsShown);
  if (mobile) ok('checkout pay bar mirrors the total', await vis('.m-buybar') && /1,495/.test(await page.locator('.m-buybar .m-total').textContent()));
  ok('focus moves to first error field', await page.evaluate(() => document.activeElement && document.activeElement.id === 'co-name'), await page.evaluate(() => document.activeElement.id));
  await page.fill('#co-name', 'سارة أحمد محمد العتيبي');
  await page.fill('#co-email', 'sara@example.com');
  await page.fill('#co-phone', '0512345678');
  if (await page.locator('#co-id').isVisible()) await page.fill('#co-id', '1012345678');
  if (await page.locator('#co-city').isVisible()) { const tag = await page.locator('#co-city').evaluate(e => e.tagName); if (tag === 'SELECT') await page.selectOption('#co-city', { index: 1 }); else await page.fill('#co-city', 'الرياض'); }
  await page.locator('#co-agree').check({ force: true });
  await page.locator('#co-submit').click(); await page.waitForTimeout(600);
  ok('checkout completes to the demo confirmation', await vis('#co-done'), await page.locator('[id$="-err"]:not([hidden])').allTextContents());

  R.push('INFO checkout state ' + JSON.stringify(await page.evaluate(() => ({ formHidden: document.getElementById('co-form').hidden, done: !document.getElementById('co-done').hidden, errs: [...document.querySelectorAll('[id$="-err"]:not([hidden])')].map(e => e.id), js: [...document.scripts].map(s => s.src).find(s => s.includes('site.js')) }))));
  if (!(await page.locator('#co-done').isVisible())) await page.evaluate(() => document.getElementById('co-form').dispatchEvent(new Event('reset')));   // let the run continue
  // 5. Review form with real clicks
  await go('course-capm.html');
  await page.evaluate(() => localStorage.removeItem('mt_reviews_pending'));
  await page.locator('.rf-open').scrollIntoViewIfNeeded(); await page.locator('.rf-open').click();
  await page.locator('label[for="rf-s4"]').click();
  await page.fill('#rf-name', 'خالد');
  await page.fill('#rf-comment', 'الدورة منظمة والمدرب واضح.');
  await page.locator('form.rf [type=submit]').click(); await page.waitForTimeout(300);
  ok('review submits without a phone number', await vis('.rf-pending'));
  ok('review keeps focus in view', await page.evaluate(() => document.activeElement.classList.contains('rf-pending')));

  // 6. Contact form validation
  await go('contact.html');
  const cf = page.locator('main form').first();
  await cf.locator('[type=submit]').click(); await page.waitForTimeout(300);
  ok('contact form blocks empty send', await cf.evaluate(f => !f.checkValidity()));

  // 7. Blog search
  await go('blog.html');
  const before = await page.evaluate(() => [...document.querySelectorAll('#bl-grid > li')].filter(e => !e.hidden && e.offsetParent).length);
  await page.fill('#bl-q', 'PMP'); await page.waitForTimeout(400);
  const after = await page.evaluate(() => [...document.querySelectorAll('#bl-grid > li')].filter(e => !e.hidden && e.offsetParent).length); const cnt = await page.locator('#bl-count').textContent();
  ok('blog search filters articles', after > 0 && (after < before || /\d/.test(cnt)), { before, after, cnt });

  ok('no JS errors during the run', errs.length === 0, errs.slice(0, 3));
  return (mobile ? 'MOBILE\n' : 'DESKTOP\n') + R.join('\n');
}

async page => {
  const pages = (await (await fetch('http://localhost:8765/tests/pages.json')).json());
  const out = [];
  const errs = []; let cur = '';
  page.on('console', m => { if (m.type() === 'error') errs.push([cur, 'console', m.text().slice(0, 160)]); });
  page.on('pageerror', e => errs.push([cur, 'pageerror', String(e.message).slice(0, 160)]));
  page.on('requestfailed', r => { if (r.url().startsWith('http://localhost') && !/ABORTED/.test((r.failure()||{}).errorText||'')) errs.push([cur, 'failed', r.url().slice(22, 140)]); });
  page.on('response', r => { if (r.status() >= 400 && r.url().startsWith('http://localhost')) errs.push([cur, 'HTTP ' + r.status(), r.url().slice(22, 140)]); });
  for (const p of pages) {
    cur = p;
    try {
      await page.goto('http://localhost:8765/' + p, { waitUntil: 'load', timeout: 20000 });
      const r = await page.evaluate(() => ({
        broken: [...document.images].filter(i => i.complete && i.loading !== 'lazy' && i.naturalWidth === 0 && i.getAttribute('src')).map(i => i.getAttribute('src').slice(0, 90)),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        h1: document.querySelectorAll('h1').length
      }));
      if (r.broken.length || r.overflow > 1 || r.h1 !== 1) out.push([p, r]);
    } catch (e) { errs.push([p, 'goto', String(e.message).slice(0, 120)]); }
  }
  return JSON.stringify({ out, errs });
}
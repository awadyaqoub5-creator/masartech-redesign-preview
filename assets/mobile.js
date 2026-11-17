/* Masartech redesign — Bakkah-style extras (loaded on every page, all sizes).
   1) Floating WhatsApp button + back-to-top button.
   2) Course pages: «محتويات البرنامج» table → module tabs on phones (the table stays for desktop and for no-JS). */
(function () {
  const WA = 'https://wa.me/966115116066';
  const waSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.1.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>';

  // 1) Floating buttons (skip print pages / iframes used for screenshots)
  if (!document.querySelector('.fab-wa')) {
    const a = document.createElement('a');
    a.className = 'fab-wa'; a.href = WA; a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('aria-label', 'تواصل معنا عبر واتساب (يفتح في نافذة جديدة)');
    a.innerHTML = waSvg;
    const t = document.createElement('button');
    t.type = 'button'; t.className = 'to-top'; t.setAttribute('aria-label', 'العودة لأعلى الصفحة');
    t.innerHTML = '<svg class="i" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
    t.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      const skip = document.querySelector('.skip-link, a[href="#main"]'); if (skip) skip.focus({ preventScroll: true });
    });
    document.body.append(a, t);
    const onScroll = () => t.classList.toggle('show', window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  // 2) Outline table → module tabs
  let uid = 0;
  document.querySelectorAll('.outline-box').forEach((box) => {
    const wrap = box.querySelector('.table-wrap');
    const table = wrap && wrap.querySelector('table');
    if (!table) return;
    const rows = [...table.querySelectorAll('tbody tr')].filter((r) => r.cells.length >= 2);
    if (rows.length < 3) return;
    const heads = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim());
    // PMI-style course pages: numbered module accordion instead of tabs
    if (box.closest('.cp-outline')) {
      const acc = document.createElement('div'); acc.className = 'ol-acc';
      rows.forEach((r, i) => {
        const cells = [...r.cells];
        const numbered = /^\s*\d+\s*$/.test(cells[0].textContent);
        const titleCell = numbered ? cells[1] : cells[0];
        const rest = cells.filter((c) => c !== titleCell && !(numbered && c === cells[0]));
        const d = document.createElement('details'); d.className = 'ol-item'; if (i === 0) d.open = true;
        const s = document.createElement('summary');
        s.innerHTML = '<span class="ol-n" aria-hidden="true"></span><span class="ol-t"></span><span class="ol-pm" aria-hidden="true"></span>';
        s.querySelector('.ol-n').textContent = String(i + 1).padStart(2, '0');
        s.querySelector('.ol-t').textContent = titleCell.textContent.trim();
        const body = document.createElement('div'); body.className = 'ol-body';
        if (rest.length === 1) {
          const parts = rest[0].textContent.split(/[،,؛;]\s*/).map((x) => x.trim()).filter(Boolean);
          if (parts.length > 1) { const ul = document.createElement('ul'); parts.forEach((x) => { const li = document.createElement('li'); li.textContent = x; ul.appendChild(li); }); body.appendChild(ul); }
          else { const p = document.createElement('p'); p.innerHTML = rest[0].innerHTML; body.appendChild(p); }
        } else {
          rest.forEach((c) => { const p = document.createElement('p'); const h = heads[cells.indexOf(c)]; p.innerHTML = (h ? '<b>' + h + ': </b>' : '') + c.innerHTML; body.appendChild(p); });
        }
        d.append(s, body); acc.appendChild(d);
      });
      wrap.classList.add('has-olm'); wrap.before(acc);
      return;
    }
    const id = 'olm' + (++uid);
    const m = document.createElement('div'); m.className = 'ol-m';
    const tabs = document.createElement('div'); tabs.className = 'ol-tabs'; tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'وحدات البرنامج');
    m.appendChild(tabs);
    const panels = [];
    rows.forEach((r, i) => {
      const cells = [...r.cells];
      const numbered = /^\s*\d+\s*$/.test(cells[0].textContent);
      const titleCell = numbered ? cells[1] : cells[0];
      const rest = cells.filter((c) => c !== titleCell && !(numbered && c === cells[0]));
      const title = titleCell.textContent.trim();
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'tab'); b.id = id + 't' + i;
      b.setAttribute('aria-controls', id + 'p' + i); b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.tabIndex = i === 0 ? 0 : -1; b.textContent = title; b.title = title;
      tabs.appendChild(b);
      const p = document.createElement('div');
      p.className = 'ol-panel'; p.id = id + 'p' + i; p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', b.id); p.tabIndex = 0;
      if (i) p.hidden = true;
      let html = '<h3>' + titleCell.innerHTML + '</h3>';
      if (numbered) html += '<span class="ol-num">' + (heads[0] || 'الوحدة') + ' ' + cells[0].textContent.trim() + ' من ' + rows.length + '</span>';
      if (rest.length === 1) {
        const parts = rest[0].textContent.split(/[،,؛;]\s*/).map((s) => s.trim()).filter(Boolean);
        html += parts.length > 1 ? '<ul>' + parts.map((s) => '<li></li>').join('') + '</ul>' : '<p>' + rest[0].innerHTML + '</p>';
        p.innerHTML = html;
        if (parts.length > 1) p.querySelectorAll('li').forEach((li, k) => { li.textContent = parts[k]; });
      } else {
        p.innerHTML = html + rest.map((c) => {
          const h = heads[cells.indexOf(c)];
          return '<p>' + (h ? '<b>' + h + ': </b>' : '') + c.innerHTML + '</p>';
        }).join('');
      }
      panels.push(p); m.appendChild(p);
    });
    const select = (i, focus) => {
      [...tabs.children].forEach((t, j) => { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; });
      panels.forEach((p, j) => { p.hidden = j !== i; });
      const t = tabs.children[i];
      t.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      if (focus) t.focus();
    };
    tabs.addEventListener('click', (e) => { const t = e.target.closest('[role=tab]'); if (t) select([...tabs.children].indexOf(t)); });
    tabs.addEventListener('keydown', (e) => {
      const i = [...tabs.children].indexOf(document.activeElement); if (i < 0) return;
      const n = tabs.children.length;
      // RTL: ArrowLeft moves to the next tab
      if (e.key === 'ArrowLeft') { e.preventDefault(); select((i + 1) % n, true); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); select((i - 1 + n) % n, true); }
      else if (e.key === 'Home') { e.preventDefault(); select(0, true); }
      else if (e.key === 'End') { e.preventDefault(); select(n - 1, true); }
    });
    wrap.classList.add('has-olm');
    wrap.before(m);
  });
})();

// Lock page scroll while the full-screen mobile menu is open
(function () {
  const nav = document.getElementById('mnav');
  if (!nav) return;
  const sync = () => document.documentElement.classList.toggle('menu-open', !nav.hidden && matchMedia('(max-width:1100px)').matches);
  new MutationObserver(sync).observe(nav, { attributes: true, attributeFilter: ['hidden'] });
})();

// Dots under phone swipe lists (home blog)
(function () {
  document.querySelectorAll('.home-blog').forEach((list) => {
    const items = [...list.children]; if (items.length < 2) return;
    const dots = document.createElement('div'); dots.className = 'm-dots'; dots.setAttribute('aria-hidden', 'true');
    items.forEach(() => dots.appendChild(document.createElement('span')));
    list.after(dots);
    const update = () => {
      const w = items[0].getBoundingClientRect().width + 14;
      const i = Math.min(items.length - 1, Math.round(Math.abs(list.scrollLeft) / w));
      [...dots.children].forEach((d, j) => d.classList.toggle('on', j === i));
    };
    list.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true }); update();
    const mq = matchMedia('(max-width:640px)'); const vis = () => { dots.hidden = !mq.matches; }; vis(); mq.addEventListener('change', vis);
  });
})();

// Scroll bar with arrows under horizontally scrolling tab bars (Bakkah style) — a real indicator that also works on iPhone,
// where native scrollbars are hidden. Shown only while the tabs overflow.
(function () {
  const rtl = document.documentElement.dir === 'rtl';
  const make = (tabs) => {
    if (tabs.nextElementSibling && tabs.nextElementSibling.classList.contains('tab-scroll')) return;
    const bar = document.createElement('div'); bar.className = 'tab-scroll';
    bar.innerHTML = '<button type="button" class="ts-btn ts-prev" aria-label="التبويبات السابقة"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button><div class="ts-track"><div class="ts-thumb"></div></div><button type="button" class="ts-btn ts-next" aria-label="التبويبات التالية"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>';
    tabs.after(bar);
    const track = bar.querySelector('.ts-track'), thumb = bar.querySelector('.ts-thumb');
    const prev = bar.querySelector('.ts-prev'), next = bar.querySelector('.ts-next');
    const update = () => {
      const max = tabs.scrollWidth - tabs.clientWidth;
      bar.hidden = max < 4 || getComputedStyle(tabs).flexDirection === 'column';
      if (bar.hidden) return;
      const f = Math.min(1, Math.abs(tabs.scrollLeft) / max);
      const w = Math.max(18, (tabs.clientWidth / tabs.scrollWidth) * 100);
      thumb.style.width = w + '%';
      thumb.style.insetInlineStart = (f * (100 - w)) + '%';
      prev.disabled = f < 0.01; next.disabled = f > 0.99;
    };
    const by = (d) => tabs.scrollBy({ left: d * tabs.clientWidth * 0.7 * (rtl ? -1 : 1), behavior: 'smooth' });
    prev.addEventListener('click', () => by(-1));
    next.addEventListener('click', () => by(1));
    track.addEventListener('click', (e) => {
      const r = track.getBoundingClientRect();
      let f = (e.clientX - r.left) / r.width; if (rtl) f = 1 - f;
      const max = tabs.scrollWidth - tabs.clientWidth;
      tabs.scrollTo({ left: f * max * (rtl ? -1 : 1), behavior: 'smooth' });
    });
    tabs.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update); update();
  };
  document.querySelectorAll('.ol-tabs, .about-tabs').forEach(make);
})();

// The about tabs are now a horizontal row at every size
document.querySelectorAll('.about-tabs[role=tablist]').forEach((t) => t.setAttribute('aria-orientation', 'horizontal'));

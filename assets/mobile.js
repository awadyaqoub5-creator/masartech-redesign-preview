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

/* ===== App-style phone layer (design-refs/mobile-1..5) =====
   - bottom tab bar (Home / Courses / Cart / Account) on every page except course pages and checkout
   - course pages: sticky price bar «احجز مقعدك» (hidden while the training options are on screen)
   - checkout: sticky total + pay button that submits the same form */
(function () {
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var isCourse = /^course-.+\.html$/.test(page), isCheckout = page === 'checkout.html';
  var SVG = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/></svg>',
    courses: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M9 8h7M9 11.5h5"/></svg>',
    cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2.2l2.3 11h10.8L20.5 7.5H6.6"/><circle cx="9.5" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'
  };
  function cartCount() { try { return (JSON.parse(localStorage.getItem('mt_cart') || '[]')).length; } catch (e) { return 0; } }

  if (!isCourse && !isCheckout) {
    var tabs = [['index.html', 'الرئيسية', 'home'], ['courses.html', 'الدورات', 'courses'], ['cart.html', 'السلة', 'cart'], ['login.html', 'حسابي', 'user']];
    var nav = document.createElement('nav');
    nav.className = 'm-tabbar'; nav.setAttribute('aria-label', 'التنقل السريع');
    nav.innerHTML = tabs.map(function (t) {
      var on = page === t[0] || (t[0] === 'courses.html' && /^(courses|schedule|supported-courses)\.html$/.test(page));
      var badge = t[2] === 'cart' && cartCount() ? '<span class="m-count" aria-hidden="true">' + cartCount() + '</span>' : '';
      var label = t[1] + (t[2] === 'cart' && cartCount() ? ' (' + cartCount() + ')' : '');
      return '<a href="' + t[0] + '"' + (on ? ' aria-current="page"' : '') + ' aria-label="' + label + '">' + SVG[t[2]] + '<span aria-hidden="true">' + t[1] + '</span>' + badge + '</a>';
    }).join('');
    document.body.appendChild(nav); document.body.classList.add('has-tabbar');
  }

  function bar(html) {
    var b = document.createElement('div'); b.className = 'm-buybar'; b.innerHTML = html;
    document.body.appendChild(b); document.body.classList.add('has-buybar'); return b;
  }
  if (isCourse) {
    var add = document.querySelector('[data-add-to-cart][data-price]');
    var price = add ? (+add.dataset.price).toLocaleString('en-US') : '';
    var b = bar((price ? '<span class="m-price"><small>ابتداءً من</small><b>' + price + ' <span class="sar" aria-label="ريال سعودي">\u20c1</span></b></span>' : '') +
      '<a class="btn btn-primary" href="#options">' + (document.querySelector('.opt select') ? 'احجز مقعدك' : 'خيارات التدريب') + '</a>');
    var opts = document.getElementById('options');
    if (opts && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { b.classList.toggle('is-hidden', e.isIntersecting); }); }, { rootMargin: '0px 0px -30% 0px' }).observe(opts);
    }
  }
  if (isCheckout) {
    var form = document.getElementById('co-form'), total = document.getElementById('co-total'), txt = document.getElementById('co-submit-text');
    if (form && total) {
      var cb = bar('<span class="m-price"><small>الإجمالي شامل الضريبة</small><b class="m-total"></b></span><button type="submit" form="co-form" class="btn btn-primary"></button>');
      var tEl = cb.querySelector('.m-total'), bEl = cb.querySelector('button');
      var sync = function () {
        if (tEl.innerHTML !== total.innerHTML) tEl.innerHTML = total.innerHTML;
        var label = txt ? txt.textContent.trim() : 'ادفع';
        if (bEl.textContent !== label) bEl.textContent = label;
        if (cb.hidden !== form.hidden) cb.hidden = form.hidden;
        document.body.classList.toggle('has-buybar', !form.hidden);
      };
      sync();
      var mo = new MutationObserver(sync);   // only the source nodes, never the bar itself
      mo.observe(total, { subtree: true, childList: true, characterData: true });
      if (txt) mo.observe(txt, { subtree: true, childList: true, characterData: true });
      mo.observe(form, { attributes: true, attributeFilter: ['hidden'] });
    }
  }
})();

/* WhatsApp button: on phones it waits until the hero is scrolled past, so it never covers the hero buttons */
(function () {
  var fab = document.querySelector('.fab-wa');
  if (!fab || !matchMedia('(max-width:900px)').matches) return;
  var sync = function () { fab.classList.toggle('fab-wait', window.scrollY < 420); };
  sync(); window.addEventListener('scroll', sync, { passive: true });
})();

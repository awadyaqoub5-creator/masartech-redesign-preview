/* Masartech redesign — shared behaviour (vanilla JS, no dependencies) */

// Mobile menu
(function () {
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById('mnav');
  if (!btn || !nav) return;
  const use = btn.querySelector('use');
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    btn.setAttribute('aria-label', open ? 'فتح القائمة' : 'إغلاق القائمة');
    nav.hidden = open;
    if (use) use.setAttribute('href', open ? '#i-menu' : '#i-x');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !nav.hidden) { btn.click(); btn.focus(); }
  });
})();

// Courses mega menu (desktop): click or hover opens, Escape / outside click closes; categories switch on hover, focus or click.
(function () {
  const btn = document.querySelector('.nav-mega');
  const panel = document.getElementById('mega-courses');
  if (!btn || !panel) return;
  const header = btn.closest('header');
  const hover = matchMedia('(hover:hover) and (pointer:fine)');
  let t;
  const set = (open) => { btn.setAttribute('aria-expanded', String(open)); panel.hidden = !open; };
  btn.addEventListener('click', () => { clearTimeout(t); set(btn.getAttribute('aria-expanded') !== 'true'); });
  [btn, panel].forEach((el) => {
    el.addEventListener('mouseenter', () => { if (hover.matches) { clearTimeout(t); t = setTimeout(() => set(true), 120); } });
    el.addEventListener('mouseleave', () => { if (hover.matches) { clearTimeout(t); t = setTimeout(() => set(false), 250); } });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { set(false); btn.focus(); } });
  document.addEventListener('click', (e) => { if (!panel.hidden && !header.contains(e.target)) set(false); });
  panel.addEventListener('focusout', (e) => { if (e.relatedTarget && !panel.contains(e.relatedTarget) && e.relatedTarget !== btn) set(false); });
  const cats = [...panel.querySelectorAll('.mm-cat')];
  const pick = (c) => cats.forEach((x) => { const on = x === c; x.setAttribute('aria-expanded', String(on)); document.getElementById(x.getAttribute('aria-controls')).hidden = !on; });
  cats.forEach((c, i) => {
    c.addEventListener('click', () => pick(c));
    c.addEventListener('focus', () => pick(c));
    c.addEventListener('mouseenter', () => { if (hover.matches) pick(c); });
    c.addEventListener('keydown', (e) => {
      const k = { ArrowDown: 1, ArrowUp: -1 }[e.key];
      if (k) { e.preventDefault(); cats[(i + k + cats.length) % cats.length].focus(); }
    });
  });
})();

// Tabs (WAI-ARIA). Works for every [role=tablist] on the page; arrow keys follow RTL visual order.
document.querySelectorAll('[role=tablist]').forEach((list) => {
  const tabs = [...list.querySelectorAll('[role=tab]')];
  const select = (t) => tabs.forEach((x) => {
    const on = x === t;
    x.setAttribute('aria-selected', on);
    x.tabIndex = on ? 0 : -1;
    const p = document.getElementById(x.getAttribute('aria-controls'));
    if (p) p.hidden = !on;
  });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const map = { ArrowLeft: tabs[(i + 1) % tabs.length], ArrowRight: tabs[(i - 1 + tabs.length) % tabs.length], Home: tabs[0], End: tabs[tabs.length - 1] };
      const n = map[e.key];
      if (n) { e.preventDefault(); select(n); n.focus(); }
    });
  });
});

// Filter chips + optional text search.
// <div data-filter-group="x"> <button data-filter="all|key" aria-pressed> ... items in #x with data-tags="key1 key2"
// <input data-search="x"> filters the same items by their text.
document.querySelectorAll('[data-filter-group]').forEach((group) => {
  const id = group.dataset.filterGroup;
  const target = document.getElementById(id);
  if (!target) return;
  const items = [...target.querySelectorAll('[data-tags]')];
  const status = document.getElementById(id + '-status');
  const search = document.querySelector('[data-search="' + id + '"]');
  const norm = (t) => t.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  // Search the card text plus the names of its categories (so «الموارد البشرية» finds every HR course).
  const labels = {};
  group.querySelectorAll('[data-filter]').forEach((b) => { labels[b.dataset.filter] = b.textContent; });
  const text = new Map(items.map((it) => [it, norm(it.textContent + ' ' + it.dataset.tags.split(' ').map((t) => labels[t] || '').join(' '))]));
  let key = 'all';
  let empty = null;
  const apply = () => {
    const q = search ? norm(search.value.trim()) : '';
    let n = 0;
    items.forEach((it) => {
      const show = (key === 'all' || it.dataset.tags.split(' ').includes(key)) && (!q || text.get(it).includes(q));
      it.hidden = !show; if (show) n++;
    });
    if (status) status.textContent = n + ' نتيجة';
    if (search) {
      if (!empty) { empty = document.createElement('li'); empty.className = 'no-results'; target.appendChild(empty); }
      empty.hidden = n > 0;
      empty.textContent = 'ما لقينا دورة بهذا الاسم. جرّب كلمة أخرى أو اختر «الكل».';
    }
  };
  group.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => {
    group.querySelectorAll('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    key = b.dataset.filter; apply();
  }));
  // Deep link from the menu: courses.html?cat=pm selects that category
  const pre = new URLSearchParams(location.search).get('cat');
  const preBtn = pre && group.querySelector('[data-filter="' + pre + '"]');
  if (preBtn) preBtn.click();
  if (search) {
    search.addEventListener('input', apply);
    if (location.hash === '#search') search.focus();
  }
});

// Scroll reveal (skipped for reduced motion)
(function () {
  const els = document.querySelectorAll('.reveal');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  els.forEach((e) => io.observe(e));
})();

// Prototype-only: forms don't submit anywhere
// Forms: the site has no server yet, so a valid form opens WhatsApp with the answers filled in and the visitor sends it there.
// Forms with a password (login, register) never send anything and keep their «demo» note.
const WA_NUMBER = '966115116066';
const waLink = (text) => 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
function formLines(f) {
  const out = [];
  f.querySelectorAll('input, select, textarea').forEach((el) => {
    if (el.disabled || ['hidden', 'submit', 'button', 'reset', 'password', 'file'].includes(el.type) || el.closest('[hidden]')) return;
    if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
    let v = el.tagName === 'SELECT' ? (el.selectedOptions[0] || {}).text : el.value;
    if (el.type === 'checkbox' && el.value === 'on') v = 'نعم';
    if (!v || !String(v).trim()) return;
    const lab = (el.id && f.querySelector('label[for="' + CSS.escape(el.id) + '"]')) || el.closest('label');
    let name = lab ? lab.textContent.replace(String(el.value), '') : (el.getAttribute('aria-label') || el.name);
    name = name.replace('*', '').replace(/\s+/g, ' ').trim();
    out.push((name ? name + ': ' : '') + String(v).trim());
  });
  return out;
}
function waSent(msg, url) {
  if (!msg) return;
  msg.textContent = '';
  const p = document.createElement('span');
  p.textContent = 'فتحنا لك واتساب برسالة فيها بياناتك. اضغط «إرسال» هناك ليصل طلبك لفريق مسارتك. ';
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'لم يفتح واتساب؟ افتحه من هنا';
  msg.append(p, a);
  msg.hidden = false; msg.focus();
}
document.querySelectorAll('form[data-demo]').forEach((f) => f.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!f.reportValidity()) return;
  const msg = f.querySelector('[data-demo-msg]');
  if (f.querySelector('input[type=password]')) { if (msg) { msg.hidden = false; msg.focus(); } return; }
  const head = document.querySelector('main h1');
  const url = waLink(['طلب من موقع مسارتك: ' + (head ? head.textContent.trim() : document.title)].concat(formLines(f)).join('\n'));
  window.open(url, '_blank', 'noopener');
  waSent(msg, url);
}));
// Newsletter: the email goes to the team on WhatsApp, as above
document.querySelectorAll('form[data-news]').forEach((f) => f.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!f.reportValidity()) return;
  const url = waLink('أرغب في الاشتراك في نشرة مسارتك البريدية: ' + f.querySelector('input[type=email]').value.trim());
  window.open(url, '_blank', 'noopener');
  waSent(f.parentElement.querySelector('[data-news-msg]'), url);
}));

// Catalog filters (courses.html): checkboxes AND across groups / OR inside a group, text search, sort, counts.
(function () {
  const form = document.querySelector('form[data-catalog]');
  if (!form) return;
  const list = document.getElementById(form.dataset.catalog);
  const items = [...list.children];
  const box = document.getElementById('filters-box');
  const countEl = document.getElementById('course-count');
  const status = document.getElementById('course-list-status');
  const empty = document.getElementById('course-empty');
  const active = document.getElementById('f-active');
  const search = document.getElementById('course-search');
  const sort = document.getElementById('course-sort');
  const norm = (t) => t.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  const groups = ['cat', 'level', 'modes', 'hadaf'];
  const labels = {};
  form.querySelectorAll('input[type=checkbox]').forEach((i) => { labels[i.value] = i.parentElement.querySelector('span').textContent; });
  const text = new Map(items.map((it) => [it, norm(it.textContent + ' ' + (labels[it.dataset.cat] || ''))]));
  const has = (it, g, v) => (it.dataset[g] || '').split(' ').includes(v);
  const sel = () => Object.fromEntries(groups.map((g) => [g, [...form.querySelectorAll('input[name="' + g + '"]:checked')].map((i) => i.value)]));
  const match = (it, s, q, skip) => groups.every((g) => g === skip || !s[g].length || s[g].some((v) => has(it, g, v))) && (!q || text.get(it).includes(q));
  const apply = () => {
    const s = sel(); const q = norm(search.value.trim());
    let n = 0;
    items.forEach((it) => { const show = match(it, s, q); it.hidden = !show; if (show) n++; });
    // counts per option, given the other groups' choices
    form.querySelectorAll('[data-count]').forEach((c) => {
      const [g, v] = c.dataset.count.split(':');
      c.textContent = items.filter((it) => has(it, g, v) && match(it, s, q, g)).length;
    });
    const picked = groups.reduce((a, g) => a + s[g].length, 0);
    active.hidden = !picked; active.textContent = picked + ' مفعّل';
    countEl.textContent = n; status.textContent = n + ' دورة';
    const fn = document.getElementById('f-n'); if (fn) fn.textContent = n;
    const fb = document.getElementById('f-badge'); if (fb) { fb.hidden = !picked; fb.textContent = picked; }
    empty.hidden = n > 0;
    // sort
    const k = sort.value;
    const num = (it, a) => (it.dataset[a] === '' ? Infinity : a === 'price' ? +it.dataset.price : Date.parse(it.dataset.date));
    const sorted = [...items].sort((x, y) => k === 'name' ? x.querySelector('h3').textContent.localeCompare(y.querySelector('h3').textContent, 'ar')
      : k === 'price-asc' ? num(x, 'price') - num(y, 'price')
      : k === 'price-desc' ? (num(y, 'price') === Infinity ? -1 : num(x, 'price') === Infinity ? 1 : num(y, 'price') - num(x, 'price'))
      : num(x, 'date') - num(y, 'date'));
    sorted.forEach((it) => list.appendChild(it));
    // the URL reflects the filters, search and sort, so a result can be shared or bookmarked
    const u = new URLSearchParams();
    groups.forEach((g) => { if (s[g].length) u.set(g, s[g].join(',')); });
    if (search.value.trim()) u.set('q', search.value.trim());
    if (sort.selectedIndex > 0) u.set('sort', sort.value);
    const qs = u.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  };
  form.addEventListener('change', apply);
  search.addEventListener('input', apply);
  sort.addEventListener('change', apply); // the select sits outside the <form> element (form= attribute), so its events don't bubble to it
  form.addEventListener('reset', () => setTimeout(apply));
  document.querySelectorAll('[data-reset="' + form.id + '"]').forEach((b) => b.addEventListener('click', () => form.reset()));
  form.addEventListener('submit', (e) => e.preventDefault());
  // deep links: ?cat=pm (from the menu) and #search (from the header)
  // deep links: ?cat=pm and/or ?level=b (from the menu and the homepage career paths)
  const params = new URLSearchParams(location.search);
  let preBox = null;
  groups.forEach((g) => (params.get(g) || '').split(',').filter(Boolean).forEach((v) => { const b = form.querySelector('input[name="' + g + '"][value="' + CSS.escape(v) + '"]'); if (b) { b.checked = true; preBox = preBox || b; } }));
  if (params.get('sort') && sort.querySelector('option[value="' + CSS.escape(params.get('sort')) + '"]')) sort.value = params.get('sort');
  if (params.get('q')) { search.value = params.get('q'); setTimeout(apply); }   // ?q= from the homepage search
  // Mobile (<=1100px): filters open as a full-screen sheet from the "تصفية" button (Bakkah-style), with close + apply buttons.
  const mq = matchMedia('(max-width:1100px)');
  const panel = document.getElementById('filters-panel');
  const opener = document.querySelector('.f-open');
  const openSheet = () => {
    box.open = true; panel.classList.add('open'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
    opener.setAttribute('aria-expanded', 'true'); document.body.classList.add('no-scroll');
    const first = panel.querySelector('.f-x'); if (first) first.focus();
  };
  const closeSheet = () => {
    if (!panel.classList.contains('open')) return;
    panel.classList.remove('open'); panel.removeAttribute('role'); panel.removeAttribute('aria-modal');
    opener.setAttribute('aria-expanded', 'false'); document.body.classList.remove('no-scroll'); opener.focus();
  };
  if (opener && panel) {
    opener.addEventListener('click', openSheet);
    panel.querySelectorAll('.f-x, .f-close, .f-apply').forEach((b) => b.addEventListener('click', closeSheet));
    panel.addEventListener('click', (e) => { if (e.target === panel) closeSheet(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
    box.querySelector('summary').addEventListener('click', (e) => { if (mq.matches) e.preventDefault(); });
    mq.addEventListener('change', () => { if (!mq.matches) closeSheet(); box.open = true; });
    box.open = true;
  }
  apply();
  if (location.hash === '#search') search.focus();
})();

// Reviews carousel: native scroll-snap + arrow buttons + dots.
document.querySelectorAll('[data-carousel]').forEach((c) => {
  const track = c.querySelector('.rv-track');
  const prev = c.querySelector('.prev'), next = c.querySelector('.next');
  const dots = c.parentElement.querySelector('.rv-dots');
  const slides = [...track.children];
  slides.forEach(() => dots && dots.appendChild(document.createElement('span')));
  const step = () => slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 20);
  const dir = getComputedStyle(track).direction === 'rtl' ? -1 : 1;
  const update = () => {
    const x = Math.abs(track.scrollLeft); const max = track.scrollWidth - track.clientWidth;
    prev.disabled = x < 4; next.disabled = x > max - 4;
    const i = Math.round(x / step());
    if (dots) [...dots.children].forEach((d, j) => d.classList.toggle('on', j === i));
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step() * dir }));
  next.addEventListener('click', () => track.scrollBy({ left: step() * dir }));
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  track.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -step() }); } if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: step() }); } });
  update();
  // Autoplay ([data-autoplay]): advance every 3.5s, loop back at the end, pause on hover/focus or with the button; off for reduced motion.
  if (c.hasAttribute('data-autoplay') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let paused = false, hover = false;
    const tick = () => {
      if (paused || hover || document.hidden) return;
      const max = track.scrollWidth - track.clientWidth;
      if (Math.abs(track.scrollLeft) > max - 4) track.scrollTo({ left: 0 }); else track.scrollBy({ left: step() * dir });
    };
    let timer = setInterval(tick, 3500);
    c.addEventListener('mouseenter', () => { hover = true; });
    c.addEventListener('mouseleave', () => { hover = false; });
    c.addEventListener('focusin', () => { hover = true; });
    c.addEventListener('focusout', () => { hover = false; });
    track.addEventListener('pointerdown', () => { clearInterval(timer); timer = setInterval(tick, 3500); });
    const b = document.createElement('button'); b.type = 'button'; b.className = 'marquee-toggle';
    b.setAttribute('aria-pressed', 'false'); b.textContent = 'إيقاف الحركة';
    b.addEventListener('click', () => { paused = !paused; b.setAttribute('aria-pressed', String(paused)); b.textContent = paused ? 'تشغيل الحركة' : 'إيقاف الحركة'; });
    (dots || c).after(b);
  }
});

// Moving logo rows: [data-marquee] lists scroll continuously; pause on hover/focus or with the button; static when reduced motion is on.
document.querySelectorAll('ul[data-marquee]').forEach((ul) => {
  const wrap = document.createElement('div'); wrap.className = 'marquee';
  const track = document.createElement('div'); track.className = 'marquee-track';
  ul.parentNode.insertBefore(wrap, ul); wrap.appendChild(track); track.appendChild(ul);
  ul.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; });
  // Repeat the logos inside the first set until it is wider than the visible strip, so the loop never shows an empty gap
  const base = [...ul.children];
  let guard = 0;
  while (ul.scrollWidth < wrap.clientWidth * 1.1 && guard++ < 10) {
    base.forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.inert = true; c.querySelectorAll('a,button').forEach((x) => x.setAttribute('tabindex', '-1')); c.querySelectorAll('img').forEach((i) => i.setAttribute('alt', '')); ul.appendChild(c); });
  }
  const copy = ul.cloneNode(true); copy.setAttribute('aria-hidden', 'true'); copy.inert = true;
  copy.querySelectorAll('a,button').forEach((a) => a.setAttribute('tabindex', '-1'));
  copy.querySelectorAll('img').forEach((i) => i.setAttribute('alt', ''));
  track.appendChild(copy);
  track.style.setProperty('--marquee-dur', Math.max(25, ul.children.length * (parseFloat(ul.dataset.marqueeSpeed) || 3.5)) + 's');   // seconds per item (wider cards move slower)
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'marquee-toggle';
  btn.setAttribute('aria-pressed', 'false'); btn.textContent = 'إيقاف الحركة';
  btn.addEventListener('click', () => { const p = wrap.classList.toggle('paused'); btn.setAttribute('aria-pressed', String(p)); btn.textContent = p ? 'تشغيل الحركة' : 'إيقاف الحركة'; });
  wrap.after(btn);
});

// Unsaved form data: warn before leaving a page with a filled-in form that is still on screen
// (not search, filters, newsletter or sign-in; a form hidden after a successful send never warns).
(function () {
  const forms = [...document.querySelectorAll('form')].filter((f) => !f.matches('[role=search], [data-catalog]') && !f.closest('.news') && !f.querySelector('input[type=password]'));
  if (!forms.length) return;
  const dirty = new Set();
  forms.forEach((f) => {
    f.addEventListener('input', () => dirty.add(f));
    f.addEventListener('submit', () => { if (f.checkValidity()) dirty.delete(f); });
    f.addEventListener('reset', () => dirty.delete(f));
  });
  window.addEventListener('beforeunload', (e) => {
    if ([...dirty].some((f) => !f.hidden && f.getClientRects().length)) { e.preventDefault(); e.returnValue = ''; }
  });
})();

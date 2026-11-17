/* Masartech redesign — demo cart (prototype only).
   Stores items in localStorage ("mt_cart") so the add-to-cart → cart page flow can be tried.
   The real site must keep the cart on the server (session / user account) and price it server-side. */
(function () {
  const KEY = 'mt_cart';
  const VAT = 0.15;
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const write = (items) => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* private mode: cart lives for this page only */ } badge(items); };
  const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' <span class="sar" aria-label="ريال سعودي">\u20c1</span>';

  // Header badge with the item count
  function badge(items) {
    document.querySelectorAll('a.icon-btn[href="cart.html"]').forEach((a) => {
      let b = a.querySelector('.cart-count');
      if (!b) { b = document.createElement('span'); b.className = 'cart-count'; b.setAttribute('aria-hidden', 'true'); a.appendChild(b); }
      b.textContent = items.length; b.hidden = !items.length;
      a.setAttribute('aria-label', items.length ? 'السلة، ' + items.length + ' دورة' : 'السلة');
    });
  }
  badge(read());

  // Small confirmation after adding
  function toast(msg) {
    let t = document.getElementById('cart-toast');
    if (!t) {
      t = document.createElement('div'); t.id = 'cart-toast'; t.className = 'cart-toast'; t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.innerHTML = '<span>' + msg + '</span><a href="cart.html">عرض السلة</a>';
    t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 5000);
  }

  // [data-add-to-cart] buttons. Optional data-session-select = selector of a <select> with the chosen date.
  document.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const d = btn.dataset;
      const sel = d.sessionSelect && document.querySelector(d.sessionSelect);
      const session = sel ? sel.value : (d.session || '');
      const id = d.id + '|' + d.mode + '|' + session;
      const items = read();
      if (items.some((i) => i.id === id)) { toast('الدورة موجودة في السلة بنفس الموعد.'); return; }
      items.push({ id, name: d.name, mode: d.mode, session, price: +d.price, img: d.img || '', href: d.href || '' });
      write(items);
      toast('أُضيفت «' + d.name + '» إلى السلة.');
    });
  });

  // Cart page
  const list = document.getElementById('cart-list');
  if (!list) return;
  const empty = document.getElementById('cart-empty');
  const filled = document.getElementById('cart-filled');
  const out = (id, v) => { const e = document.getElementById(id); if (e) e.innerHTML = v; };

  function render() {
    const items = read();
    empty.hidden = !!items.length; filled.hidden = !items.length;
    list.innerHTML = '';
    items.forEach((it) => {
      const li = document.createElement('li'); li.className = 'ci';
      li.innerHTML =
        (it.img ? '<img src="' + it.img + '" alt="" width="72" height="72">' : '') +
        '<div class="ci-body"><h3><a></a></h3><div class="ci-tags"><span class="pill"></span>' + (it.session ? '<span class="pill alt ci-date"></span>' : '') + '</div>' +
        '<p class="ci-price"><strong></strong><small>شامل الضريبة</small></p></div>' +
        '<button type="button" class="ci-del"><svg class="i" aria-hidden="true"><use href="#i-x"/></svg><span>حذف</span></button>';
      const a = li.querySelector('h3 a'); a.textContent = it.name; a.href = it.href || 'course.html';
      li.querySelector('.pill').textContent = it.mode;
      if (it.session) li.querySelector('.ci-date').textContent = it.session;
      li.querySelector('.ci-price strong').innerHTML = fmt(it.price);
      const del = li.querySelector('.ci-del');
      del.setAttribute('aria-label', 'حذف ' + it.name + ' من السلة');
      del.addEventListener('click', () => { write(read().filter((x) => x.id !== it.id)); render(); document.getElementById('cart-title').focus(); });
      list.appendChild(li);
    });
    const total = items.reduce((s, i) => s + i.price, 0);
    const net = Math.round((total / (1 + VAT)) * 100) / 100;
    out('sum-net', fmt(net));
    out('sum-vat', fmt(Math.round((total - net) * 100) / 100));
    out('sum-total', fmt(total));
    out('tabby-part', fmt(Math.round((total / 4) * 100) / 100));
    out('tamara-part', fmt(Math.round((total / 4) * 100) / 100));
    out('cart-count-text', items.length + (items.length === 1 ? ' دورة' : ' دورات'));
  }
  render();

  // Coupon: no real codes in the prototype
  const cf = document.getElementById('coupon-form');
  if (cf) cf.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = cf.querySelector('input').value.trim(); const m = document.getElementById('coupon-msg');
    m.hidden = false; m.textContent = v ? 'كود الخصم غير صالح أو منتهي.' : 'اكتب كود الخصم أولًا.';
    m.className = 'coupon-msg err';
  });
})();

/* Masartech redesign — checkout page (prototype only).
   Reads the demo cart from localStorage ("mt_cart", written by assets/cart.js), shows the order summary,
   validates the trainee form and switches the button label per payment method. It never collects card data
   and never sends anything: the real site prices the order on the server and redirects to the gateway's hosted page. */
(function () {
  const form = document.getElementById('co-form');
  if (!form) return;
  // checkout.html?seat=1: a camp seat reservation (written by assets/camp-seat.js), kept apart from the course cart
  const SEAT = new URLSearchParams(location.search).has('seat');
  const KEY = SEAT ? 'mt_seat' : 'mt_cart';
  const VAT = 0.15;
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const SAR = ' <span class="sar" aria-label="ريال سعودي">⃁</span>';
  const num = (n) => n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
  // price null = amount not set yet (camp seat fee): show a placeholder instead of a number
  const fmt = (n) => (typeof n === 'number' ? num(n) + SAR : '<span class="placeholder">[المبلغ]</span>');
  const $ = (id) => document.getElementById(id);
  const empty = $('co-empty');
  const done = $('co-done');
  let total = 0;

  function render() {
    const items = read();
    empty.hidden = !!items.length; form.hidden = !items.length; done.hidden = true;
    const ul = $('co-items'); ul.innerHTML = '';
    items.forEach((it) => {
      const li = document.createElement('li'); li.className = 'co-item';
      li.innerHTML = (it.img ? '<img src="' + it.img + '" alt="" width="52" height="52">' : '') +
        '<div><p class="co-iname"></p><p class="co-imeta"></p></div><b class="co-iprice"></b>';
      li.querySelector('.co-iname').textContent = it.name;
      li.querySelector('.co-imeta').textContent = [it.mode, it.session].filter(Boolean).join(' · ');
      li.querySelector('.co-iprice').innerHTML = fmt(it.price);
      ul.appendChild(li);
    });
    total = items.some((i) => typeof i.price !== 'number') ? null : items.reduce((s, i) => s + i.price, 0);
    const net = total === null ? null : Math.round((total / (1 + VAT)) * 100) / 100;
    $('co-net').innerHTML = fmt(net);
    $('co-vat-sum').innerHTML = fmt(total === null ? null : Math.round((total - net) * 100) / 100);
    $('co-total').innerHTML = fmt(total);
    document.querySelectorAll('[data-part]').forEach((b) => { b.innerHTML = fmt(total === null ? null : Math.round((total / 4) * 100) / 100); });
    method();
  }

  const NOTES = {
    card: 'تُدخل بيانات البطاقة في صفحة بوابة الدفع الآمنة، ولا يحفظها موقع مسارتك.',
    apple: 'يظهر لك طلب الدفع من Apple Pay لتأكيده من جهازك.',
    tabby: 'تنتقل إلى tabby لإكمال التقسيط، والخطة النهائية وشروطها تظهر هناك.',
    tamara: 'تنتقل إلى تمارا لإكمال التقسيط، والخطة النهائية وشروطها تظهر هناك.',
  };
  function method() {
    const v = (form.querySelector('input[name="pay"]:checked') || {}).value || 'card';
    form.querySelectorAll('.co-opt').forEach((o) => o.classList.toggle('on', o.querySelector('input').checked));
    $('co-pay-note').querySelector('span').textContent = NOTES[v];
    $('co-submit-text').innerHTML = v === 'tabby' ? 'المتابعة إلى tabby' : v === 'tamara' ? 'المتابعة إلى تمارا' : v === 'apple' ? 'ادفع عبر Apple Pay ' + fmt(total) : 'ادفع ' + fmt(total);
  }
  form.addEventListener('change', (e) => { if (e.target.name === 'pay') method(); });

  // Invoice for an organisation
  const tog = $('co-org-toggle');
  tog.addEventListener('change', () => { $('co-org').hidden = !tog.checked; });

  // Validation: errors next to each field, focus the first invalid one
  function check(input) {
    const err = input.id && $(input.id + '-err');
    const bad = !input.checkValidity();
    input.setAttribute('aria-invalid', bad ? 'true' : 'false');
    if (err) err.hidden = !bad;
    return !bad;
  }
  form.querySelectorAll('input[required]').forEach((i) => i.addEventListener('blur', () => { if (i.value || i.type === 'checkbox') check(i); }));
  // once a field is marked invalid, re-check it while typing, so its error clears before the field loses focus
  // (clearing on blur shifts the layout under the pointer and the click on the pay button misses)
  form.querySelectorAll('input[required], #co-org input').forEach((i) => i.addEventListener(i.type === 'checkbox' ? 'change' : 'input', () => { if (i.getAttribute('aria-invalid') === 'true') check(i); }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let first = null;
    form.querySelectorAll('input[required], #co-org input').forEach((i) => { if (!check(i) && !first) first = i; });
    if (first) { first.focus(); return; }
    form.hidden = true; done.hidden = false;
    document.querySelector('.co-steps .now').classList.replace('now', 'done');
    const last = document.querySelector('.co-steps li:last-child'); last.classList.add('now'); last.setAttribute('aria-current', 'step');
    $('co-done-title').focus();
  });
  $('co-back').addEventListener('click', () => {
    const s = document.querySelectorAll('.co-steps li');
    s[1].classList.replace('done', 'now'); s[2].classList.remove('now'); s[2].removeAttribute('aria-current');
    render(); $('co-title').focus();
  });

  // Empty cart: one-click demo item so the page can be previewed
  function demo() {
    try {
      localStorage.setItem(KEY, JSON.stringify([{ id: 'pmp|حضوري في الرياض|demo', name: 'دورة إدارة المشاريع PMP من PMI بالرياض 35 ساعه تأهيل لشهادة PMP أونلاين وحضوري', mode: 'حضوري في الرياض', session: 'الجمعة 04/12/2026 · 06:00 – 10:00 مساءً', price: 1495, img: 'assets/live/assets-images-products-product_images-34-1-1789738310.webp', href: 'course-pmp.html' }]));
    } catch (err) { /* private mode */ }
  }
  $('co-demo').addEventListener('click', () => { demo(); render(); });
  if (SEAT) {
    document.title = 'حجز مقعد المعسكر والدفع | معهد مسارتك للتدريب';
    $('co-title').textContent = 'حجز مقعدك في المعسكر';
    try {
      const who = JSON.parse(localStorage.getItem('mt_seat_who')) || {};
      [['co-name', who.name], ['co-email', who.email], ['co-phone', who.phone]].forEach(([id, val]) => { if (val && $(id) && !$(id).value) $(id).value = val; });
    } catch (e) { /* nothing to prefill */ }
  }
  if (location.hash === '#demo' && !read().length) demo();   // checkout.html#demo = preview with a sample course
  render();
})();

/* plan.js: behaviour for the plan pages (tools/gen_plan_pages.py): the «أي شهادة تناسبك؟» quiz, glossary search and filter,
   and the certificate-check demo. Each part runs only when its markup is on the page. */
(function () {
  // ---------- quiz: one question at a time, then a result built from real course pages ----------
  var qz = document.getElementById('qz'), dataEl = document.getElementById('qz-data');
  if (qz && dataEl) {
    var DATA = JSON.parse(dataEl.textContent);
    var qs = [].slice.call(qz.querySelectorAll('.qz-q')), i = 0;
    var prev = qz.querySelector('[data-prev]'), next = qz.querySelector('[data-next]'), err = qz.querySelector('.qz-err'), res = qz.querySelector('.qz-res');
    var bar = document.createElement('div'); bar.className = 'qz-bar'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<i></i>';
    qz.insertBefore(bar, qz.firstChild); qz.classList.add('js');
    // answers are not data entry: keep site.js's «unsaved form» warning from firing when the visitor leaves the quiz
    qz.addEventListener('input', function (e) { e.stopPropagation(); }, true);
    var FIELD = { pm: 'إدارة المشاريع', hr: 'الموارد البشرية', net: 'الشبكات', sec: 'الأمن السيبراني', data: 'تحليل البيانات', gov: 'حوكمة تقنية المعلومات', fin: 'المحاسبة والمراجعة' };
    var GOAL = { job: 'تبدأ بها أول وظيفة', up: 'تدعم ترقيتك في عملك', 'switch': 'تنقلك إلى مجال جديد', intl: 'تثبت خبرتك باعتراف دولي' };
    var MODE = { 'class': 'متاحة حضوريًا في الرياض', online: 'متاحة أونلاين مباشر', any: 'حضوري في الرياض أو أونلاين مباشر' };
    function val(n) { var c = qz.querySelector('input[name="' + n + '"]:checked'); return c ? c.value : null; }
    function show() {
      qs.forEach(function (q, k) { q.classList.toggle('on', k === i); });
      prev.hidden = i === 0; next.textContent = i === qs.length - 1 ? 'اعرض النتيجة' : 'التالي';
      bar.firstChild.style.width = ((i + 1) / qs.length * 100) + '%'; err.hidden = true;
    }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function result() {
      var f = val('f'), x = val('x'), d = DATA[f], list = d[x];
      var cards = list.map(function (c, k) {
        return '<li><a class="pc-card" href="' + esc(c.href) + '"><img src="' + esc(c.img) + '" alt="" width="64" height="64"><span><b>' + esc(c.name) + '</b><small>' +
          (k === 0 ? 'الأنسب لك' : 'خيار آخر') + '</small></span></a></li>';
      }).join('');
      res.innerHTML = '<p class="pg-kicker">نتيجتك في ' + FIELD[f] + '</p><h2>ننصحك بـ ' + esc(list[0].name) + '</h2>' +
        '<p>شهادة ' + GOAL[val('g')] + '، و' + MODE[val('m')] + '. هذا ترشيح مبدئي، وفريقنا يساعدك في الاختيار النهائي.</p>' +
        '<ul class="pc-grid list-reset">' + cards + '</ul><div class="cta-row">' +
        (d.track ? '<a class="btn btn-primary" href="' + d.track + '.html">اعرض المسار الكامل</a>' : '<a class="btn btn-primary" href="paths.html">مسارات التعلم</a>') +
        '<a class="btn btn-outline" href="https://api.whatsapp.com/send?phone=966115116066">اسأل مستشارًا</a><button type="button" class="btn btn-outline" data-again>أعد الاختبار</button></div>';
      qs.forEach(function (q) { q.classList.remove('on'); });
      prev.hidden = next.hidden = true; bar.firstChild.style.width = '100%'; res.hidden = false; res.focus();
      res.querySelector('[data-again]').addEventListener('click', function () { qz.reset(); res.hidden = true; next.hidden = false; i = 0; show(); qs[0].querySelector('input').focus(); });
    }
    next.addEventListener('click', function () {
      if (!qs[i].querySelector('input:checked')) { err.hidden = false; qs[i].querySelector('input').focus(); return; }
      if (i < qs.length - 1) { i++; show(); qs[i].querySelector('input').focus(); } else result();
    });
    prev.addEventListener('click', function () { if (i > 0) { i--; show(); qs[i].querySelector('input').focus(); } });
    qz.addEventListener('submit', function (e) { e.preventDefault(); next.click(); });
    show();
  }

  // ---------- glossary: search (Arabic or English) + field filter ----------
  var gq = document.getElementById('gl-q');
  if (gq) {
    var rows = [].slice.call(document.querySelectorAll('.gl-row')), secs = [].slice.call(document.querySelectorAll('.gl-sec'));
    var tabs = [].slice.call(document.querySelectorAll('.gl-tabs button')), count = document.querySelector('.gl-count'), empty = document.querySelector('.gl-empty');
    var norm = function (s) { return s.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ً-ْ]/g, ''); };
    rows.forEach(function (r) { r._t = norm(r.textContent); });
    var field = '';
    function run() {
      var q = norm(gq.value.trim()), n = 0;
      secs.forEach(function (s) {
        var on = !field || s.dataset.f === field, any = 0;
        s.querySelectorAll('.gl-row').forEach(function (r) { var ok = on && (!q || r._t.indexOf(q) > -1); r.hidden = !ok; if (ok) any++; });
        s.hidden = !any; n += any;
      });
      count.textContent = n + ' مصطلحًا'; empty.hidden = n > 0;
    }
    gq.addEventListener('input', run);
    tabs.forEach(function (b) { b.addEventListener('click', function () { field = b.dataset.f; tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t === b)); }); run(); }); });
    run();
  }

  // ---------- practice questions: check one answer at a time, keep a running score ----------
  var pqs = [].slice.call(document.querySelectorAll('.pq'));
  if (pqs.length) {
    var score = document.querySelector('.pq-score'), done = 0, right = 0;
    pqs.forEach(function (li) {
      li.addEventListener('input', function (e) { e.stopPropagation(); }, true);   // not data entry: no «unsaved form» warning
      var btn = li.querySelector('[data-check]'), why = li.querySelector('.pq-why'), res = li.querySelector('.pq-res');
      btn.addEventListener('click', function () {
        var c = li.querySelector('input:checked');
        if (!c) { res.textContent = 'اختر إجابة أولًا.'; res.className = 'pq-res no'; why.hidden = false; return; }
        var ans = li.dataset.ans, ok = c.value === ans, first = !li.dataset.done;
        li.querySelectorAll('label').forEach(function (l) { var v = l.querySelector('input').value; l.classList.toggle('ok', v === ans); l.classList.toggle('no', v === c.value && !ok); });
        res.textContent = ok ? 'إجابة صحيحة.' : 'إجابة غير صحيحة. الصحيحة مظللة بالأخضر.'; res.className = 'pq-res ' + (ok ? 'ok' : 'no'); why.hidden = false;
        if (first) { li.dataset.done = '1'; done++; if (ok) right++; li.querySelectorAll('input').forEach(function (i) { i.disabled = true; }); btn.hidden = true; }
        score.textContent = 'أجبت عن ' + done + ' من ' + pqs.length + (done ? '، الصحيح منها ' + right : '');
      });
    });
  }

  // ---------- payback calculator (visitor's own numbers) ----------
  var calc = document.getElementById('calc');
  if (calc) {
    var fmt = function (n) { return Math.round(n).toLocaleString('en-US') + ' ر.س'; };
    calc.addEventListener('submit', function (e) {
      e.preventDefault();
      var get = function (id) { return parseFloat(document.getElementById(id).value); };
      var cost = get('c-cost'), sal = get('c-sal'), pct = get('c-raise'), bad = null;
      [['c-cost', cost], ['c-sal', sal], ['c-raise', pct]].forEach(function (f) {
        var el = document.getElementById(f[0]), ok = !isNaN(f[1]) && f[1] >= 0; el.toggleAttribute('aria-invalid', !ok); if (!ok && !bad) bad = el;
      });
      if (bad) { bad.focus(); return; }
      var m = sal * pct / 100, r = calc.querySelector('.calc-res');
      r.querySelector('[data-o="m"]').textContent = fmt(m);
      r.querySelector('[data-o="p"]').textContent = m > 0 ? (function (k) { return k === 1 ? 'شهر واحد' : k === 2 ? 'شهرين' : k <= 10 ? k + ' أشهر' : k + ' شهرًا'; })(Math.ceil(cost / m)) :'لا تُسترد بدون زيادة';
      r.querySelector('[data-o="y"]').textContent = fmt(m * 12 - cost);
      r.hidden = false; r.focus();
    });
  }

  // ---------- certificate check (prototype: shows the result layout) ----------
  var vf = document.getElementById('vf');
  if (vf) {
    vf.addEventListener('submit', function (e) {
      e.preventDefault();
      var no = document.getElementById('v-no');
      if (!no.value.trim()) { no.setAttribute('aria-invalid', 'true'); no.focus(); return; }
      no.removeAttribute('aria-invalid');
      var r = vf.querySelector('.vf-res'); r.hidden = false; r.focus();
    });
  }
})();

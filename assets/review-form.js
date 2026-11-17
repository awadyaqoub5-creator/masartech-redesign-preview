/* Course review form (course-*.html, #reviews): stars + name + Saudi mobile + comment.
   - The mobile number is for verification only: it is sent to the server and never shown on the page.
   - Set data-endpoint on <form class="rf"> to a URL that accepts POST JSON:
       { course, courseName, rating (1-5), name, phone (+9665XXXXXXXX), comment, website (honeypot, must be empty) }
     and answers 2xx. Reviews should be published only after moderation.
   - With no endpoint (this static prototype) nothing is sent: the review is kept in this browser only
     (localStorage "mt_reviews_pending") and the page says so plainly. */
(function () {
  var form = document.querySelector('form.rf');
  if (!form) return;
  var openBtn = document.querySelector('.rf-open');
  var status = form.querySelector('.rf-status');
  var comment = form.querySelector('#rf-comment');
  var counter = form.querySelector('#rf-c-count');
  var submit = form.querySelector('[type=submit]');

  // Honeypot against bots (hidden from people and screen readers)
  var hp = document.createElement('input');
  hp.type = 'text'; hp.name = 'website'; hp.tabIndex = -1; hp.autocomplete = 'off';
  hp.setAttribute('aria-hidden', 'true'); hp.className = 'rf-hp';
  form.appendChild(hp);

  function setOpen(open) {
    form.hidden = !open;
    openBtn.setAttribute('aria-expanded', String(open));
    openBtn.hidden = open;
    if (open) { var first = form.querySelector('.rf-stars input'); if (first) first.focus(); }
    else if (!openBtn.hidden) openBtn.focus();
  }
  openBtn.addEventListener('click', function () { setOpen(true); });
  form.querySelector('.rf-cancel').addEventListener('click', function () { setOpen(false); });

  comment.addEventListener('input', function () { counter.textContent = comment.value.length + ' / 1000'; });

  // Arabic-Indic digits → Latin, then normalise any Saudi mobile form to +9665XXXXXXXX
  function phoneOf(v) {
    v = (v || '').replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); })
                 .replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); })
                 .replace(/[\s\-().]/g, '');
    var m = v.match(/^(?:\+?966|00966|0)?(5\d{8})$/);
    return m ? '+966' + m[1] : '';
  }

  function err(id, show) {
    var p = form.querySelector('#rf-e-' + id);
    var field = id === 'rating' ? null : form.querySelector('#rf-' + id);
    p.hidden = !show;
    if (field) { if (show) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid'); }
    return show;
  }

  function validate() {
    var bad = [];
    var rating = form.querySelector('.rf-stars input:checked');
    if (err('rating', !rating)) bad.push(form.querySelector('.rf-stars input'));
    var name = form.querySelector('#rf-name');
    if (err('name', name.value.trim().length < 2)) bad.push(name);
    var phone = form.querySelector('#rf-phone');
    if (err('phone', !phoneOf(phone.value))) bad.push(phone);
    if (err('comment', comment.value.trim().length < 10)) bad.push(comment);
    return bad;
  }
  ['#rf-name', '#rf-phone', '#rf-comment'].forEach(function (s) {
    form.querySelector(s).addEventListener('blur', function () { if (this.getAttribute('aria-invalid')) validate(); });
  });
  form.querySelectorAll('.rf-stars input').forEach(function (r) { r.addEventListener('change', function () { err('rating', false); }); });

  function stars(n) { var s = ''; for (var i = 0; i < 5; i++) s += i < n ? '★' : '☆'; return s; }
  function showPending(r, demo) {
    var box = document.createElement('div');
    box.className = 'rf-pending';
    var t = document.createElement('p'); t.className = 'rf-pending-tag';
    t.textContent = demo ? 'تقييمك محفوظ على جهازك فقط (نسخة تجريبية)' : 'تقييمك بانتظار المراجعة';
    var q = document.createElement('blockquote'); q.textContent = r.comment;
    var by = document.createElement('p'); by.className = 'rf-pending-by';
    var st = document.createElement('span'); st.className = 'rf-pending-stars'; st.setAttribute('aria-label', r.rating + ' من 5'); st.textContent = stars(r.rating);
    var nm = document.createElement('b'); nm.textContent = r.name;
    by.appendChild(nm); by.appendChild(st);
    box.appendChild(t); box.appendChild(q); box.appendChild(by);
    box.tabIndex = -1;
    form.parentNode.insertBefore(box, form.nextSibling);
    box.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = ''; status.className = 'rf-status';
    var bad = validate();
    if (bad.length) { bad[0].focus(); return; }
    if (hp.value) return;   // bot
    var data = {
      course: form.dataset.course, courseName: form.dataset.courseName,
      rating: +form.querySelector('.rf-stars input:checked').value,
      name: form.querySelector('#rf-name').value.trim(),
      phone: phoneOf(form.querySelector('#rf-phone').value),
      comment: comment.value.trim(), website: ''
    };
    var endpoint = form.dataset.endpoint;
    submit.disabled = true; submit.textContent = 'جارٍ الإرسال…';

    function done(demo) {
      form.reset(); counter.textContent = '0 / 1000';
      form.hidden = true; openBtn.hidden = true; openBtn.setAttribute('aria-expanded', 'false');
      showPending(data, demo);
    }
    function restore() { submit.disabled = false; submit.textContent = 'إرسال التقييم'; }

    if (!endpoint) {   // prototype: nothing leaves the browser
      try {
        var k = 'mt_reviews_pending', all = JSON.parse(localStorage.getItem(k) || '[]');
        all.push({ course: data.course, rating: data.rating, name: data.name, comment: data.comment, at: new Date().toISOString() });
        localStorage.setItem(k, JSON.stringify(all));
      } catch (x) { /* storage blocked: still show the note */ }
      restore(); done(true);
      return;
    }
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); restore(); done(false); })
      .catch(function () {
        restore();
        status.className = 'rf-status is-error';
        status.textContent = 'تعذّر إرسال التقييم الآن. تحقق من اتصالك وحاول مرة أخرى؛ بياناتك ما زالت في النموذج.';
      });
  });
})();

/* Waitlist — any element with [data-waitlist="Course name"] (optional data-waitlist-mode="onsite|online")
   opens one shared native <dialog>. DEMO ONLY: nothing is sent.
   Developer: POST the form (course, name, phone, email, mode, timing, consent) to the backend,
   store it per course, notify the trainee when a new batch opens, and show an error state on failure. */
(function () {
  const triggers = document.querySelectorAll('[data-waitlist]');
  if (!triggers.length || typeof HTMLDialogElement === 'undefined') return;

  const d = document.createElement('dialog');
  d.className = 'wl-dialog';
  d.setAttribute('aria-labelledby', 'wl-title');
  d.innerHTML =
    '<div class="wl-form-view">' +
      '<div class="wl-head"><div>' +
        '<h2 id="wl-title">انضم لقائمة الانتظار</h2>' +
        '<p>نبلغك أول ما تُفتح دفعة جديدة، والتسجيل لا يُلزمك بالدفع.</p>' +
        '<span class="badge badge-brand wl-course"></span>' +
      '</div><button type="button" class="icon-btn wl-close" aria-label="إغلاق"><svg class="i" aria-hidden="true"><use href="#i-x"/></svg></button></div>' +
      '<form class="form wl-body" novalidate>' +
        '<input type="hidden" name="course">' +
        '<div class="field"><label for="wl-name">الاسم الكامل <span class="req" aria-hidden="true">*</span></label><input id="wl-name" name="name" autocomplete="name" required></div>' +
        '<div class="field"><label for="wl-phone">رقم الجوال <span class="req" aria-hidden="true">*</span></label><input id="wl-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" required pattern="(\\+?966|0)?5[0-9]{8}" aria-describedby="wl-phone-hint"><span class="hint" id="wl-phone-hint">مثال: 0512345678. نتواصل معك عليه وعلى واتساب.</span></div>' +
        '<div class="field"><label for="wl-email">البريد الإلكتروني <span class="hint">(اختياري)</span></label><input id="wl-email" name="email" type="email" autocomplete="email" dir="ltr"></div>' +
        '<fieldset class="field" style="border:0;padding:0;margin:0"><legend>طريقة الحضور المفضلة</legend><div class="wl-modes">' +
          '<label><input type="radio" name="mode" value="onsite">حضوري بالرياض</label>' +
          '<label><input type="radio" name="mode" value="online">أونلاين مباشر</label>' +
          '<label><input type="radio" name="mode" value="any" checked>أيّهما</label>' +
        '</div></fieldset>' +
        '<div class="field"><label for="wl-time">الوقت المناسب لك <span class="hint">(اختياري)</span></label>' +
          '<select id="wl-time" name="timing"><option value="">بدون تفضيل</option><option>صباحي</option><option>مسائي</option><option>نهاية الأسبوع</option></select></div>' +
        '<label class="check"><input type="checkbox" name="consent" required> أوافق على <a href="privacy.html">سياسة الخصوصية</a> وعلى تواصل مسارتك معي بخصوص الدورة.</label>' +
        '<p class="alert alert-warn wl-error" role="alert" hidden>تأكد من الاسم ورقم الجوال (يبدأ بـ 05) والموافقة على التواصل.</p>' +
        '<div class="wl-actions"><button class="btn btn-primary" type="submit">سجّلني في قائمة الانتظار</button></div>' +
      '</form>' +
    '</div>' +
    '<div class="wl-done" hidden tabindex="-1" role="status">' +
      '<div class="ok"><svg class="i" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></div>' +
      '<h2>تم تسجيلك في قائمة الانتظار</h2>' +
      '<p class="wl-done-course"></p>' +
      '<p>نتواصل معك على جوالك فور فتح دفعة جديدة.</p>' +
      '<p class="form-note">(نموذج تجريبي، لم يُرسل أي شيء)</p>' +
      '<div class="wl-actions" style="margin-top:16px"><button type="button" class="btn btn-primary wl-close-done">تم</button><a class="btn btn-outline" href="courses.html">تصفّح دورات أخرى</a></div>' +
    '</div>';
  document.body.appendChild(d);

  const form = d.querySelector('form');
  const formView = d.querySelector('.wl-form-view');
  const done = d.querySelector('.wl-done');
  const err = d.querySelector('.wl-error');
  let opener = null;

  d.querySelectorAll('.wl-close,.wl-close-done').forEach(function (b) { b.addEventListener('click', function () { d.close(); }); });
  d.addEventListener('click', function (e) { if (e.target === d) d.close(); }); // backdrop click
  d.addEventListener('close', function () { if (opener) opener.focus(); });

  triggers.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      opener = t;
      const course = t.dataset.waitlist;
      form.reset(); err.hidden = true; formView.hidden = false; done.hidden = true;
      form.elements.course.value = course;
      d.querySelector('.wl-course').textContent = course;
      const m = t.dataset.waitlistMode;
      if (m) { const r = form.querySelector('input[name=mode][value="' + m + '"]'); if (r) r.checked = true; }
      d.showModal();
      form.elements.name.focus();
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { err.hidden = false; form.reportValidity(); return; }
    err.hidden = true;
    const btn = form.querySelector('[type=submit]');
    const label = btn.textContent;
    btn.setAttribute('aria-busy', 'true'); btn.disabled = true; btn.textContent = 'جارٍ التسجيل…';
    setTimeout(function () {
      btn.removeAttribute('aria-busy'); btn.disabled = false; btn.textContent = label;
      d.querySelector('.wl-done-course').textContent = form.elements.course.value;
      formView.hidden = true; done.hidden = false; done.focus();
    }, 700);
  });
})();

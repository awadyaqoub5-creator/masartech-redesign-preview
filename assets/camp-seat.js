/* camp-seat.js: «احجز مقعدك» form on the camp pages (camp-*.html).
   On a valid submit it stores one seat reservation in localStorage ("mt_seat", kept apart from the course cart)
   plus the trainee's name, phone and email ("mt_seat_who", used to prefill checkout), then opens checkout.html?seat=1.
   SEAT_FEE is the seat-reservation amount in SAR incl. VAT; null until the client sets it (checkout then shows a placeholder).
   Prototype only: the real site creates the reservation on the server and prices it there. */
(function () {
  var SEAT_FEE = null;
  var form = document.querySelector('form[data-seat]');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var v = function (n) { return (form.elements[n] && form.elements[n].value || '').trim(); };
    var item = {
      id: form.dataset.seat + '|seat',
      name: 'حجز مقعد: ' + form.dataset.name,
      mode: v('mode'),
      session: '12 أسبوعًا أو أكثر · الموعد يُعلن قريبًا',
      price: SEAT_FEE,
      img: form.dataset.img,
      href: form.dataset.seat + '.html',
    };
    try {
      localStorage.setItem('mt_seat', JSON.stringify([item]));
      localStorage.setItem('mt_seat_who', JSON.stringify({ name: v('name'), phone: v('phone'), email: v('email') }));
    } catch (err) { /* private mode: checkout shows its empty state */ }
    location.href = 'checkout.html?seat=1';
  });
})();

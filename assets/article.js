/* article.js: article pages v2 (tools/article_v2.py). On phones and tablets the «فهرس المحتويات» list folds behind
   its title button (closed on load; picking an entry closes it again). On wide screens it stays open and sticky. */
(function () {
  var btn = document.getElementById('toc-title'), list = document.getElementById('toc-list');
  if (!btn || !list || btn.tagName !== 'BUTTON') return;
  var mq = window.matchMedia('(max-width: 900px)');
  function set(open) { btn.setAttribute('aria-expanded', String(open)); list.hidden = !open; }
  function sync() { set(!mq.matches); btn.disabled = false; btn.tabIndex = mq.matches ? 0 : -1; }
  btn.addEventListener('click', function () { if (mq.matches) set(list.hidden); });
  list.addEventListener('click', function (e) { if (mq.matches && e.target.closest('a')) set(false); });
  if (mq.addEventListener) mq.addEventListener('change', sync); else mq.addListener(sync);
  sync();
})();

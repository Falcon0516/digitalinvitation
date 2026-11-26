/* js/story.js — Agent B "Story" (#blessings #couple #family #footer).
   Registers as INV.register('story'). Only touches s-* classes and [data-s-*] hooks. */
(function () {
  'use strict';
  var INV = window.INV;
  if (!INV) return;
  var D = document;
  var bound = [];                         // [el, key] pairs filled from INV.data / INV.fmt

  function $all(sel, root) { return Array.prototype.slice.call((root || D).querySelectorAll(sel)); }
  function t(key) { return INV.i18n.t('story.' + key); }
  function fill(tpl, map) { return tpl.replace(/\{(\w)\}/g, function (m, k) { return map[k] != null ? map[k] : m; }); }
  function bare(timeStr) { return timeStr.replace(/^\D+/, ''); }       // "ಬೆಳಿಗ್ಗೆ 10:14" -> "10:14"
  function ev(id) { var a = INV.data.events || []; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }

  /* ---------- dynamic text (re-run on inv:lang) ---------- */
  function value(key) {
    var d = INV.data, l = INV.lang, f = INV.fmt, rec = ev('reception');
    switch (key) {
      case 'hosts':       return d.hostsLine[l];
      case 'bride-name':  return d.couple.bride[l];
      case 'groom-name':  return d.couple.groom[l];
      case 'bride-title': return d.couple.bride.title[l];
      case 'groom-title': return d.couple.groom.title[l];
      case 'wedding-date':return f.date(d.weddingDay);
      case 'rec-date':    return rec ? f.date(rec.start) : '';
      // Reception time comes from the schedule data on purpose (card says 8:00 PM, data says 7:00 PM: see NOTES).
      case 'rec-time':    return rec ? fill(t('fmt.rec'), { a: f.time(rec.start) }) : '';
      case 'muh-date':    return f.date(d.muhurtha.start);
      case 'muh-time':    return fill(t('fmt.muh'), { a: f.time(d.muhurtha.start), b: bare(f.time(d.muhurtha.end)) });
      case 'inv-line':    return fill(t('fmt.inv'), { d: f.date(d.muhurtha.start),
                            t: fill(t('fmt.muh'), { a: f.time(d.muhurtha.start), b: bare(f.time(d.muhurtha.end)) }) });
    }
    return '';
  }
  function render() {
    bound.forEach(function (p) { p[0].textContent = value(p[1]); });
    $all('.s-top').forEach(function (b) { b.setAttribute('aria-label', t('foot.top')); });
  }

  /* ---------- entrance sequences + off-screen pausing ---------- */
  function sequences() {
    var seqs = $all('[data-s-seq]');
    if (INV.reduced || !('IntersectionObserver' in window)) { seqs.forEach(function (e) { e.classList.add('s-go'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('s-go'); io.unobserve(x.target); } });
    }, { threshold: 0.25 });
    seqs.forEach(function (e) { io.observe(e); });
  }

  // Continuous CSS animations (rangoli spin, sway, petals, bells) run only while their section is on screen.
  function liveToggle() {
    var secs = $all('#couple, #footer'), vis = {};
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { vis[x.target.id] = x.isIntersecting; apply(x.target); });
    }, { threshold: 0 });
    function apply(el) { el.classList.toggle('s-live', !!vis[el.id] && !D.hidden); }
    secs.forEach(function (s) { io.observe(s); });
    D.addEventListener('visibilitychange', function () { secs.forEach(apply); });
  }

  /* ---------- footer: scroll-linked drift of the procession ---------- */
  function frieze() {
    var wrap = D.querySelector('[data-s-frieze]');
    if (!wrap || INV.reduced) return;
    var eleph = wrap.querySelector('.s-eleph'), sky = wrap.querySelector('.s-sky');
    var top = 0, h = 0, vh = window.innerHeight, inView = false, ticking = false;

    function measure() {                        // cached; no per-frame layout reads
      var r = wrap.getBoundingClientRect();
      top = r.top + window.pageYOffset; h = r.height; vh = window.innerHeight;
    }
    function paint() {
      ticking = false;
      if (!inView) return;
      var p = (window.pageYOffset + vh - top) / (vh + h);     // 0 when entering, 1 when leaving
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      eleph.style.transform = 'translate3d(' + (12 - 24 * p).toFixed(2) + '%,0,0)';   // +12% -> -12%
      sky.style.transform   = 'translate3d(' + (6 - 12 * p).toFixed(2) + '%,0,0)';    // half speed
    }
    function onScroll() { if (!inView || ticking) return; ticking = true; requestAnimationFrame(paint); }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        inView = en[0].isIntersecting;
        if (inView) { measure(); paint(); }
      }, { rootMargin: '10% 0px' }).observe(wrap);
    } else { inView = true; }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { measure(); onScroll(); }, { passive: true });
    window.addEventListener('load', function () { measure(); paint(); });
    measure(); paint();
  }

  function init() {
    D.documentElement.classList.add('s-js');
    $all('[data-s-bind]').forEach(function (el) { bound.push([el, el.getAttribute('data-s-bind')]); });
    render();
    D.addEventListener('inv:lang', render);
    $all('[data-s-top]').forEach(function (b) { b.addEventListener('click', function () { INV.scrollTo('hero'); }); });
    sequences(); liveToggle(); frieze();
    if (INV.reveal && INV.reveal.observe) INV.reveal.observe(D);
  }

  INV.register('story', { init: init });
})();

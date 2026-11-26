/* js/inv-core.js — REAL core runtime (Agent A). Superset of the stub API.
   Owns: language, boot, section tracking, audio engine, navigation behaviour, scroll helpers.
   Visual effects (doors sequence, petals, hero, countdown) live in js/core-fx.js. */
(function (w) {
  'use strict';
  var INV = (w.INV = w.INV || {}), D = document, root = D.documentElement;
  INV.modules = INV.modules || {};
  INV.reduced = !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  INV.opened = false;

  /* ---- tiny helpers ---------------------------------------------------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  INV.emit = function (type, detail) { D.dispatchEvent(new CustomEvent('inv:' + type, { detail: detail || {} })); };
  INV.on = function (type, fn) { D.addEventListener('inv:' + type, fn); };
  INV.$ = $; INV.$$ = $$; INV.store = store;

  /* ---- language -------------------------------------------------------- */
  var dict = { en: {}, kn: {} };
  var qLang = (/[?&]lang=(en|kn)/.exec(location.search) || [])[1];
  INV.lang = qLang || (store('inv-lang') === 'en' ? 'en' : 'kn');

  INV.i18n = {
    register: function (ns, d) {
      ['en', 'kn'].forEach(function (l) { var s = (d && d[l]) || {}; for (var k in s) dict[l][ns + '.' + k] = s[k]; });
    },
    t: function (key) {
      var v = dict[INV.lang][key]; if (v != null) return v;
      v = dict.en[key]; return v != null ? v : key;
    },
    apply: function (r) {
      r = r || D;
      $$('[data-i18n]', r).forEach(function (el) { el.textContent = INV.i18n.t(el.getAttribute('data-i18n')); });
      $$('[data-i18n-html]', r).forEach(function (el) { el.innerHTML = INV.i18n.t(el.getAttribute('data-i18n-html')); });
      $$('[data-i18n-attr]', r).forEach(function (el) {
        el.getAttribute('data-i18n-attr').split(';').forEach(function (p) {
          var a = p.split(':'); if (a.length > 1) el.setAttribute(a[0].trim(), INV.i18n.t(a[1].trim()));
        });
      });
    },
    setLang: function (l) {
      INV.lang = l === 'en' ? 'en' : 'kn';
      store('inv-lang', INV.lang);
      root.lang = INV.lang;
      D.body.setAttribute('data-lang', INV.lang);
      INV.i18n.apply(D);
      if (INV.data && INV.data.siteTitle) D.title = INV.data.siteTitle[INV.lang];
      syncLangUI();
      INV.emit('lang', { lang: INV.lang });
    }
  };

  /* ---- formatting (IST, read from ISO strings) ------------------------- */
  function loc() { return INV.lang === 'kn' ? 'kn-IN' : 'en-IN'; }
  INV.fmt = {
    date: function (iso) { // always "Weekday, 10 Month 2026" (ICU's kn-IN pattern puts the month first, so compose from parts)
      var o = {}; new Intl.DateTimeFormat(loc(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })
        .formatToParts(new Date(iso)).forEach(function (p) { o[p.type] = p.value; });
      return o.weekday + ', ' + o.day + ' ' + o.month + ' ' + o.year;
    },
    dayShort: function (iso) { return new Intl.DateTimeFormat(loc(), { weekday: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(iso)); },
    dayNum: function (iso) { return String(parseInt(iso.slice(8, 10), 10)); },
    month: function (iso) { return new Intl.DateTimeFormat(loc(), { month: 'long', timeZone: 'Asia/Kolkata' }).format(new Date(iso)); },
    time: function (iso) {
      var h = parseInt(iso.slice(11, 13), 10), m = iso.slice(14, 16), h12 = h % 12 === 0 ? 12 : h % 12;
      if (INV.lang === 'kn') return (h < 12 ? 'ಬೆಳಿಗ್ಗೆ' : h < 16 ? 'ಮಧ್ಯಾಹ್ನ' : h < 19 ? 'ಸಂಜೆ' : 'ರಾತ್ರಿ') + ' ' + h12 + ':' + m;
      return h12 + ':' + m + ' ' + (h < 12 ? 'AM' : 'PM');
    }
  };

  /* ---- scroll reveal (hero is held until the doors open) --------------- */
  INV.reveal = {
    observe: function (r) {
      var els = $$('[data-reveal]:not(.is-in)', r || D).filter(function (e) {
        return !e._invRv && (INV.opened || !e.closest('#hero'));
      });
      els.forEach(function (e) { e._invRv = 1; });
      if (!('IntersectionObserver' in w) || INV.reduced) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      els.forEach(function (e) { io.observe(e); });
    }
  };

  function barH() { return w.innerWidth >= 768 ? 56 : 0; }
  INV.scrollTo = function (id) {
    var el = D.getElementById(String(id).replace('#', '')); if (!el) return;
    var top = el.getBoundingClientRect().top + (w.pageYOffset || root.scrollTop) - barH();
    w.scrollTo({ top: Math.max(0, top), behavior: INV.reduced ? 'auto' : 'smooth' });
  };

  /* ---- modules --------------------------------------------------------- */
  INV.register = function (name, mod) { INV.modules[name] = mod; };

  /* Called by the doors sequence (or immediately when doors are skipped). */
  INV.setOpened = function () {
    if (INV.opened) return;
    INV.opened = true;
    INV.reveal.observe(D);
    INV.emit('opened');
  };

  /* ---- audio engine: plain <audio>, starts only on a user tap ---------- */
  var au = null, wantOn = false, VOL = 0.45, fadeRaf = 0, musicBtn = null;
  function ensureAudio() {
    if (au) return au;
    au = new Audio(); au.loop = true; au.preload = 'auto'; au.src = 'assets/audio/invitation-theme.mp3';
    au.setAttribute('playsinline', ''); au.volume = 0; return au;
  }
  function fadeTo(v, ms, done) {
    cancelAnimationFrame(fadeRaf);
    if (!au) return;
    var from = au.volume, t0 = performance.now();
    (function step(t) {
      var k = Math.min(1, (t - t0) / ms);
      try { au.volume = from + (v - from) * k; } catch (e) {}
      if (k < 1) fadeRaf = requestAnimationFrame(step); else if (done) done();
    })(t0);
  }
  function syncMusic() {
    if (!musicBtn) return;
    musicBtn.setAttribute('data-state', wantOn ? 'on' : 'off');
    musicBtn.setAttribute('aria-pressed', wantOn ? 'true' : 'false');
    musicBtn.setAttribute('aria-label', INV.i18n.t(wantOn ? 'core.music.on' : 'core.music.off'));
  }
  INV.audio = {
    play: function () {
      var a = ensureAudio(); wantOn = true; store('inv-muted', '0');
      var p; try { p = a.play(); } catch (e) {}
      if (p && p.catch) p.catch(function () { wantOn = false; syncMusic(); }); // autoplay refused: stay "off", never throw
      fadeTo(VOL, 2500); syncMusic();
    },
    pause: function () {
      wantOn = false; store('inv-muted', '1'); syncMusic();
      fadeTo(0, 400, function () { if (!wantOn && au) au.pause(); });
    },
    toggle: function () { wantOn ? INV.audio.pause() : INV.audio.play(); },
    isPlaying: function () { return wantOn; },
    setVolume: function (v) { VOL = Math.max(0, Math.min(1, v)); if (au && wantOn) au.volume = VOL; }
  };
  INV.audio.startFromDoors = function () { if (store('inv-muted') !== '1') INV.audio.play(); }; // respects remembered mute
  function onVis() {
    if (!au) return;
    if (D.hidden) { cancelAnimationFrame(fadeRaf); au.pause(); }
    else if (wantOn) { var p = au.play(); if (p && p.catch) p.catch(function () { wantOn = false; syncMusic(); }); fadeTo(VOL, 600); }
  }
  D.addEventListener('visibilitychange', onVis);
  w.addEventListener('pagehide', function () { if (au) au.pause(); });

  /* ---- language / music / nav UI --------------------------------------- */
  function syncLangUI() {
    $$('[data-c-lang]').forEach(function (b) {
      var v = b.getAttribute('data-c-lang');
      if (v !== 'toggle') b.setAttribute('aria-pressed', v === INV.lang ? 'true' : 'false');
    });
    syncMusic();
  }

  var ORDER = ['hero', 'blessings', 'couple', 'countdown', 'schedule', 'venue', 'contact', 'family', 'footer'];
  var DOCK = { hero: 0, blessings: 1, couple: 2, countdown: 3, schedule: 3, venue: 4, contact: 5, family: 5, footer: 5 };
  var activeId = '';
  function setActive(id) {
    if (id === activeId) return; activeId = id;
    var i = DOCK[id]; if (i == null) i = 0;
    var dock = $('.c-dock'); if (dock) dock.style.setProperty('--c-i', i);
    $$('[data-c-go]').forEach(function (a) {
      var on = DOCK[a.getAttribute('data-c-go')] === i && a.getAttribute('data-c-go') !== 'countdown';
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    INV.emit('section', { id: id });
  }
  function trackSections() {
    var secs = ORDER.map(function (id) { return D.getElementById(id); }).filter(Boolean);
    if (!secs.length || !('IntersectionObserver' in w)) return;
    var live = {};
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) live[e.target.id] = 1; else delete live[e.target.id]; });
      var best = ''; ORDER.forEach(function (id) { if (live[id]) best = id; });
      if (best) setActive(best);
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    secs.forEach(function (s) { io.observe(s); });
  }

  /* --dock-h = real dock height + its bottom offset (incl. safe area); 0 when the dock is hidden (desktop) */
  function measureDock() {
    var dock = $('.c-dock'), h = 0;
    if (dock && dock.getClientRects().length) h = Math.round(w.innerHeight - dock.getBoundingClientRect().top) + 8;
    root.style.setProperty('--dock-h', h + 'px');
  }

  /* scroll: progress thread, solid desktop bar, auto-hiding mobile controls (one rAF per frame, no layout reads except scrollY) */
  function scrollUI() {
    var prog = $('.c-prog'), bar = $('.c-bar'), ctrls = $('.c-ctrls');
    var max = 1, lastMeasure = 0, lastY = 0, ticking = false, idle = 0, solid = false;
    function frame() {
      ticking = false;
      var y = w.pageYOffset || root.scrollTop, now = performance.now();
      if (now - lastMeasure > 800) { max = Math.max(1, root.scrollHeight - w.innerHeight); lastMeasure = now; }
      if (prog) prog.style.transform = 'scaleX(' + Math.min(1, y / max).toFixed(4) + ')';
      var s = y > 40; if (bar && s !== solid) { solid = s; bar.classList.toggle('is-solid', s); }
      if (ctrls) {
        var dy = y - lastY;
        if (dy > 10 && y > 120) ctrls.classList.add('c-hide');
        else if (dy < -4 || y <= 120) ctrls.classList.remove('c-hide');
        clearTimeout(idle); idle = setTimeout(function () { ctrls.classList.remove('c-hide'); }, 1200);
      }
      lastY = y;
    }
    w.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    if (ctrls) { // never hide while hovered / focused
      ctrls.addEventListener('focusin', function () { ctrls.classList.remove('c-hide'); });
      ctrls.addEventListener('pointerenter', function () { ctrls.classList.remove('c-hide'); });
    }
    frame();
  }

  function bindUI() {
    D.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-c-lang],[data-c-go],[data-c-music]'); if (!t) return;
      if (t.hasAttribute('data-c-lang')) { var v = t.getAttribute('data-c-lang'); INV.i18n.setLang(v === 'toggle' ? (INV.lang === 'kn' ? 'en' : 'kn') : v); }
      else if (t.hasAttribute('data-c-go')) { e.preventDefault(); INV.scrollTo(t.getAttribute('data-c-go')); }
      else INV.audio.toggle();
    });
    musicBtn = $('[data-c-music]');
    w.addEventListener('resize', measureDock);
    w.addEventListener('load', measureDock);
    trackSections(); scrollUI(); measureDock(); syncLangUI();
  }

  /* ---- boot ------------------------------------------------------------ */
  INV.start = function () {
    root.classList.add('c-js');
    var doors = D.getElementById('doors');
    var skip = !doors || /[?&]skip=1/.test(location.search) || location.hash.length > 1;
    if (!skip) root.classList.add('c-locked'); else root.classList.add('c-skip');
    INV.i18n.setLang(INV.lang);                       // 1. first i18n pass
    INV.reveal.observe(D);                            // 2. reveals (hero held)
    bindUI();
    Object.keys(INV.modules).forEach(function (k) {   // 3. modules
      try { INV.modules[k].init && INV.modules[k].init(); } catch (e) { console.error('[INV] module ' + k, e); }
    });
    if (skip) setTimeout(INV.setOpened, 60);          // 4. deep link: straight in
  };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', function () { setTimeout(INV.start, 0); });
  else setTimeout(INV.start, 0);
})(window);

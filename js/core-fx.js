/* js/core-fx.js — Agent A effects: doors sequence, hero lifecycle, countdown, petals.
   Everything registers as INV modules and is initialised by inv-core.js. */
(function (w) {
  'use strict';
  var INV = w.INV, D = document, root = D.documentElement;
  var $ = function (s, r) { return (r || D).querySelector(s); };

  /* ======================= DOORS ======================= */
  INV.register('c-doors', {
    init: function () {
      var doors = $('#doors'), btn = $('.c-open', doors), busy = false;
      if (!doors || !btn) return;
      function finish() { doors.style.display = 'none'; root.classList.remove('c-locked'); var h = $('#hero h1'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
      function open() {
        if (busy) return; busy = true;
        var cl = doors.classList;
        INV.audio.startFromDoors();                       // inside the tap = allowed by autoplay policy
        if (INV.reduced) {                                // simple 400ms cross-fade
          cl.add('c-xfade'); setTimeout(function () { INV.setOpened(); finish(); }, 400); return;
        }
        cl.add('is-opening');                             //   0ms: button recedes, glow grows, ring spins faster
        setTimeout(function () { cl.add('is-swing'); }, 150);   // doors swing
        setTimeout(function () { cl.add('is-flood'); }, 900);   // warm light floods
        setTimeout(function () { cl.add('is-gone'); INV.setOpened(); }, 1500); // overlay fades; hero intro starts underneath
        setTimeout(finish, 2250);                         // overlay removed, scroll unlocked
      }
      btn.addEventListener('click', open);
    }
  });

  /* ======================= HERO ======================= */
  INV.register('c-hero', {
    init: function () {
      var hero = $('#hero'); if (!hero) return;
      function dates() { var el = $('[data-c-date]', hero); if (el) el.textContent = INV.fmt.date(INV.data.weddingDay); }
      dates(); INV.on('lang', dates);
      INV.on('opened', function () { hero.classList.add('c-live'); });
      if (INV.opened) hero.classList.add('c-live');
      // pause continuous animations off-screen / when tab hidden
      var vis = true;
      function sync() { hero.classList.toggle('c-paused', !vis || D.hidden); }
      if ('IntersectionObserver' in w) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; sync(); }).observe(hero);
      D.addEventListener('visibilitychange', sync);
      var cue = $('.c-cue', hero);
      if (cue) cue.addEventListener('click', function () { INV.scrollTo(D.getElementById('blessings') ? 'blessings' : 'countdown'); });
    }
  });

  /* ======================= COUNTDOWN ======================= */
  INV.register('c-countdown', {
    init: function () {
      var sec = $('#countdown'); if (!sec) return;
      var T = Date.parse(INV.data.countdownTarget), MS = Date.parse(INV.data.muhurtha.start), ME = Date.parse(INV.data.muhurtha.end);
      var DAY0 = Date.parse(INV.data.weddingDay + 'T00:00:00+05:30');
      var fake = /[?&]now=([^&]+)/.exec(location.search);       // testing aid: ?now=2026-12-10T09:00:00+05:30
      var offset = fake ? Date.parse(decodeURIComponent(fake[1])) - Date.now() : 0;
      var units = ['d', 'h', 'm', 's'], cells = {}, state = '', lastMin = -1, timer = 0, visible = true;
      units.forEach(function (u) { cells[u] = { box: $('[data-u="' + u + '"] .c-numwrap', sec), val: '' }; });
      var msg = $('.c-cd-msg', sec), grid = $('.c-cells', sec), muh = $('.c-muh', sec);

      function pad(n) { return n < 10 ? '0' + n : String(n); }
      function setCell(c, s, animate) {
        if (c.val === s || !c.box) return;
        var old = c.box.firstElementChild, nu = D.createElement('span');
        nu.className = 'c-dg gold-text'; nu.textContent = s; c.box.appendChild(nu); c.val = s;
        if (old && animate && nu.animate && !INV.reduced) {
          var o = old.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-55%)', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.22,.8,.2,1)', fill: 'forwards' });
          nu.animate([{ transform: 'translateY(55%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.22,.8,.2,1)' });
          o.onfinish = function () { old.remove(); };
        } else if (old) old.remove();
      }
      function stripPeriod(a, b) { // "ಬೆಳಿಗ್ಗೆ 10:14" + "ಬೆಳಿಗ್ಗೆ 10:48" -> second without the repeated period word
        var pa = a.split(' '), pb = b.split(' ');
        return (pa.length > 1 && pb.length > 1 && pa[0] === pb[0]) ? pb[1] : b;
      }
      function muhLine() {
        if (!muh) return;
        var s = INV.fmt.time(INV.data.muhurtha.start), e = INV.fmt.time(INV.data.muhurtha.end);
        if (INV.lang === 'kn') e = stripPeriod(s, e);
        else if (s.slice(-2) === e.slice(-2)) s = s.slice(0, -3);   // "10:14 to 10:48 AM"
        muh.textContent = INV.i18n.t('core.cd.muh').replace('{s}', s).replace('{e}', e);
      }
      function setState(st) {
        if (st === state) return; state = st;
        grid.hidden = st === 'after';
        msg.hidden = st === 'before';
        msg.classList.toggle('is-glow', st === 'today' || st === 'now');
        if (st !== 'before') { msg.setAttribute('data-i18n', 'core.cd.' + st); msg.textContent = INV.i18n.t('core.cd.' + st); } // apply(root) skips root itself
        sec.setAttribute('data-state', st);
      }
      function render(animate) {
        var now = Date.now() + offset, diff = T - now;
        setState(now >= ME ? 'after' : now >= T ? 'now' : now >= DAY0 ? 'today' : 'before');
        if (state === 'after') return;
        diff = Math.max(0, diff);
        var d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
        setCell(cells.d, pad(d), animate); setCell(cells.h, pad(h), animate); setCell(cells.m, pad(m), animate); setCell(cells.s, pad(s), animate);
        if (m !== lastMin) { lastMin = m; var g = $('.c-cd-group', sec); if (g) g.setAttribute('aria-label', INV.i18n.t('core.cd.aria').replace('{d}', d).replace('{h}', h).replace('{m}', m)); }
      }
      function schedule() {                                   // next second boundary; render inside rAF
        clearTimeout(timer);
        if (!visible || D.hidden) return;
        timer = setTimeout(function () { requestAnimationFrame(function () { render(true); schedule(); }); }, 1000 - (Date.now() % 1000) + 6);
      }
      render(false); muhLine(); schedule();
      INV.on('lang', function () { muhLine(); lastMin = -1; render(false); });
      D.addEventListener('visibilitychange', function () { if (!D.hidden) { render(false); } schedule(); });
      if ('IntersectionObserver' in w) new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting; sec.classList.toggle('c-paused', !visible);
        if (visible) { render(false); } schedule();
      }, { rootMargin: '80px' }).observe(sec);
    }
  });

  /* ======================= PETALS ======================= */
  INV.register('c-petals', {
    init: function () {
      var cv = $('#c-petals'); if (!cv || INV.reduced) { if (cv) cv.style.display = 'none'; return; }
      var ctx = cv.getContext('2d'), dpr = Math.min(w.devicePixelRatio || 1, 2), W = 0, H = 0;
      var files = [['fx-petal-marigold.webp', 34], ['fx-petal-rose.webp', 46], ['fx-jasmine.webp', 48]], sprites = [], list = [];
      var raf = 0, last = 0, running = false, active = true, target = w.innerWidth < 768 ? 12 : 22, slow = 0, t0 = 0, startedAt = 0;
      function rnd(a, b) { return a + Math.random() * (b - a); }
      function size() { W = w.innerWidth; H = w.innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      function load(done) { // pre-scale each source once to a small offscreen canvas
        var left = files.length;
        files.forEach(function (f, i) {
          var im = new Image(); im.decoding = 'async';
          im.onload = function () {
            var c = D.createElement('canvas'), s = Math.round(f[1] * dpr * 1.6);
            c.width = c.height = s; c.getContext('2d').drawImage(im, 0, 0, s, s); sprites[i] = { c: c, base: f[1] };
            if (--left === 0) done();
          };
          im.onerror = function () { if (--left === 0) done(); };
          im.src = 'assets/images/' + f[0];
        });
      }
      function make(burst, delay) {
        var depth = rnd(0.55, 1), k = (Math.random() * sprites.length) | 0;
        return { x0: rnd(-20, W + 20), y: burst ? rnd(-90, -30) : rnd(-H, 0), vy: burst ? rnd(110, 190) : rnd(40, 90) * depth,
          amp: rnd(14, 38), fr: rnd(0.6, 1.4), ph: rnd(0, 6.28), rot: rnd(0, 6.28), vr: rnd(-1.2, 1.2), flip: rnd(0.8, 1.8),
          sc: depth, al: Math.min(0.85, 0.35 + depth * 0.5), k: k, burst: !!burst, wait: delay || 0, dying: 0 };
      }
      function frame(t) {
        raf = requestAnimationFrame(frame);
        var dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016; last = t;
        if (!t0) t0 = t;
        // adaptive quality: under 40fps for 2s -> halve the count
        if (t - startedAt > 3500) { if (dt > 0.025) slow += dt; else slow = 0; if (slow > 2) { slow = 0; target = Math.max(4, Math.ceil(target / 2)); } }
        var reg = 0, i; for (i = 0; i < list.length; i++) if (!list[i].burst) reg++;
        if (active) while (reg < target) { list.push(make(false)); reg++; }
        else if (!list.length) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); stop(); return; }
        if (reg > target && active) for (i = list.length - 1; i >= 0 && reg > target; i--) if (!list[i].burst) { list.splice(i, 1); reg--; }
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
        for (i = list.length - 1; i >= 0; i--) {
          var p = list[i], s = sprites[p.k]; if (!s) continue;
          if (p.wait > 0) { p.wait -= dt * 1000; continue; }
          p.y += p.vy * dt; p.rot += p.vr * dt;
          if (p.dying) { p.dying -= dt; if (p.dying <= 0) { list.splice(i, 1); continue; } }
          if (p.y > H + 60) { if (p.burst) { list.splice(i, 1); continue; } p.y = -60; p.x0 = rnd(-20, W + 20); }
          var x = p.x0 + Math.sin(t / 1000 * p.fr + p.ph) * p.amp, z = s.base * p.sc * dpr, fl = Math.cos(t / 1000 * p.flip + p.ph) * 0.45 + 0.55;
          var c = Math.cos(p.rot) * dpr, sn = Math.sin(p.rot) * dpr;
          ctx.globalAlpha = p.dying ? p.al * Math.min(1, p.dying / 0.7) : p.al; ctx.setTransform(c, sn, -sn * fl, c * fl, x * dpr, p.y * dpr);
          ctx.drawImage(s.c, -z / 2, -z / 2, z, z);
        }
        ctx.globalAlpha = 1;
      }
      function start() { if (running || !sprites.length) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
      function stop() { running = false; cancelAnimationFrame(raf); }
      function burst() { for (var i = 0; i < 30; i++) list.push(make(true, rnd(0, 1200))); }
      size(); w.addEventListener('resize', size);
      D.addEventListener('visibilitychange', function () { if (D.hidden) stop(); else if (INV.opened) start(); });
      // petals belong to the hero: once it scrolls away they fade out and the loop stops (keeps body text clean, saves battery)
      var heroEl = D.getElementById('hero');
      if (heroEl && 'IntersectionObserver' in w) new IntersectionObserver(function (e) {
        var on = e[0].intersectionRatio > 0.2;
        if (on === active) return; active = on;
        if (!on) list.forEach(function (p) { if (!p.dying) p.dying = 0.7; });
        else if (INV.opened) { list = list.filter(function (p) { return !p.dying; }); start(); }
      }, { threshold: [0, 0.2, 0.5] }).observe(heroEl);
      cv.style.display = 'none';
      load(function () {
        if (INV.opened) go(); else INV.on('opened', go);
        function go() { cv.style.display = ''; startedAt = performance.now(); burst(); start(); }
      });
    }
  });
})(window);

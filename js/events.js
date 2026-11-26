/* js/events.js — Agent C: #schedule, #venue, #contact.
   Everything is rendered from INV.data; strings come from i18n/events.js (namespace "sched").
   Public API used: INV.register, INV.i18n.t, INV.fmt.*, INV.reveal.observe, INV.on, INV.reduced, INV.lang. */
(function () {
  'use strict';
  var INV = window.INV, D = document, W = window;
  var LOC_FOR_ALL = false; // false: only the wedding gets LOCATION/GEO in calendar files (card names no other venue)

  var DATA, secS, secV, secC, tl, spine, fill, bead, pop, popBtn, toastEl, toastT;
  var firstRender = true, tTop = 0, spineTop = 0, spineH = 1, vh = 800, ticking = false;
  var timer = 0, ringTimer = 0, scrolling = false, openY = 0;

  /* ---------- tiny helpers ---------- */
  function t(k) { return INV.i18n.t('sched.' + k); }
  function fill_(s, o) { return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(id) { return D.getElementById(id); }
  function evTitle(ev) { return ev.title[INV.lang]; }
  function byId(id) { for (var i = 0; i < DATA.events.length; i++) if (DATA.events[i].id === id) return DATA.events[i]; }
  function mainEvent() { for (var i = 0; i < DATA.events.length; i++) if (DATA.events[i].main) return DATA.events[i]; return DATA.events[DATA.events.length - 1]; }
  function hm(iso) { var h = parseInt(iso.slice(11, 13), 10); return (h % 12 === 0 ? 12 : h % 12) + ':' + iso.slice(14, 16); }
  function istDay(ms) { return new Date(ms + 19800000).toISOString().slice(0, 10); }
  function pageUrl() { return (DATA && DATA.shareUrl) || W.location.href.split('#')[0].split('?')[0]; } // optional INV.data.shareUrl pins the public link
  function bar() { return parseFloat(getComputedStyle(D.documentElement).getPropertyValue('--dock-h')) || 72; }

  /* ---------- inline SVG icons (stroke = currentColor) ---------- */
  var IC = {
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
    chat: '<path d="M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1H10l-5 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1z"/><path d="M8 10.5h8M8 13.5h5"/>',
    star: '<path fill="currentColor" stroke="none" d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/>'
  };
  function svg(n, cls) { return '<svg class="e-ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + IC[n] + '</svg>'; }

  /* ---------- status (IST based) ---------- */
  function status(ev, now) {
    if (now > Date.parse(ev.end)) return 'done';
    if (now >= Date.parse(ev.start)) return 'live';
    return istDay(now) === ev.start.slice(0, 10) ? 'today' : 'up';
  }
  function refreshStatus() {
    if (!tl) return;
    var now = Date.now(), next = null;
    DATA.events.forEach(function (ev) {
      var st = status(ev, now); if (!next && st !== 'done') next = ev.id;
      var card = tl.querySelector('[data-ev="' + ev.id + '"]'); if (!card) return;
      var chip = card.querySelector('.e-chip');
      chip.setAttribute('data-st', st);
      chip.querySelector('.e-chip-t').textContent = t('st.' + st);
      var dot = chip.querySelector('.e-dot');
      if (ev.id === next && st !== 'done') { if (!dot) chip.insertAdjacentHTML('afterbegin', '<i class="e-dot" aria-hidden="true"></i>'); }
      else if (dot) dot.remove();
    });
  }

  /* ---------- #schedule rendering ---------- */
  function cardHTML(ev, side, now) {
    var main = !!ev.main, st = status(ev, now), id = 'e-t-' + ev.id;
    var muh = '';
    if (main) {
      var m = DATA.muhurtha, b = INV.lang === 'kn' ? hm(m.end) : INV.fmt.time(m.end);
      muh = '<p class="e-muh">' + esc(fill_(t('muh'), { a: INV.fmt.time(m.start), b: b })) + '</p>';
    }
    return '<article class="e-card ' + (main ? 'e-main' : 'e-' + side) + '" data-ev="' + ev.id + '" aria-labelledby="' + id + '" data-reveal="' + (main ? 'zoom' : side === 'l' ? 'left' : 'right') + '">' +
      (main ? '<span class="e-ribbon"><span class="e-ribbon-i">' + svg('star') + '<span>' + esc(t('main')) + '</span></span></span><span class="e-shimmer" aria-hidden="true"></span>' : '') +
      '<i class="e-hook" aria-hidden="true"></i>' +
      '<div class="e-card-in">' +
        '<div class="e-disc"><img class="k-img" src="assets/images/' + ev.icon + '" alt="" aria-hidden="true" width="64" height="64" loading="lazy" decoding="async"></div>' +
        '<div class="e-card-tx"><h3 class="e-ctitle" id="' + id + '">' + esc(evTitle(ev)) + '</h3>' +
        '<p class="e-ctime"><time datetime="' + ev.start + '">' + esc(INV.fmt.time(ev.start)) + '</time></p></div>' +
        muh +
        '<div class="e-card-ft"><span class="e-chip" data-st="' + st + '"><span class="e-chip-t">' + esc(t('st.' + st)) + '</span></span>' +
        '<button type="button" class="e-cal" data-e-act="cal" data-cal="' + ev.id + '" aria-haspopup="true" aria-expanded="false" aria-label="' + esc(t('cal.btn') + ' — ' + evTitle(ev)) + '">' + svg('cal') + '<span>' + esc(t('cal.short')) + '</span></button></div>' +
      '</div></article>';
  }
  function renderSchedule() {
    if (!secS) return;
    var groups = [], html = '', now = Date.now();
    DATA.events.forEach(function (ev) {
      var d = ev.start.slice(0, 10), g = groups[groups.length - 1];
      if (!g || g.d !== d) { g = { d: d, list: [] }; groups.push(g); }
      g.list.push(ev);
    });
    groups.forEach(function (g) {
      var f = g.list[0], mon = INV.fmt.month ? INV.fmt.month(f.start) : '';
      html += '<div class="e-day"><div class="e-dayhead"><div class="e-medalwrap" data-reveal="fade"><div class="e-medal"><span class="e-medal-n gold-text">' + INV.fmt.dayNum(f.start) + '</span></div></div>' +
        '<p class="e-daylabel"><time datetime="' + g.d + '"><span class="e-dl-m">' + esc(mon) + '</span><span class="e-dl-w">' + esc(INV.fmt.dayShort(f.start)) + '</span></time></p></div>' +
        '<div class="e-cards">';
      g.list.forEach(function (ev, i) { html += cardHTML(ev, i % 2 ? 'r' : 'l', now); });
      html += '</div></div>';
    });
    if (!firstRender) tl.classList.add('e-static');
    $('e-days').innerHTML = html;
    if (!firstRender) $('e-days').querySelectorAll('[data-reveal]').forEach(function (e) { e.classList.add('is-in'); });
    else INV.reveal.observe(secS);
    refreshStatus();
    D.querySelectorAll('#e-all-btn').forEach(function (b) { b.setAttribute('aria-label', t('cal.all')); });
    measure();
  }

  /* ---------- spine progress (scroll-linked, rAF-throttled, only while visible) ---------- */
  function measure() {
    if (!tl || !spine) return;
    var r = tl.getBoundingClientRect(), s = spine.getBoundingClientRect();
    var m = tl.querySelector('.e-main'); // the spine ends where the main-ceremony card hangs from it
    if (m) {
      var y = 0, n = m; while (n && n !== tl) { y += n.offsetTop; n = n.offsetParent; }
      var end = y + (W.innerWidth >= 900 ? -26 : 30); // desktop hook hangs above the card, mobile hook is at its side
      spine.style.bottom = Math.max(0, tl.offsetHeight - end) + 'px';
    }
    r = tl.getBoundingClientRect(); s = spine.getBoundingClientRect();
    tTop = r.top + W.pageYOffset; spineTop = s.top + W.pageYOffset; spineH = Math.max(1, s.height); vh = W.innerHeight;
    updateSpine();
  }
  function updateSpine() {
    ticking = false; if (!fill) return;
    var p = INV.reduced ? 1 : Math.min(1, Math.max(0, (W.pageYOffset + vh * 0.62 - spineTop) / spineH));
    fill.style.transform = 'scaleY(' + p + ')';
    bead.style.transform = 'translateY(' + (p * spineH).toFixed(1) + 'px)';
    bead.style.opacity = p > 0.003 && p < 0.998 ? 1 : 0;
  }
  function onScroll() { if (!ticking) { ticking = true; W.requestAnimationFrame(updateSpine); } }

  /* ---------- calendar: .ics + Google link + popover ---------- */
  function stamp(iso) { return iso.slice(0, 4) + iso.slice(5, 7) + iso.slice(8, 10) + 'T' + iso.slice(11, 13) + iso.slice(14, 16) + '00'; }
  function escT(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function fold(line) { // RFC 5545: max 75 octets per line, never split a multi-byte char
    var out = [], cur = '', n = 0, chars = Array.from(line), lim = 75;
    chars.forEach(function (ch) {
      var c = ch.codePointAt(0), b = c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
      if (n + b > lim) { out.push(cur); cur = ' '; n = 1; lim = 75; }
      cur += ch; n += b;
    });
    out.push(cur); return out.join('\r\n');
  }
  function description(ev) {
    return ev.main ? fill_(t('cal.map'), { url: DATA.venue.mapsUrl })
      : fill_(t('cal.noLoc'), { tels: DATA.contacts.map(function (c) { return c.display; }).join(', ') });
  }
  function vevent(ev, L, dtstamp) {
    var title = fill_(t('cal.title'), { e: evTitle(ev) }), v = DATA.venue;
    L.push('BEGIN:VEVENT', 'UID:' + ev.id + '@sunanda-mohitraj-invitation', 'DTSTAMP:' + dtstamp,
      'DTSTART;TZID=Asia/Kolkata:' + stamp(ev.start), 'DTEND;TZID=Asia/Kolkata:' + stamp(ev.end), 'SUMMARY:' + escT(title));
    if (ev.main || LOC_FOR_ALL) L.push('LOCATION:' + escT(v.address[INV.lang]), 'GEO:' + v.lat + ';' + v.lng);
    L.push('DESCRIPTION:' + escT(description(ev)), 'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY',
      'DESCRIPTION:' + escT(fill_(t('cal.alarm'), { e: evTitle(ev) })), 'END:VALARM', 'END:VEVENT');
  }
  function buildICS(list) {
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sunanda Mohitraj Invitation//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE', 'TZID:Asia/Kolkata', 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0530', 'TZOFFSETTO:+0530', 'TZNAME:IST', 'END:STANDARD', 'END:VTIMEZONE'];
    var ds = new Date().toISOString().replace(/[-:]|\.\d{3}/g, '');
    list.forEach(function (ev) { vevent(ev, L, ds); });
    L.push('END:VCALENDAR');
    return L.map(fold).join('\r\n') + '\r\n';
  }
  function download(name, text) {
    var u = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }));
    var a = D.createElement('a'); a.href = u; a.download = name; a.rel = 'noopener'; D.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 5000);
  }
  function googleUrl(ev) {
    var q = 'action=TEMPLATE&text=' + encodeURIComponent(fill_(t('cal.title'), { e: evTitle(ev) })) +
      '&dates=' + stamp(ev.start) + '/' + stamp(ev.end) + '&ctz=' + encodeURIComponent('Asia/Kolkata') +
      '&details=' + encodeURIComponent(description(ev));
    if (ev.main || LOC_FOR_ALL) q += '&location=' + encodeURIComponent(DATA.venue.address[INV.lang]);
    return 'https://calendar.google.com/calendar/render?' + q;
  }
  function buildPop() {
    pop = D.createElement('div'); pop.className = 'e-pop'; pop.hidden = true; pop.setAttribute('role', 'menu');
    pop.innerHTML = '<a class="e-pop-i" role="menuitem" target="_blank" rel="noopener" id="e-pop-g" href="#"></a>' +
      '<button class="e-pop-i" role="menuitem" type="button" id="e-pop-i"></button>';
    D.body.appendChild(pop);
    $('e-pop-i').addEventListener('click', function () {
      var ev = byId(popBtn && popBtn.getAttribute('data-cal'));
      if (ev) download('sunanda-mohitraj-' + ev.id + '.ics', buildICS([ev]));
      closePop(true);
    });
    $('e-pop-g').addEventListener('click', function () { closePop(false); });
    pop.addEventListener('keydown', function (e) {
      var items = [].slice.call(pop.querySelectorAll('.e-pop-i')), i = items.indexOf(D.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); items[(i + items.length - 1) % items.length].focus(); }
      if (e.key === 'Tab') closePop(false);
    });
  }
  function openPop(btn) {
    var ev = byId(btn.getAttribute('data-cal')); if (!ev) return;
    if (popBtn === btn && !pop.hidden) { closePop(true); return; }
    closePop(false);
    popBtn = btn; pop.setAttribute('aria-label', t('cal.menu'));
    $('e-pop-g').href = googleUrl(ev); $('e-pop-g').textContent = t('cal.google'); $('e-pop-i').textContent = t('cal.ics');
    pop.style.visibility = 'hidden'; pop.hidden = false;
    var b = btn.getBoundingClientRect(), p = pop.getBoundingClientRect(), vw = D.documentElement.clientWidth, H = D.documentElement.clientHeight;
    var below = H - bar() - 8 - b.bottom, above = b.top - 8, top;
    top = (below >= p.height + 8 || below >= above) ? b.bottom + 6 : b.top - 6 - p.height;
    top = Math.max(8, Math.min(top, H - bar() - 8 - p.height));
    pop.style.top = top + 'px';
    pop.style.left = Math.max(8, Math.min(b.right - p.width, vw - p.width - 8)) + 'px';
    pop.style.visibility = ''; btn.setAttribute('aria-expanded', 'true'); openY = W.pageYOffset;
    $('e-pop-g').focus();
  }
  function closePop(refocus) {
    if (!pop || pop.hidden) return;
    pop.hidden = true;
    if (popBtn) { popBtn.setAttribute('aria-expanded', 'false'); if (refocus) popBtn.focus(); }
  }

  /* ---------- toast + clipboard + share ---------- */
  function toast(msg) {
    if (!toastEl) { toastEl = D.createElement('div'); toastEl.className = 'e-toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); D.body.appendChild(toastEl); }
    toastEl.textContent = ''; // re-announce even if same text
    W.setTimeout(function () { toastEl.textContent = msg; toastEl.classList.add('e-on'); }, 30);
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('e-on'); }, 2600);
  }
  function copyText(text, okKey) {
    function ok() { toast(t(okKey)); }
    function legacy() {
      var ta = D.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      D.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
      var done = false; try { done = D.execCommand('copy'); } catch (e) {} ta.remove();
      done ? ok() : toast(t('venue.copyFail'));
    }
    if (navigator.clipboard && W.isSecureContext) navigator.clipboard.writeText(text).then(ok, legacy); else legacy();
  }
  function nativeShare(data, fallback) {
    if (navigator.share) { navigator.share(data).catch(function (e) { if (e && e.name !== 'AbortError' && fallback) fallback(); }); }
    else if (fallback) fallback();
  }
  function waShareUrl() { return 'https://wa.me/?text=' + encodeURIComponent(t('contact.shareText') + '\n' + pageUrl()); }

  /* ---------- #venue ---------- */
  function isApple() {
    var ua = navigator.userAgent || '', pf = navigator.platform || '';
    return /iPhone|iPad|iPod/.test(ua) || /Mac/.test(pf) || (/Macintosh/.test(ua));
  }
  function renderVenue() {
    if (!secV) return;
    var v = DATA.venue, m = mainEvent();
    $('e-v-name').textContent = v.name[INV.lang];
    $('e-v-addr').textContent = v.address[INV.lang];
    $('e-v-line').textContent = fill_(t('venue.line'), { date: INV.fmt.date(m.start), time: INV.fmt.time(m.start) });
    $('e-v-coords').textContent = v.lat.toFixed(6) + ', ' + v.lng.toFixed(6);
    $('e-v-gmaps').href = v.mapsUrl; $('e-v-dir').href = v.directionsUrl; $('e-v-apple').href = v.appleUrl;
    $('e-v-apple').hidden = !isApple();
    $('e-v-share').hidden = !navigator.share;
    var f = secV.querySelector('.e-mapbox iframe'); if (f) f.title = t('venue.mapTitle');
  }
  function loadMap() {
    var box = secV.querySelector('.e-mapbox'); if (box.querySelector('iframe')) return;
    var f = D.createElement('iframe');
    f.src = DATA.venue.embedUrl; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade'; f.title = t('venue.mapTitle'); f.setAttribute('allowfullscreen', '');
    box.appendChild(f); box.classList.add('e-loaded');
    secV.querySelector('.e-facade').hidden = true;
  }

  /* ---------- #contact ---------- */
  function renderContact() {
    if (!secC) return;
    var msg = encodeURIComponent(t('contact.waMsg'));
    $('e-hosts').textContent = DATA.hostsLine[INV.lang];
    $('e-plates').innerHTML = DATA.contacts.map(function (c, i) {
      return '<div class="e-plate" data-reveal="up" style="--d:' + (i * 140) + 'ms"><div class="e-plate-in">' +
        '<p class="e-plate-l">' + esc(t('contact.c' + (i + 1))) + '</p>' +
        '<a class="e-num" href="tel:' + c.tel + '">' + esc(c.display) + '</a>' +
        '<div class="e-btnrow">' +
        '<a class="e-btn e-btn-maroon" href="tel:' + c.tel + '" aria-label="' + esc(fill_(t('contact.callAria'), { n: c.display })) + '">' + svg('phone', 'e-phone') + '<span>' + esc(t('contact.call')) + '</span></a>' +
        '<a class="e-btn e-btn-green" href="https://wa.me/' + c.wa + '?text=' + msg + '" target="_blank" rel="noopener" aria-label="' + esc(fill_(t('contact.waAria'), { n: c.display })) + '">' + svg('chat') + '<span>' + esc(t('contact.wa')) + '</span></a>' +
        '</div></div></div>';
    }).join('');
    $('e-wa-share').href = waShareUrl();
    if (firstRender) INV.reveal.observe(secC);
    else $('e-plates').querySelectorAll('[data-reveal]').forEach(function (e) { e.classList.add('is-in'); });
  }
  function ring() {
    secC.querySelectorAll('.e-phone').forEach(function (p) { p.classList.add('e-ring'); setTimeout(function () { p.classList.remove('e-ring'); }, 700); });
  }

  /* ---------- global click delegation ---------- */
  function onClick(e) {
    var el = e.target.closest && e.target.closest('[data-e-act]');
    if (pop && !pop.hidden && !(e.target.closest && e.target.closest('.e-pop')) && !(el && el.getAttribute('data-e-act') === 'cal')) closePop(false);
    if (!el) return;
    var a = el.getAttribute('data-e-act'), v = DATA.venue;
    if (a === 'cal') openPop(el);
    else if (a === 'cal-all') download('sunanda-mohitraj-all-events.ics', buildICS(DATA.events));
    else if (a === 'map') loadMap();
    else if (a === 'copy-loc') copyText(v.name[INV.lang] + '\n' + v.address[INV.lang] + '\n' + v.mapsUrl, 'venue.copied');
    else if (a === 'share-loc') nativeShare({ title: v.name[INV.lang], text: v.address[INV.lang], url: v.mapsUrl });
    else if (a === 'share-inv') nativeShare({ title: DATA.siteTitle[INV.lang], text: t('contact.shareText'), url: pageUrl() },
      function () { W.open(waShareUrl(), '_blank', 'noopener'); });
    else if (a === 'copy-link') copyText(pageUrl(), 'contact.linkCopied');
  }

  /* ---------- visibility handling (timers, scroll listener, animations) ---------- */
  function onVis(sec, on) {
    sec.classList.toggle('e-vis', on);
    if (sec === secS) {
      if (on) {
        measure(); refreshStatus();
        if (!scrolling) { W.addEventListener('scroll', onScroll, { passive: true }); scrolling = true; }
        clearInterval(timer); timer = setInterval(refreshStatus, 60000);
      } else { W.removeEventListener('scroll', onScroll); scrolling = false; clearInterval(timer); }
    }
    if (sec === secC) {
      clearInterval(ringTimer);
      if (on && !INV.reduced) ringTimer = setInterval(function () { if (!D.hidden) ring(); }, 6000);
    }
  }

  function init() {
    DATA = INV.data; secS = $('schedule'); secV = $('venue'); secC = $('contact');
    if (!DATA || (!secS && !secV && !secC)) return;
    tl = secS && secS.querySelector('.e-timeline'); spine = tl && tl.querySelector('.e-spine');
    fill = spine && spine.querySelector('.e-spine-fill'); bead = spine && spine.querySelector('.e-bead');
    if (INV.reduced && secS) secS.classList.add('e-reduced');
    buildPop();
    renderSchedule(); renderVenue(); renderContact(); firstRender = false;
    D.addEventListener('click', onClick);
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePop(true); });
    W.addEventListener('resize', function () { closePop(false); clearTimeout(init.rt); init.rt = setTimeout(measure, 150); }, { passive: true });
    W.addEventListener('load', measure);
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(measure);
    D.addEventListener('visibilitychange', function () { if (!D.hidden && secS && secS.classList.contains('e-vis')) refreshStatus(); });
    INV.on('lang', function () { closePop(false); renderSchedule(); renderVenue(); renderContact(); });
    var secs = [secS, secV, secC].filter(Boolean);
    if ('IntersectionObserver' in W) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { onVis(e.target, e.isIntersecting); }); }, { rootMargin: '80px 0px' });
      secs.forEach(function (s) { io.observe(s); });
    } else secs.forEach(function (s) { onVis(s, true); });
    D.addEventListener('scroll', function () { if (pop && !pop.hidden && Math.abs(W.pageYOffset - openY) > 24) closePop(false); }, { passive: true }); // popover is fixed, so close once the page really moves
  }

  INV.register('events', { init: init });
})();

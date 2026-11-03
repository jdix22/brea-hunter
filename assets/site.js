/* Brea Hunter site script.
 *
 * Settings for the owner:
 *   CONTACT_EMAIL  : where enquiries go. Empty = enquiries open an Instagram DM instead.
 *   FORM_ENDPOINT  : optional form service URL (Formspree etc). When set, the form posts there.
 *   BEHOLD_FEED_ID : optional Behold.so feed ID. When set, the Instagram section shows her
 *                    latest photo posts automatically. Reels are skipped (their covers carry
 *                    caption text), and anything listed in IG_HIDE is never shown.
 */
(function () {
  'use strict';
  var CONTACT_EMAIL = '';
  var FORM_ENDPOINT = '';
  var BEHOLD_FEED_ID = '';
  var IG_HIDE = [];
  var IG_HANDLE = 'brea_hunter';

  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Toast */
  var toastEl = document.querySelector('.toast'), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  /* Header + menu */
  var hdr = document.querySelector('.hdr');
  function onScroll() { hdr.classList.toggle('solid', window.scrollY > 10); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  var mb = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('open', open); hdr.classList.toggle('menu-open', open);
    mb.setAttribute('aria-expanded', open); mb.textContent = open ? 'Close' : 'Menu';
  }
  mb.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); mb.focus(); } });

  /* Reveal on scroll */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* Before / after sliders: sketch on the left, finished room on the right */
  function Slider(el) {
    var handle = el.querySelector('.ba-handle');
    var pos = parseFloat(el.style.getPropertyValue('--pos')) || 50;
    var anim = null;
    function set(p) {
      pos = Math.max(0, Math.min(100, p));
      el.style.setProperty('--pos', pos + '%');
      handle.setAttribute('aria-valuenow', Math.round(pos));
      handle.setAttribute('aria-valuetext', Math.round(pos) + '% sketch');
    }
    function fromEvent(e) { var r = el.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
    var dragging = false, startX = 0, startY = 0, decided = false;
    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      stop(); dragging = true; decided = e.pointerType === 'mouse'; startX = e.clientX; startY = e.clientY;
      if (decided) { el.setPointerCapture(e.pointerId); el.classList.add('dragging'); fromEvent(e); }
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      if (!decided) {
        var dx = Math.abs(e.clientX - startX), dy = Math.abs(e.clientY - startY);
        if (dx < 6 && dy < 6) return;
        if (dy > dx) { dragging = false; return; }   // vertical swipe: let the page scroll
        decided = true; el.setPointerCapture(e.pointerId); el.classList.add('dragging');
      }
      fromEvent(e);
    });
    function end(e) {
      if (dragging && !decided && e.type === 'pointerup') fromEvent(e); // a tap jumps there
      dragging = false; el.classList.remove('dragging');
    }
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    handle.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 10 : 2, k = e.key;
      if (k === 'ArrowLeft' || k === 'ArrowDown') set(pos - step);
      else if (k === 'ArrowRight' || k === 'ArrowUp') set(pos + step);
      else if (k === 'Home') set(0); else if (k === 'End') set(100);
      else return;
      stop(); e.preventDefault();
    });
    function stop() { if (anim) { cancelAnimationFrame(anim); anim = null; } }
    // Ease through a list of stops, e.g. [100, 12, 50]
    function play(stops, durs) {
      stop(); var i = 0;
      (function leg() {
        if (i >= stops.length - 1) return;
        var a = stops[i], b = stops[i + 1], d = durs[i], t0 = null;
        anim = requestAnimationFrame(function step(t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / d), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          set(a + (b - a) * e);
          if (k < 1) anim = requestAnimationFrame(step); else { i++; leg(); }
        });
      })();
    }
    return { set: set, play: play };
  }

  var sliders = new Map();
  document.querySelectorAll('.ba').forEach(function (el) { sliders.set(el, Slider(el)); });

  // Hero: the sketch draws back to reveal the finished room once, then rests in the middle
  var hero = document.querySelector('.ba[data-intro]');
  if (hero) {
    var hs = sliders.get(hero);
    if (reduce) hs.set(50);
    else {
      var imgs = hero.querySelectorAll('img'), left = imgs.length, started = false;
      var go = function () { if (started) return; started = true; setTimeout(function () { hs.play([100, 10, 50], [2200, 1100]); }, 450); };
      imgs.forEach(function (im) { if (im.complete) { if (--left === 0) go(); } else im.addEventListener('load', function () { if (--left === 0) go(); }); });
      setTimeout(go, 2500);
    }
  }

  // Studies: gentle hint sweep the first time each one is seen
  var hinted = new WeakSet();
  function hint(el) {
    if (reduce || hinted.has(el)) return; hinted.add(el);
    sliders.get(el).play([50, 72, 30, 50], [600, 800, 600]);
  }
  if ('IntersectionObserver' in window) {
    var hio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && !e.target.closest('[hidden]')) { hint(e.target); hio.unobserve(e.target); } });
    }, { threshold: .55 });
    document.querySelectorAll('.study.is-on .ba').forEach(function (el) { hio.observe(el); });
  }

  /* Study tabs */
  var work = document.querySelector('.work');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.study-tabs [role="tab"]'));
  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab, panel = document.getElementById(t.getAttribute('aria-controls'));
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      panel.hidden = !on; panel.classList.toggle('is-on', on);
      if (on) {
        work.style.setProperty('--tint', panel.dataset.tint);
        var ba = panel.querySelector('.ba'); sliders.get(ba).set(50);
        panel.querySelectorAll('img[loading="lazy"]').forEach(function (im) { im.loading = 'eager'; });
        setTimeout(function () { hint(ba); }, 350);
      }
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (j === null) return; e.preventDefault(); select(tabs[(j + tabs.length) % tabs.length], true);
    });
  });
  // Warm the next study's images once the section is near
  if ('IntersectionObserver' in window && work) {
    var pio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; pio.disconnect();
      setTimeout(function () { document.querySelectorAll('.study[hidden] img').forEach(function (im) { var p = new Image(); p.src = im.currentSrc || im.src; }); }, 1200);
    }, { rootMargin: '400px 0px' });
    pio.observe(work);
  }

  /* Palette chips copy their hex */
  document.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip'); if (!chip) return;
    var hex = chip.dataset.hex, name = chip.querySelector('b').textContent;
    var done = function () { toast(name + ' ' + hex + ' copied'); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(hex).then(done, function () { toast(name + ' is ' + hex); });
    else toast(name + ' is ' + hex);
  });

  /* Instagram: swap in the live feed when a Behold feed ID is set */
  var grid = document.getElementById('ig-grid');
  if (grid && BEHOLD_FEED_ID) {
    fetch('https://feeds.behold.so/' + BEHOLD_FEED_ID, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw r.status; return r.json(); })
      .then(function (d) {
        var posts = (Array.isArray(d) ? d : (d && d.posts) || []).filter(function (p) {
          var id = (p.permalink || '').split('/').filter(Boolean).pop();
          return p.mediaType !== 'VIDEO' && IG_HIDE.indexOf(id) < 0;
        }).slice(0, 8);
        if (posts.length < 4) return; // keep the saved posts rather than show a thin grid
        grid.textContent = '';
        posts.forEach(function (p) {
          var s = p.sizes || {};
          var src = (s.medium && s.medium.mediaUrl) || (s.small && s.small.mediaUrl) || p.mediaUrl;
          if (!src) return;
          var cap = (p.prunedCaption || p.caption || '').replace(/#\S+/g, '').trim();
          var short = cap.length > 110 ? cap.slice(0, 108).replace(/\s+\S*$/, '') + '…' : cap;
          var a = document.createElement('a');
          a.className = 'ig-tile'; a.href = p.permalink || 'https://www.instagram.com/' + IG_HANDLE + '/';
          a.target = '_blank'; a.rel = 'noopener';
          a.setAttribute('aria-label', (short ? 'Instagram post: ' + short : 'Instagram post') + ', opens Instagram');
          var img = document.createElement('img');
          img.src = src; img.alt = ''; img.loading = 'lazy'; img.width = 600; img.height = 600;
          a.appendChild(img);
          if (short) { var c = document.createElement('span'); c.className = 'ig-cap'; c.textContent = short; a.appendChild(c); }
          grid.appendChild(a);
        });
      })
      .catch(function () { /* keep the saved posts */ });
  }

  /* Enquiry form */
  var form = document.getElementById('enquiry');
  if (form) {
    var msg = form.querySelector('.form-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, bad = null;
      ['name', 'email'].forEach(function (n) {
        var el = f[n], ok = el.value.trim() && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
        el.classList.toggle('bad', !ok); el.setAttribute('aria-invalid', !ok);
        if (!ok && !bad) bad = el;
      });
      if (bad) { msg.textContent = 'Please add your name and a valid email so I can reply.'; bad.focus(); return; }
      var picked = function (n) { return Array.prototype.map.call(form.querySelectorAll('input[name="' + n + '"]:checked'), function (i) { return i.value; }).join(', '); };
      var data = {
        name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(),
        help: picked('help'), rooms: picked('rooms'), timing: f.timing.value, message: f.message.value.trim()
      };
      var body = [
        'Name: ' + data.name, 'Email: ' + data.email, data.phone && 'Phone: ' + data.phone,
        data.help && 'Help with: ' + data.help, data.rooms && 'Spaces: ' + data.rooms, data.timing && 'Timing: ' + data.timing,
        '', data.message
      ].filter(function (l) { return l !== false && l !== ''; }).join('\n');

      if (FORM_ENDPOINT) {
        msg.textContent = 'Sending…';
        fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw r.status; form.reset(); msg.textContent = 'Thank you, ' + data.name.split(' ')[0] + '. Your enquiry is in, and I\'ll be in touch soon.'; })
          .catch(function () { msg.textContent = 'That didn\'t go through. Please try again, or message me on Instagram.'; });
        return;
      }
      if (CONTACT_EMAIL) {
        location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('New project enquiry from ' + data.name) + '&body=' + encodeURIComponent(body);
        msg.textContent = 'Your email app should open with everything filled in. Just press send.';
        return;
      }
      // No inbox set up yet: hand the note to Instagram DMs
      var open = function () { window.open('https://ig.me/m/' + IG_HANDLE, '_blank', 'noopener'); };
      var copied = function () { msg.textContent = 'Your note is copied. Paste it into the Instagram message that just opened.'; open(); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(body).then(copied, open);
      else { open(); msg.textContent = 'Instagram is opening so you can send your note as a message.'; }
    });
    form.addEventListener('input', function (e) { if (e.target.classList.contains('bad')) { e.target.classList.remove('bad'); e.target.removeAttribute('aria-invalid'); } });
  }

  var y = document.getElementById('yr'); if (y) y.textContent = new Date().getFullYear();
})();

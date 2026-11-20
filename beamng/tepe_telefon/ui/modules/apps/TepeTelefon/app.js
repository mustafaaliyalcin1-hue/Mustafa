/* Tepe Telefon — BeamNG.drive UI uygulaması.
   Lua tarafı: lua/ge/extensions/tepeTelefon.lua (guihooks 'TepeTelefon' olayı). */
(function () {
  'use strict';

  var BASE = '/ui/modules/apps/TepeTelefon/';
  var STORE_KEY = 'tepeTelefon.v1';
  var DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  var MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  // ---------- simgeler ----------
  var P = {
    phone: '<path d="M6.6 3.5h2.6l1.4 4-2 1.4a12 12 0 0 0 6.5 6.5l1.4-2 4 1.4v2.6A2 2 0 0 1 18.4 20 15 15 0 0 1 4 5.6a2 2 0 0 1 2.6-2.1z" fill="currentColor"/>',
    msg: '<path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 17.5H10l-4.5 3.5v-3.5H4A1.5 1.5 0 0 1 2.5 16V7A1.5 1.5 0 0 1 4 5.5z" fill="currentColor"/>',
    radar: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 12 18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>',
    taxi: '<path d="M9 4h6l.8 2.5H18a2 2 0 0 1 1.9 1.4L21 12v5.5a1 1 0 0 1-1 1h-1.3a1 1 0 0 1-1-1v-1H6.3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V12l1.1-4.1A2 2 0 0 1 6 6.5h2.2z M6.4 8.3 5.6 11h12.8l-.8-2.7z" fill="currentColor"/><circle cx="7" cy="13.6" r="1.3" fill="#000" opacity=".35"/><circle cx="17" cy="13.6" r="1.3" fill="#000" opacity=".35"/>',
    med: '<path d="M9.5 3.5h5v6h6v5h-6v6h-5v-6h-6v-5h6z" fill="currentColor"/>',
    wallet: '<path d="M4 6.5h14a2 2 0 0 1 2 2V9h-5a3 3 0 0 0 0 6h5v.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z M15 10.5h6v3h-6a1.5 1.5 0 0 1 0-3z" fill="currentColor"/>',
    gear: '<path d="M10.3 2.5h3.4l.5 2.6 1.6.9 2.5-1 1.7 2.9-2 1.7v1.8l2 1.7-1.7 2.9-2.5-1-1.6.9-.5 2.6h-3.4l-.5-2.6-1.6-.9-2.5 1-1.7-2.9 2-1.7v-1.8l-2-1.7 1.7-2.9 2.5 1 1.6-.9z" fill="currentColor"/><circle cx="12" cy="12" r="3.1" fill="#000" opacity=".45"/>',
    sos: '<text x="12" y="15.6" text-anchor="middle" font-size="9.2" font-weight="800" font-family="Arial,sans-serif" fill="currentColor">SOS</text>',
    shield: '<path d="M12 2.8 19.5 5.5v6c0 4.6-3.2 8.3-7.5 9.7C7.7 19.8 4.5 16.1 4.5 11.5v-6z" fill="currentColor"/><path d="m12 7.3 1.3 2.7 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4z" fill="#000" opacity=".35"/>',
    flower: '<path d="M12 21v-7" stroke="currentColor" stroke-width="1.8"/><path d="M12 4c1.6 2 1.6 4.2 0 6.2C10.4 8.2 10.4 6 12 4zm-4.6 3.4c2.4.4 3.8 2 4.1 4.4-2.4-.3-3.9-1.9-4.1-4.4zm9.2 0c-.2 2.5-1.7 4.1-4.1 4.4.3-2.4 1.7-4 4.1-4.4z" fill="currentColor"/>',
    user: '<circle cx="12" cy="8.5" r="4" fill="currentColor"/><path d="M4 20.5c.8-4 4-6 8-6s7.2 2 8 6z" fill="currentColor"/>',
    back: '<path d="M14.5 5 8 12l6.5 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    spk: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15 9a4.5 4.5 0 0 1 0 6M17.5 6.5a8 8 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    mute: '<rect x="9" y="3.5" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11.5a6 6 0 0 0 12 0M12 17.5v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M4.5 4.5l15 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    pad: '<g fill="currentColor"><circle cx="6.5" cy="5.5" r="1.7"/><circle cx="12" cy="5.5" r="1.7"/><circle cx="17.5" cy="5.5" r="1.7"/><circle cx="6.5" cy="11" r="1.7"/><circle cx="12" cy="11" r="1.7"/><circle cx="17.5" cy="11" r="1.7"/><circle cx="6.5" cy="16.5" r="1.7"/><circle cx="12" cy="16.5" r="1.7"/><circle cx="17.5" cy="16.5" r="1.7"/><circle cx="12" cy="21.5" r="1.7"/></g>',
    end: '<path d="M2.5 13.6c5.5-5 13.5-5 19 0l-2.3 2.6-3.6-1.4v-2.6c-2.4-.8-4.8-.8-7.2 0v2.6l-3.6 1.4z" fill="currentColor"/>',
    del: '<path d="M8.5 5.5H20a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H8.5L2.5 12z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m11.5 9.5 5 5m0-5-5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    hearse: '<path d="M2.5 15.5V10l3-3.5h9l3.5 3.5 3 .8v4.7z" fill="currentColor"/><circle cx="7" cy="16.5" r="2" fill="currentColor"/><circle cx="17" cy="16.5" r="2" fill="currentColor"/><path d="M9.5 8.3v4M7.5 10.2h4" stroke="#000" stroke-width="1.3" opacity=".4"/>',
    amb: '<path d="M2.5 16.5V8.5a1.5 1.5 0 0 1 1.5-1.5h10v9.5zM14 9.5h3.8l3.7 3.7v3.3H14z" fill="currentColor"/><circle cx="7" cy="17" r="2" fill="currentColor"/><circle cx="17.5" cy="17" r="2" fill="currentColor"/><path d="M8.3 9v5M5.8 11.5h5" stroke="#000" stroke-width="1.5" opacity=".45"/>',
    car: '<path d="M5 11 6.8 6.6A2 2 0 0 1 8.7 5.3h6.6a2 2 0 0 1 1.9 1.3L19 11v6a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1h-7v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" fill="currentColor"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" fill="currentColor"/>'
  };
  function ic(n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + P[n] + '</svg>'; }

  var KIND = {
    police: { label: 'Polis', icon: 'shield', color: '#2f6fe4' },
    ambulance: { label: 'Ambulans', icon: 'amb', color: '#e5322d' },
    taxi: { label: 'Taksi', icon: 'taxi', color: '#f2b705' },
    hearse: { label: 'Cenaze aracı', icon: 'hearse', color: '#6e6e78' }
  };

  var CONTACTS = [
    { num: '112', name: '112 Acil Çağrı', sub: 'Ambulans · Polis · Jandarma', color: '#e5322d', icon: 'sos' },
    { num: '155', name: '155 Polis İmdat', sub: 'Emniyet Genel Müdürlüğü', color: '#2f6fe4', icon: 'shield' },
    { num: '188', name: '188 Cenaze Hizmetleri', sub: 'Belediye', color: '#55555f', icon: 'flower' },
    { num: '4448294', name: 'Durak Taksi', sub: '7/24 sarı taksi', color: '#f2b705', icon: 'taxi', fmt: '444 82 94' },
    { num: '05321234567', name: 'Annem', sub: 'Mobil', color: '#c2559a', icon: 'user', fmt: '0532 123 45 67' }
  ];
  function contactByNum(n) { for (var i = 0; i < CONTACTS.length; i++) if (CONTACTS[i].num === n) return CONTACTS[i]; return null; }

  // ---------- yardımcılar ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function tl(n) { return Number(n || 0).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' ₺'; }
  function tl2(n) { return Number(n || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺'; }
  function hm(d) { d = d || new Date(); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function dist(m) { if (m == null) return ''; return m >= 1000 ? (m / 1000).toFixed(1).replace('.', ',') + ' km' : Math.round(m) + ' m'; }
  function eta(s) { if (s == null) return ''; if (s < 45) return '1 dk içinde'; return '~' + Math.max(1, Math.round(s / 60)) + ' dk'; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function ago(ts) {
    var s = (Date.now() - ts) / 1000;
    if (s < 60) return 'şimdi'; if (s < 3600) return Math.floor(s / 60) + ' dk önce';
    var d = new Date(ts); return hm(d);
  }

  function load() {
    var def = { wallet: 15000, tx: [], threads: {}, recents: [], settings: { crash: true, delay: 10, autoOpen: true }, battery: 86 };
    try { var s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); if (s) { for (var k in def) if (!(k in s)) s[k] = def[k]; return s; } } catch (e) { }
    return def;
  }

  // =====================================================================
  function Phone(host, api) {
    this.host = host; this.api = api;
    this.db = load();
    this.screen = 'home'; this.stack = [];
    this.live = { units: [], incident: null, ride: null, level: '', speed: 0 };
    this.call = null; this.stmt = null; this.taxi = { phase: 'idle' }; this.crash = null;
    this.pocket = false; this.thread = null; this.dial = '';
    this.timers = [];
    this.build();
    var self = this;
    this.tick = setInterval(function () { self.onTick(); }, 1000);
    this.ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(function () { self.fit(); }) : null;
    if (this.ro) this.ro.observe(host); else window.addEventListener('resize', function () { self.fit(); });
    this.fit();
    this.render();
    this.pushSettings();
  }
  var PR = Phone.prototype;

  PR.save = function () { try { localStorage.setItem(STORE_KEY, JSON.stringify(this.db)); } catch (e) { } };
  PR.send = function (cmd, data) { try { this.api.send(cmd, data || {}); } catch (e) { } };
  PR.later = function (fn, ms) { var self = this; var t = setTimeout(function () { fn.call(self); }, ms); this.timers.push(t); return t; };
  PR.pushSettings = function () { this.send('settings', { crash: this.db.settings.crash, delay: this.db.settings.delay }); };

  PR.build = function () {
    this.host.classList.add('tt-host');
    this.host.innerHTML =
      '<div class="tt-phone">' +
      ' <div class="tt-btn tt-b1"></div><div class="tt-btn tt-b2"></div><div class="tt-btn tt-b3"></div>' +
      ' <div class="tt-screen">' +
      '  <div class="tt-status"><span class="tt-clock"></span><span class="tt-isl"><i class="tt-cam"></i><span class="tt-islc"></span></span>' +
      '   <span class="tt-sys"><span class="tt-sig"><i></i><i></i><i></i><i></i></span><b class="tt-net">5G</b><span class="tt-bat"><i></i></span></span></div>' +
      '  <div class="tt-view"></div>' +
      '  <div class="tt-banner"></div>' +
      '  <div class="tt-overlay"></div>' +
      '  <div class="tt-homebar" title="Ana ekran / cebe koy"><i></i></div>' +
      ' </div>' +
      '</div>';
    this.$phone = this.host.querySelector('.tt-phone');
    this.$view = this.host.querySelector('.tt-view');
    this.$banner = this.host.querySelector('.tt-banner');
    this.$over = this.host.querySelector('.tt-overlay');
    this.$isl = this.host.querySelector('.tt-isl');
    var self = this;
    this.host.addEventListener('click', function (e) { self.onClick(e); });
    this.host.querySelector('.tt-homebar').addEventListener('click', function (e) {
      e.stopPropagation();
      if (self.pocket) { self.setPocket(false); return; }
      if (self.screen === 'home' && !self.call) self.setPocket(true); else self.go('home', true);
    });
    this.$phone.addEventListener('click', function () { if (self.pocket) self.setPocket(false); }, true);
  };

  PR.fit = function () {
    var w = this.host.clientWidth || 330, h = this.host.clientHeight || 700;
    var ph = Math.min(h, w * 19.5 / 9), pw = ph * 9 / 19.5;
    this.$phone.style.width = pw + 'px'; this.$phone.style.height = ph + 'px';
    this.$phone.style.fontSize = (pw / 30) + 'px';
  };

  PR.setPocket = function (v) { this.pocket = v; this.$phone.classList.toggle('pocket', v); };
  PR.raise = function () { if (this.db.settings.autoOpen && this.pocket) this.setPocket(false); };

  // ---------- gezinme ----------
  PR.go = function (s, reset) {
    if (reset) this.stack = []; else if (this.screen !== s) this.stack.push(this.screen);
    this.screen = s; this.render();
  };
  PR.back = function () { this.screen = this.stack.pop() || 'home'; this.render(); };

  PR.onClick = function (e) {
    var t = e.target.closest('[data-a]');
    if (!t || !this.host.contains(t)) return;
    e.stopPropagation();
    var a = t.getAttribute('data-a'), v = t.getAttribute('data-v');
    var h = this.actions[a];
    if (h) h.call(this, v, t);
  };

  // ---------- Lua olayları ----------
  PR.onLua = function (d) {
    if (!d || !d.t) return;
    var f = this.lua[d.t];
    if (f) f.call(this, d);
  };

  PR.lua = {
    state: function (d) {
      this.live = d;
      if (d.crash != null && this.crash) this.crash.left = d.crash;
      this.updIsland();
      if (/^(home|track|taxi|med)$/.test(this.screen) && !this.call) this.render(true);
      if (this.crash) this.renderCrash();
    },
    toggle: function () { this.setPocket(!this.pocket); },
    notify: function (d) { this.banner(d.title, d.text, d.app); this.addMsg(threadFor(d.app), d.text, true); },
    sms: function (d) { this.addMsg(d.from, d.text, false); this.banner(d.from, d.text, 'msg'); },
    error: function (d) { this.banner('Tepe Telefon', d.text, 'gear'); },
    crash: function (d) {
      this.crash = { left: d.countdown, total: d.countdown, speed: d.speed, solo: d.solo };
      this.raise(); this.vibrate(); this.renderCrash();
      this.db.lastCrash = Date.now(); this.save();
    },
    crash_off: function (d) {
      this.crash = null; this.$over.innerHTML = ''; this.$over.className = 'tt-overlay';
      if (d.cancel) this.banner('Kaza algılama', 'İptal edildi. İyi olmana sevindik.', 'gear');
    },
    dispatched: function (d) {
      var self = this;
      (d.units || []).forEach(function (u) {
        var k = KIND[u.kind] || {};
        self.banner(u.name, k.label + ' yola çıktı · ' + u.plate + (u.eta ? ' · ' + eta(u.eta) : ''), u.kind);
      });
      if (d.reason === 'taksi' && d.units && d.units[0]) {
        this.taxi = { phase: 'enroute', unit: d.units[0] };
        this.addMsg('Durak Taksi', 'Taksiniz yola çıktı. Plaka: ' + d.units[0].plate + ', şoför: ' + d.units[0].driver + ' Bey. İyi yolculuklar dileriz.', false);
      }
      if (d.reason === 'auto' || d.reason === 'kaza') { if (this.screen === 'home') this.go('track'); }
      this.render(true);
    },
    taxi_arrived: function (d) {
      this.taxi = { phase: 'arrived', plate: d.plate, driver: d.driver };
      this.raise(); this.vibrate();
      this.banner('Taksin geldi', 'Sarı taksi ' + d.plate + ' kapıda bekliyor. Yaklaşıp “Bin”e bas.', 'taxi');
      if (!this.call) this.go('taxi');
    },
    taxi_left: function () {
      this.taxi = { phase: 'idle' };
      this.pay(50, 'Taksi bekleme ücreti', 'taxi');
      this.banner('Durak Taksi', 'Taksi 2 dakika bekledi ve ayrıldı. Bekleme ücreti: 50 ₺', 'taxi');
      this.render(true);
    },
    ride: function (d) { this.taxi.phase = d.phase === 'dest' ? 'dest' : 'ride'; this.raise(); this.go('taxi'); },
    ride_end: function (d) {
      this.taxi = { phase: 'done', km: d.km, fare: d.fare, arrived: d.arrived };
      if (d.fare > 0) this.pay(d.fare, 'Taksi yolculuğu · ' + String(d.km).replace('.', ',') + ' km', 'taxi');
      this.raise(); this.go('taxi');
    },
    med_open: function () { this.raise(); if (!this.call && !this.stmt) this.go('med'); },
    statement: function (d) { this.startStatement(d); },
    police_ask: function (d) { this.startPoliceAsk(d); }
  };

  function threadFor(app) {
    return { police: 'Emniyet Trafik', med: '112 Acil', ambulance: '112 Acil', hearse: '188 Cenaze Hizmetleri', taxi: 'Durak Taksi' }[app] || null;
  }

  // ---------- bildirim, titreşim, mesaj ----------
  PR.banner = function (title, text, app) {
    var self = this, b = this.$banner;
    var k = KIND[app] || null;
    var iconName = k ? k.icon : ({ med: 'med', msg: 'msg', gear: 'gear', police: 'shield' }[app] || 'msg');
    var col = k ? k.color : ({ med: '#e5322d', msg: '#34c759', gear: '#8e8e93', police: '#2f6fe4' }[app] || '#34c759');
    b.innerHTML = '<div class="tt-bn" data-a="bannerTap" data-v="' + esc(app || '') + '"><span class="tt-bni" style="background:' + col + '">' + ic(iconName) + '</span>' +
      '<div class="tt-bnt"><b>' + esc(title) + '</b><span>' + esc(text) + '</span></div><em>şimdi</em></div>';
    b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    clearTimeout(this._bt); this._bt = setTimeout(function () { b.classList.remove('show'); }, 4800);
    if (self.pocket) self.$phone.classList.add('peek');
    clearTimeout(this._pk); this._pk = setTimeout(function () { self.$phone.classList.remove('peek'); }, 4800);
  };
  PR.vibrate = function () { var p = this.$phone; p.classList.remove('vib'); void p.offsetWidth; p.classList.add('vib'); };

  PR.addMsg = function (from, text, mine) {
    if (!from || !text) return;
    var th = this.db.threads[from] || (this.db.threads[from] = { msgs: [], unread: 0 });
    th.msgs.push({ me: false, text: text, ts: Date.now() });
    if (th.msgs.length > 60) th.msgs.shift();
    if (!(this.screen === 'thread' && this.thread === from)) th.unread++;
    th.ts = Date.now();
    this.save();
    if (this.screen === 'messages' || (this.screen === 'thread' && this.thread === from)) this.render(true);
  };

  PR.pay = function (amount, label, kind) {
    this.db.wallet -= amount;
    this.db.tx.unshift({ a: -amount, l: label, k: kind || 'other', ts: Date.now() });
    if (this.db.tx.length > 80) this.db.tx.pop();
    this.save();
  };
  PR.earn = function (amount, label, kind) {
    this.db.wallet += amount;
    this.db.tx.unshift({ a: amount, l: label, k: kind || 'other', ts: Date.now() });
    this.save();
  };

  // ---------- zamanlayıcı ----------
  PR.onTick = function () {
    var now = Date.now();
    if (!this._batT) this._batT = now;
    if (now - this._batT > 240000) { this._batT = now; this.db.battery = Math.max(5, this.db.battery - 1); this.save(); }
    var c = this.host.querySelector('.tt-clock'); if (c) c.textContent = hm();
    var bat = this.host.querySelector('.tt-bat i'); if (bat) bat.style.width = this.db.battery + '%';
    if (this.call && this.call.phase === 'talk') { var ct = this.host.querySelector('.tt-ctime'); if (ct) ct.textContent = mmss((now - this.call.t0) / 1000); }
    if (this.screen === 'home') { var hc = this.host.querySelector('.tt-hclock'); if (hc) hc.textContent = hm(); }
  };

  PR.updIsland = function () {
    var u = (this.live.units || []).filter(function (x) { return x.status === 'enroute'; });
    var c = this.$isl.querySelector('.tt-islc');
    var r = this.live.ride;
    var html = '';
    if (this.crash) html = '<b class="red">KAZA ' + this.crash.left + '</b>';
    else if (r) html = ic('taxi', 'y') + '<b>' + tl2(r.fare) + '</b>';
    else if (this.call && this.call.phase === 'talk') html = '<i class="tt-dotg"></i><b class="tt-ctime2">' + esc(this.call.c.name.split(' ')[0]) + '</b>';
    else if (u.length) {
      var k = KIND[u[0].kind] || {};
      html = '<span style="color:' + k.color + '">' + ic(k.icon) + '</span><b>' + (u[0].eta != null ? mmss(u[0].eta) : '…') + '</b>';
    }
    c.innerHTML = html;
    this.$isl.classList.toggle('wide', !!html);
  };

  // =====================================================================
  // ekranlar
  PR.render = function (soft) {
    if (soft && this._lastScreen === this.screen && (this.screen === 'call' || this.screen === 'statement')) return;
    var fn = this.screens[this.screen] || this.screens.home;
    var keepScroll = soft && this._lastScreen === this.screen;
    var sc = this.$view.querySelector('.tt-scroll');
    var st = keepScroll && sc ? sc.scrollTop : 0;
    this.$view.innerHTML = fn.call(this);
    this.$view.className = 'tt-view s-' + this.screen;
    this.$view.parentNode.setAttribute('data-theme', /^(dialer|messages|thread|taxi|med|wallet|settings|statement)$/.test(this.screen) ? 'light' : 'dark');
    if (keepScroll) { var ns = this.$view.querySelector('.tt-scroll'); if (ns) ns.scrollTop = st; }
    this._lastScreen = this.screen;
    this.onTick();
    this.updIsland();
  };

  function header(title, opts) {
    opts = opts || {};
    return '<div class="tt-head ' + (opts.cls || '') + '"><button class="tt-bk" data-a="back">' + ic('back') + '<span>' + esc(opts.back || 'Geri') + '</span></button>' +
      '<h1>' + esc(title) + '</h1>' + (opts.right || '<span></span>') + '</div>';
  }

  PR.screens = {};
  var S = PR.screens;

  S.home = function () {
    var d = new Date();
    var units = (this.live.units || []).filter(function (u) { return u.status !== 'leaving'; });
    var unread = 0, th = this.db.threads; for (var k in th) unread += th[k].unread || 0;
    var widget = '';
    if (units.length) {
      widget = '<div class="tt-wid" data-a="go" data-v="track"><div class="tt-widh">' + ic('radar') + '<b>Canlı ekip takibi</b><em>' + esc(this.live.level || '') + '</em></div>' +
        units.slice(0, 3).map(function (u) {
          var k = KIND[u.kind] || {};
          return '<div class="tt-widr"><span class="tt-dotk" style="background:' + k.color + '">' + ic(k.icon) + '</span><span>' + esc(k.label) + '</span><b>' +
            (u.status === 'enroute' ? esc(dist(u.dist)) + ' · ' + esc(eta(u.eta)) : (u.status === 'onscene' ? 'Olay yerinde' : 'Yolculukta')) + '</b></div>';
        }).join('') + '</div>';
    } else {
      widget = '<div class="tt-wid w2"><div class="tt-widh">' + ic('car') + '<b>Sürüş</b><em>' + esc(this.live.level || 'Serbest sürüş') + '</em></div>' +
        '<div class="tt-drive"><div><b>' + (this.live.speed || 0) + '</b><span>km/s</span></div><div><b>' + (this.db.settings.crash ? 'Açık' : 'Kapalı') + '</b><span>Kaza algılama</span></div><div><b>' + tl(this.db.wallet) + '</b><span>Cüzdan</span></div></div></div>';
    }
    function app(id, name, icon, bg, badge) {
      return '<button class="tt-app" data-a="go" data-v="' + id + '"><span class="tt-ai" style="background:' + bg + '">' + ic(icon) + (badge ? '<i class="tt-badge">' + badge + '</i>' : '') + '</span><span class="tt-an">' + name + '</span></button>';
    }
    return '<div class="tt-wall"></div><div class="tt-home">' +
      '<div class="tt-lock"><div class="tt-date">' + DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + '</div><div class="tt-hclock">' + hm(d) + '</div></div>' +
      widget +
      '<div class="tt-grid">' +
      app('dialer', 'Telefon', 'phone', 'linear-gradient(#5ee07a,#28b44a)') +
      app('messages', 'Mesajlar', 'msg', 'linear-gradient(#64e07c,#25b14a)', unread) +
      app('track', 'Ekip Takip', 'radar', 'linear-gradient(#4a8cff,#1d5be0)') +
      app('taxi', 'Taksi', 'taxi', 'linear-gradient(#ffd23d,#f0a800)') +
      app('med', 'Sağlık', 'med', 'linear-gradient(#ffffff,#e9e9ee)" data-red="1') +
      app('wallet', 'Cüzdan', 'wallet', 'linear-gradient(#2b2b30,#0d0d10)') +
      app('sos', 'Acil SOS', 'sos', 'linear-gradient(#ff5b4f,#d8221a)') +
      app('settings', 'Ayarlar', 'gear', 'linear-gradient(#a7a7ae,#77777e)') +
      '</div>' +
      '<div class="tt-dock">' +
      '<button class="tt-app" data-a="go" data-v="dialer"><span class="tt-ai" style="background:linear-gradient(#5ee07a,#28b44a)">' + ic('phone') + '</span></button>' +
      '<button class="tt-app" data-a="go" data-v="messages"><span class="tt-ai" style="background:linear-gradient(#64e07c,#25b14a)">' + ic('msg') + '</span></button>' +
      '<button class="tt-app" data-a="go" data-v="taxi"><span class="tt-ai" style="background:linear-gradient(#ffd23d,#f0a800)">' + ic('taxi') + '</span></button>' +
      '<button class="tt-app" data-a="go" data-v="sos"><span class="tt-ai" style="background:linear-gradient(#ff5b4f,#d8221a)">' + ic('sos') + '</span></button>' +
      '</div></div>';
  };

  // ---- telefon ----
  S.dialer = function () {
    var tab = this.dialTab || 'pad';
    var body = '';
    if (tab === 'pad') {
      var keys = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']];
      var c = contactByNum(this.dial);
      body = '<div class="tt-dnum">' + esc(this.dial || '') + '</div><div class="tt-dname">' + (c ? esc(c.name) : (this.dial ? 'Numara ekle' : '&nbsp;')) + '</div>' +
        '<div class="tt-keys">' + keys.map(function (k) { return '<button class="tt-key" data-a="key" data-v="' + k[0] + '"><b>' + k[0] + '</b><small>' + k[1] + '</small></button>'; }).join('') + '</div>' +
        '<div class="tt-drow"><span></span><button class="tt-callb" data-a="dialCall">' + ic('phone') + '</button>' +
        (this.dial ? '<button class="tt-delb" data-a="keyDel">' + ic('del') + '</button>' : '<span></span>') + '</div>';
    } else if (tab === 'rec') {
      var r = this.db.recents;
      body = '<div class="tt-scroll tt-list">' + (r.length ? r.map(function (x) {
        var c = contactByNum(x.num);
        return '<button class="tt-row" data-a="callNum" data-v="' + esc(x.num) + '"><span class="tt-av" style="background:' + (c ? c.color : '#8e8e93') + '">' + ic(c ? c.icon : 'user') + '</span>' +
          '<span class="tt-rt"><b class="' + (x.missed ? 'red' : '') + '">' + esc(c ? c.name : x.num) + '</b><small>' + (x.out ? 'Giden arama' : 'Gelen') + (x.dur ? ' · ' + mmss(x.dur) : '') + '</small></span><em>' + ago(x.ts) + '</em></button>';
      }).join('') : '<div class="tt-empty">Henüz arama yok</div>') + '</div>';
    } else {
      body = '<div class="tt-scroll tt-list"><div class="tt-sec">ACİL VE HİZMET</div>' + CONTACTS.map(function (c) {
        return '<button class="tt-row" data-a="callNum" data-v="' + c.num + '"><span class="tt-av" style="background:' + c.color + '">' + ic(c.icon) + '</span>' +
          '<span class="tt-rt"><b>' + esc(c.name) + '</b><small>' + esc(c.fmt || c.num) + ' · ' + esc(c.sub) + '</small></span>' + ic('phone', 'tt-rc') + '</button>';
      }).join('') + '</div>';
    }
    function tb(id, name, icon) { return '<button class="' + (tab === id ? 'on' : '') + '" data-a="dialTab" data-v="' + id + '">' + ic(icon) + '<span>' + name + '</span></button>'; }
    return '<div class="tt-page light">' + (tab === 'pad' ? '<div class="tt-head0"></div>' : header(tab === 'rec' ? 'Son Aramalar' : 'Kişiler', { back: 'Ana ekran' })) +
      '<div class="tt-dbody">' + body + '</div>' +
      '<div class="tt-tabs">' + tb('rec', 'Son', 'phone') + tb('con', 'Kişiler', 'user') + tb('pad', 'Tuş takımı', 'pad') + '</div></div>';
  };

  // ---- arama ----
  S.call = function () {
    var c = this.call; if (!c) return S.home.call(this);
    var lines = c.lines.map(function (l) { return '<div class="tt-cl ' + (l.me ? 'me' : 'op') + '">' + esc(l.text) + '</div>'; }).join('');
    if (c.typing) lines += '<div class="tt-cl op typing"><i></i><i></i><i></i></div>';
    var opts = (c.opts || []).map(function (o, i) { return '<button class="tt-chip" data-a="callOpt" data-v="' + i + '">' + esc(o.l) + '</button>'; }).join('');
    var stat = c.phase === 'dialing' ? 'aranıyor…' : (c.phase === 'ended' ? 'Arama bitti' : '<span class="tt-ctime">0:00</span>');
    return '<div class="tt-page call"><div class="tt-cbg" style="--cc:' + c.c.color + '"></div>' +
      '<div class="tt-ctop"><span class="tt-cav" style="background:' + c.c.color + '">' + ic(c.c.icon) + '</span><h2>' + esc(c.c.name) + '</h2><div class="tt-cst">' + stat + '</div></div>' +
      '<div class="tt-ctr tt-scroll">' + lines + '</div>' +
      '<div class="tt-copts">' + opts + '</div>' +
      '<div class="tt-cbtns"><button data-a="tgl" data-v="mute" class="' + (c.mute ? 'on' : '') + '">' + ic('mute') + '<span>sessiz</span></button>' +
      '<button data-a="tgl" data-v="pad">' + ic('pad') + '<span>tuşlar</span></button>' +
      '<button data-a="tgl" data-v="spk" class="' + (c.spk ? 'on' : '') + '">' + ic('spk') + '<span>hoparlör</span></button></div>' +
      '<div class="tt-cend"><button class="tt-endb" data-a="hang">' + ic('end') + '</button></div></div>';
  };

  // ---- mesajlar ----
  S.messages = function () {
    var th = this.db.threads, keys = Object.keys(th).sort(function (a, b) { return (th[b].ts || 0) - (th[a].ts || 0); });
    return '<div class="tt-page light">' + header('Mesajlar', { back: 'Ana ekran' }) + '<div class="tt-scroll tt-list">' +
      (keys.length ? keys.map(function (k) {
        var t = th[k], last = t.msgs[t.msgs.length - 1] || { text: '', ts: 0 };
        var c = null; CONTACTS.forEach(function (x) { if (x.name.indexOf(k.split(' ')[0]) === 0 || k.indexOf(x.name.split(' ')[0]) === 0) c = c || x; });
        return '<button class="tt-row msg" data-a="openThread" data-v="' + esc(k) + '">' + (t.unread ? '<i class="tt-ud"></i>' : '') +
          '<span class="tt-av" style="background:' + (c ? c.color : '#8e8e93') + '">' + ic(c ? c.icon : 'msg') + '</span><span class="tt-rt"><b>' + esc(k) + '</b><small>' + esc(last.text) + '</small></span><em>' + ago(last.ts) + '</em></button>';
      }).join('') : '<div class="tt-empty">' + ic('msg') + '<br>Mesaj yok</div>') + '</div></div>';
  };
  S.thread = function () {
    var t = this.db.threads[this.thread] || { msgs: [] };
    return '<div class="tt-page light">' + header(this.thread, { back: 'Mesajlar' }) + '<div class="tt-scroll tt-bubbles">' +
      t.msgs.map(function (m) { return '<div class="tt-bb ' + (m.me ? 'me' : '') + '">' + esc(m.text) + '<em>' + hm(new Date(m.ts)) + '</em></div>'; }).join('') +
      '</div><div class="tt-compose"><span>Metin Mesajı</span></div></div>';
  };

  // ---- ekip takip ----
  S.track = function () {
    var units = this.live.units || [];
    var maxd = 120; units.forEach(function (u) { if (u.dx != null) maxd = Math.max(maxd, Math.hypot(u.dx, u.dy)); });
    var scale = maxd < 250 ? 250 : maxd < 500 ? 500 : maxd < 1000 ? 1000 : 2000;
    var R = 46;
    var dots = units.map(function (u) {
      if (u.dx == null) return '';
      var k = KIND[u.kind] || {};
      var x = 50 + Math.max(-R, Math.min(R, u.dx / scale * R)), y = 50 - Math.max(-R, Math.min(R, u.dy / scale * R));
      return '<div class="tt-rd" style="left:' + x + '%;top:' + y + '%;background:' + k.color + '">' + ic(k.icon) + '</div>';
    }).join('');
    var list = units.length ? units.map(function (u) {
      var k = KIND[u.kind] || {};
      var st = u.status === 'enroute' ? ('Yolda · ' + dist(u.dist) + ' · ' + eta(u.eta)) : u.status === 'onscene' ? 'Olay yerinde' : u.status === 'leaving' ? 'Ayrılıyor' : 'Yolculukta';
      return '<div class="tt-unit"><span class="tt-av" style="background:' + k.color + '">' + ic(k.icon) + '</span><span class="tt-rt"><b>' + esc(u.name) + '</b><small>' + esc(u.plate) + ' · ' + esc(st) + '</small>' +
        (u.status === 'enroute' ? '<i class="tt-prog"><i style="width:' + Math.max(6, Math.min(100, 100 - (u.dist || 0) / 5)) + '%;background:' + k.color + '"></i></i>' : '') + '</span>' +
        (u.status === 'enroute' && u.kind !== 'hearse' ? '<button class="tt-x" data-a="cancelUnit" data-v="' + u.id + '">İptal</button>' : '') + '</div>';
    }).join('') : '<div class="tt-empty">Yolda ekip yok.<br><small>112, 155 veya taksi çağırdığında burada canlı izlersin.</small></div>';
    return '<div class="tt-page dark">' + header('Ekip Takip', { back: 'Ana ekran' }) +
      '<div class="tt-radar"><div class="tt-rring r1"></div><div class="tt-rring r2"></div><div class="tt-rsweep"></div>' +
      '<div class="tt-rme"></div>' + dots + '<span class="tt-rsc">' + dist(scale) + '</span><span class="tt-rn">İLERİ</span></div>' +
      '<div class="tt-loc">' + ic('radar') + '<span>' + esc(this.live.level || '') + ' · X ' + (this.live.x || 0) + ' / Y ' + (this.live.y || 0) + '</span></div>' +
      '<div class="tt-scroll tt-units">' + list + '</div></div>';
  };

  // ---- taksi ----
  S.taxi = function () {
    var t = this.taxi, live = (this.live.units || []).filter(function (u) { return u.kind === 'taxi' && u.status !== 'leaving'; })[0];
    if (t.phase === 'idle' && live) t.phase = live.status === 'onscene' ? 'arrived' : 'enroute';
    var body = '';
    if (t.phase === 'idle' || t.phase === 'calling') {
      body = '<div class="tt-tmap"><div class="tt-road"></div><div class="tt-pin">' + ic('user') + '</div><div class="tt-tcars"><i></i><i></i><i></i></div></div>' +
        '<div class="tt-card"><h3>Nereden?</h3><div class="tt-from"><i class="g"></i><span>Bulunduğum konum<small>' + esc(this.live.level || '') + '</small></span></div>' +
        '<div class="tt-fare"><div><b>75 ₺</b><span>açılış</span></div><div><b>45 ₺</b><span>km başı</span></div><div><b>3–5 dk</b><span>yakın taksi</span></div></div>' +
        (t.phase === 'calling' ? '<button class="tt-big y" disabled><span class="tt-spin"></span>En yakın taksi aranıyor…</button>' : '<button class="tt-big y" data-a="taxiCall">' + ic('taxi') + 'Sarı taksi çağır</button>') +
        '<p class="tt-note">Ödeme yolculuk sonunda Cüzdan’dan alınır · Bakiye ' + tl(this.db.wallet) + '</p></div>';
    } else if (t.phase === 'enroute') {
      var u = live || t.unit || {};
      body = '<div class="tt-tmap"><div class="tt-road"></div><div class="tt-pin">' + ic('user') + '</div><div class="tt-tcar" style="left:' + Math.max(8, 70 - (u.dist || 300) / 8) + '%">' + ic('taxi') + '</div></div>' +
        '<div class="tt-card"><div class="tt-teta"><b>' + (u.eta != null ? mmss(u.eta) : '…') + '</b><span>' + dist(u.dist) + ' uzakta · yolda</span></div>' +
        '<div class="tt-drv"><span class="tt-av" style="background:#f2b705">' + ic('user') + '</span><span class="tt-rt"><b>' + esc(u.driver || '') + '</b><small>★ ' + (4.6 + Math.random() * 0.35).toFixed(1).replace('.', ',') + ' · Sarı taksi</small></span><span class="tt-plate">' + esc(u.plate || '') + '</span></div>' +
        '<button class="tt-big ghost" data-a="taxiCancel">Çağrıyı iptal et</button></div>';
    } else if (t.phase === 'arrived') {
      var a = live || {};
      body = '<div class="tt-tmap here"><div class="tt-road"></div><div class="tt-pin">' + ic('user') + '</div><div class="tt-tcar" style="left:44%">' + ic('taxi') + '</div></div>' +
        '<div class="tt-card"><div class="tt-teta"><b>Taksin geldi</b><span>Dörtlüleri yanıyor, seni bekliyor</span></div>' +
        '<div class="tt-drv"><span class="tt-av" style="background:#f2b705">' + ic('user') + '</span><span class="tt-rt"><b>' + esc(t.driver || a.driver || '') + '</b><small>Sarı taksi</small></span><span class="tt-plate">' + esc(t.plate || a.plate || '') + '</span></div>' +
        '<button class="tt-big y" data-a="taxiBoard">' + ic('car') + 'Taksiye bin</button><button class="tt-big ghost" data-a="taxiCancel">Vazgeç</button></div>';
    } else if (t.phase === 'dest') {
      body = '<div class="tt-card full"><h3>Nereye gidelim abi?</h3>' +
        [['1', 'Yakın bir yere', '~1 km · 120 ₺ civarı'], ['3', 'Şehrin öbür ucuna', '~3 km · 210 ₺ civarı'], ['6', 'Uzak bir yere', '~6 km · 345 ₺ civarı']].map(function (o) {
          return '<button class="tt-row dest" data-a="taxiDest" data-v="' + o[0] + '"><span class="tt-av" style="background:#1c1c1e">' + ic('radar') + '</span><span class="tt-rt"><b>' + o[1] + '</b><small>' + o[2] + '</small></span></button>';
        }).join('') + '<button class="tt-big ghost" data-a="taxiExit">Vazgeçtim, ineyim</button></div>';
    } else if (t.phase === 'ride') {
      var r = this.live.ride || { km: 0, fare: 75 };
      body = '<div class="tt-meter"><div class="tt-mlab">TAKSİMETRE · ÜCRETLİ</div><div class="tt-mval">' + tl2(r.fare) + '</div>' +
        '<div class="tt-mrow"><div><b>' + String(r.km.toFixed(2)).replace('.', ',') + '</b><span>km</span></div><div><b>' + (this.live.speed || 0) + '</b><span>km/s</span></div><div><b>' + (r.rem != null ? dist(r.rem) : '—') + '</b><span>kalan</span></div></div></div>' +
        '<div class="tt-card"><p class="tt-note">Şoför seni hedefe götürüyor. Kuş uçuşu kalan mesafe yukarıda.</p><button class="tt-big y" data-a="taxiExit">Burada in</button></div>';
    } else if (t.phase === 'done') {
      body = '<div class="tt-card full center"><div class="tt-okc">' + ic('check') + '</div><h3>' + (t.arrived ? 'Hedefe vardın' : 'Taksiden indin') + '</h3>' +
        '<div class="tt-rec"><div><span>Mesafe</span><b>' + String(t.km).replace('.', ',') + ' km</b></div><div><span>Ücret</span><b>' + tl(t.fare) + '</b></div><div><span>Ödeme</span><b>Cüzdan</b></div></div>' +
        '<div class="tt-stars">' + [1, 2, 3, 4, 5].map(function (i) { return '<button data-a="rate" data-v="' + i + '" class="' + ((t.rate || 0) >= i ? 'on' : '') + '">' + ic('star') + '</button>'; }).join('') + '</div>' +
        '<button class="tt-big y" data-a="taxiReset">Tamam</button></div>';
    }
    return '<div class="tt-page light">' + header('Taksi', { back: 'Ana ekran' }) + '<div class="tt-taxi">' + body + '</div></div>';
  };

  // ---- sağlık ----
  S.med = function () {
    var inc = this.live.incident;
    var TR = { yesil: ['Yeşil', '#30b04f'], sari: ['Sarı', '#e4b100'], kirmizi: ['Kırmızı', '#e5322d'], siyah: ['Siyah', '#1c1c1e'] };
    var OUT = { saglam: 'Sağlığı yerinde', yerinde: 'Olay yerinde tedavi edildi', hastane: 'Hastaneye kaldırıldı', ambulansta: 'Ambulansta tedavi edildi', vefat: 'Hayatını kaybetti', kurtarildi: 'Hayata döndürüldü, hastanede' };
    var amb = (this.live.units || []).filter(function (u) { return u.kind === 'ambulance'; })[0];
    var body;
    if (inc && inc.patients && !inc.patients.length) {
      body = '<div class="tt-empty">' + ic('med') + '<br>Olay ' + inc.id + ': müdahale gereken kimse yok.<br><small>' + (inc.solo ? 'Tek taraflı kaza.' : 'Çarptığın araç park halindeydi, içinde kimse yoktu.') + '</small></div>';
    } else if (!inc || !inc.patients) {
      body = '<div class="tt-empty">' + ic('med') + '<br>Aktif sağlık kaydı yok.<br><small>Bir araca çarparsan, ambulans karşı sürücüye bakar; durumu burada görünür.</small></div>';
    } else {
      body = '<div class="tt-medh"><b>Olay ' + inc.id + '</b><span>' + (amb ? (amb.status === 'enroute' ? 'Ambulans yolda · ' + dist(amb.dist) + ' · ' + eta(amb.eta) : amb.status === 'onscene' ? 'Sağlık ekibi olay yerinde' : 'Ambulans ayrıldı') : (inc.dispatched ? 'Ekip bekleniyor' : '112 aranmadı')) + '</span></div>' +
        inc.patients.map(function (p) {
          var tri = TR[p.triage] || ['—', '#8e8e93'];
          var st = p.state === 'bitti' ? (OUT[p.outcome] || '') : p.state === 'mudahale' ? 'Müdahale ediliyor' : p.state === 'kontrol' ? 'Hayati belirtiler kontrol ediliyor…' : (amb && amb.status === 'onscene' ? 'Sırada' : 'Ekip bekleniyor');
          if (p.outcome === 'vefat') st = 'Ölüm tespit edildi · cenaze aracı çağrıldı';
          return '<div class="tt-pat ' + (p.outcome === 'vefat' ? 'dead' : '') + '"><div class="tt-path"><span class="tt-av" style="background:#e9e9ee;color:#333">' + ic('user') + '</span><span class="tt-rt"><b>' + esc(p.name) + '</b><small>' + esc(st) + '</small></span>' +
            '<span class="tt-tri" style="background:' + tri[1] + '">' + tri[0] + '</span></div>' +
            (p.state === 'kontrol' ? '<div class="tt-chk"><span class="tt-ecg"></span><span>Nabız · solunum · bilinç</span></div>' : '') +
            (p.state === 'mudahale' ? '<i class="tt-prog big"><i style="width:' + p.p + '%"></i></i><div class="tt-vit"><span>Nabız <b>' + Math.round(rnd(68, 128)) + '</b></span><span>SpO₂ <b>%' + Math.round(rnd(88, 99)) + '</b></span><span>Tansiyon <b>' + Math.round(rnd(95, 140)) + '/' + Math.round(rnd(55, 90)) + '</b></span></div>' : '') +
            '</div>';
        }).join('') + '<p class="tt-note">Ambulans önce çarptığın kişinin hayati belirtilerine bakar. Ölüm tespit edilirse cenaze aracı otomatik gelir. Triyaj: yeşil hafif · sarı orta · kırmızı ağır · siyah vefat.</p>';
    }
    return '<div class="tt-page light">' + header('Sağlık', { back: 'Ana ekran' }) + '<div class="tt-scroll tt-med">' + body + '</div></div>';
  };

  // ---- cüzdan ----
  S.wallet = function () {
    var tx = this.db.tx;
    var KI = { police: ['shield', '#2f6fe4'], taxi: ['taxi', '#f2b705'], other: ['wallet', '#8e8e93'] };
    return '<div class="tt-page light">' + header('Cüzdan', { back: 'Ana ekran' }) + '<div class="tt-scroll">' +
      '<div class="tt-ccard"><div class="tt-cchip"></div><span class="tt-ccn">TEPE BANK · DEBİT</span><b>' + tl2(this.db.wallet) + '</b><span class="tt-ccx">•••• 4821</span></div>' +
      '<div class="tt-sec">SON İŞLEMLER</div><div class="tt-list">' +
      (tx.length ? tx.map(function (x) {
        var k = KI[x.k] || KI.other;
        return '<div class="tt-row"><span class="tt-av" style="background:' + k[1] + '">' + ic(k[0]) + '</span><span class="tt-rt"><b>' + esc(x.l) + '</b><small>' + ago(x.ts) + '</small></span><em class="' + (x.a > 0 ? 'grn' : '') + '">' + (x.a > 0 ? '+' : '−') + tl(Math.abs(x.a)) + '</em></div>';
      }).join('') : '<div class="tt-empty">İşlem yok</div>') + '</div></div></div>';
  };

  // ---- ayarlar ----
  S.settings = function () {
    var s = this.db.settings;
    function sw(id, on, label, sub) { return '<button class="tt-row set" data-a="setTgl" data-v="' + id + '"><span class="tt-rt"><b>' + label + '</b><small>' + sub + '</small></span><span class="tt-sw ' + (on ? 'on' : '') + '"><i></i></span></button>'; }
    return '<div class="tt-page light">' + header('Ayarlar', { back: 'Ana ekran' }) + '<div class="tt-scroll">' +
      '<div class="tt-sec">ACİL DURUM</div><div class="tt-list grp">' +
      sw('crash', s.crash, 'Kaza Algılama', 'Ciddi kazada 112’yi otomatik arar') +
      '<div class="tt-row set"><span class="tt-rt"><b>Geri sayım</b><small>Otomatik aramadan önce</small></span><span class="tt-seg">' + [5, 10, 20].map(function (n) { return '<button data-a="setDelay" data-v="' + n + '" class="' + (s.delay === n ? 'on' : '') + '">' + n + ' sn</button>'; }).join('') + '</span></div>' +
      sw('autoOpen', s.autoOpen, 'Telefonu otomatik çıkar', 'Ekip gelince ya da kazada ekrana gelir') +
      '</div><div class="tt-sec">CÜZDAN</div><div class="tt-list grp"><button class="tt-row set" data-a="resetWallet"><span class="tt-rt"><b class="blue">Bakiyeyi 15.000 ₺ yap</b><small>İşlem geçmişi silinir</small></span></button>' +
      '<button class="tt-row set" data-a="clearMsgs"><span class="tt-rt"><b class="red">Mesajları ve aramaları sil</b></span></button></div>' +
      '<div class="tt-sec">HAKKINDA</div><div class="tt-list grp"><div class="tt-row set"><span class="tt-rt"><b>Tepe Telefon</b><small>Sürüm 1.0 · Tuş ataması: Ayarlar › Kontroller › “Tepe Telefon”</small></span></div></div>' +
      '</div></div>';
  };

  // ---- acil sos ----
  S.sos = function () {
    return '<div class="tt-page dark sos">' + header('Acil SOS', { back: 'Ana ekran' }) +
      '<div class="tt-sosb"><button data-a="callNum" data-v="112" class="b112"><b>112</b><span>Acil Çağrı</span></button>' +
      '<div class="tt-sos2 three"><button data-a="quick" data-v="ambulance">' + ic('amb') + '<span>Ambulans</span></button><button data-a="quick" data-v="police">' + ic('shield') + '<span>Polis</span></button><button data-a="quick" data-v="hearse">' + ic('hearse') + '<span>Cenaze aracı</span></button></div>' +
      '<div class="tt-sos2"><button data-a="callNum" data-v="155">' + ic('shield') + '<span>155 Polis</span></button><button data-a="callNum" data-v="188">' + ic('flower') + '<span>188 Cenaze</span></button></div>' +
      '<p class="tt-note">Gereksiz yere acil hatları meşgul etmek idari para cezası gerektirir.</p></div></div>';
  };

  // ---- polis ifadesi ----
  S.statement = function () {
    var s = this.stmt; if (!s) return S.home.call(this);
    var lines = s.lines.map(function (l) {
      if (l.card) return l.card;
      return '<div class="tt-bb ' + (l.me ? 'me' : l.other ? 'oth' : '') + '">' + (l.who ? '<i>' + esc(l.who) + '</i>' : '') + esc(l.text) + '</div>';
    }).join('');
    if (s.typing) lines += '<div class="tt-bb typing"><i></i><i></i><i></i></div>';
    var opts = (s.opts || []).map(function (o, i) { return '<button class="tt-chip" data-a="stmtOpt" data-v="' + i + '">' + esc(o.l) + '</button>'; }).join('');
    return '<div class="tt-page light">' +
      '<div class="tt-head pol"><span class="tt-av" style="background:#2f6fe4">' + ic('shield') + '</span><div><h1>' + esc(s.officer) + '</h1><small>Trafik Denetleme · İfade</small></div><span></span></div>' +
      '<div class="tt-scroll tt-bubbles">' + lines + '</div><div class="tt-sopts">' + opts + '</div></div>';
  };

  // =====================================================================
  // eylemler
  PR.actions = {
    go: function (v) { if (v === 'messages') this.thread = null; this.go(v); },
    back: function () { this.back(); },
    bannerTap: function (v) {
      this.$banner.classList.remove('show'); this.setPocket(false);
      var map = { police: 'track', ambulance: 'track', taxi: 'taxi', hearse: 'track', med: 'med', msg: 'messages' };
      if (this.stmt) return this.go('statement');
      if (map[v]) this.go(map[v]);
    },
    dialTab: function (v) { this.dialTab = v; this.render(); },
    key: function (v) { if (this.dial.length < 14) this.dial += v; this.render(); },
    keyDel: function () { this.dial = this.dial.slice(0, -1); this.render(); },
    dialCall: function () { if (this.dial) this.startCall(this.dial); },
    callNum: function (v) { this.startCall(v); },
    quick: function (v) {
      if (v === 'hearse') return this.startCall('188', 'cenaze');
      this.startCall('112', v === 'police' ? 'polis' : 'saglik');
    },
    callOpt: function (v) { var o = this.call && this.call.opts && this.call.opts[+v]; if (o) { this.call.opts = []; this.call.lines.push({ me: true, text: o.l }); this.render(); o.f.call(this); } },
    tgl: function (v) { if (!this.call) return; if (v === 'mute') this.call.mute = !this.call.mute; if (v === 'spk') this.call.spk = !this.call.spk; this.render(); },
    hang: function () { this.endCall(); },
    openThread: function (v) { this.thread = v; var t = this.db.threads[v]; if (t) t.unread = 0; this.save(); this.go('thread'); var sc = this.$view.querySelector('.tt-scroll'); if (sc) sc.scrollTop = 1e6; },
    cancelUnit: function (v) { this.send('cancel_unit', { id: +v }); this.banner('Ekip Takip', 'Çağrı iptal edildi.', 'gear'); },
    taxiCall: function () { this.taxi = { phase: 'calling' }; this.render(); this.send('taxi_call'); },
    taxiCancel: function () { this.send('taxi_cancel'); this.taxi = { phase: 'idle' }; this.render(); },
    taxiBoard: function () { this.send('taxi_board'); },
    taxiDest: function (v) { this.send('taxi_dest', { km: +v }); this.taxi.phase = 'ride'; this.render(); },
    taxiExit: function () { this.send('taxi_exit'); },
    taxiReset: function () { this.taxi = { phase: 'idle' }; this.go('home', true); },
    rate: function (v) { this.taxi.rate = +v; this.render(); },
    setTgl: function (v) { this.db.settings[v] = !this.db.settings[v]; this.save(); this.pushSettings(); this.render(); },
    setDelay: function (v) { this.db.settings.delay = +v; this.save(); this.pushSettings(); this.render(); },
    resetWallet: function () { this.db.wallet = 15000; this.db.tx = []; this.save(); this.render(); },
    clearMsgs: function () { this.db.threads = {}; this.db.recents = []; this.save(); this.render(); },
    sosNow: function () { this.send('sos'); },
    sosCancel: function () { this.send('sos_cancel'); },
    stmtOpt: function (v) { var s = this.stmt, o = s && s.opts && s.opts[+v]; if (o) { s.opts = []; if (!o.silent) s.lines.push({ me: true, text: o.l }); this.render(); this.scrollEnd(); o.f.call(this); } }
  };

  PR.scrollEnd = function () { var sc = this.$view.querySelector('.tt-scroll'); if (sc) sc.scrollTop = 1e6; };

  // =====================================================================
  // arama senaryoları
  PR.startCall = function (num, preset) {
    if (this.call) return;
    var c = contactByNum(num) || { num: num, name: num, color: '#8e8e93', icon: 'user' };
    this.call = { c: c, phase: 'dialing', lines: [], opts: [], t0: Date.now() };
    this.dial = '';
    this.db.recents.unshift({ num: num, out: true, ts: Date.now() });
    if (this.db.recents.length > 30) this.db.recents.pop();
    this.save();
    this.go('call');
    var self = this;
    this.later(function () {
      if (!self.call) return;
      var script = SCRIPTS[num];
      if (!script) { self.call.phase = 'talk'; self.call.t0 = Date.now(); self.say('Aradığınız numara kullanılmamaktadır. Lütfen numarayı kontrol ederek tekrar deneyiniz.', null, 300); self.later(self.endCall, 4200); return; }
      self.call.phase = 'talk'; self.call.t0 = Date.now(); self.render();
      script.call(self, preset);
    }, num === '112' || num === '155' ? 1800 : 2600);
  };

  // operatör konuşur, sonra seçenekler gelir
  PR.say = function (text, opts, delay) {
    var c = this.call; if (!c) return;
    c.typing = true; this.render(); this.scrollCall();
    var self = this;
    this.later(function () {
      if (self.call !== c) return;
      c.typing = false; c.lines.push({ text: text }); c.opts = opts || []; self.render(); self.scrollCall();
    }, delay != null ? delay : Math.min(2600, 700 + text.length * 22));
  };
  PR.scrollCall = function () { var sc = this.$view.querySelector('.tt-ctr'); if (sc) sc.scrollTop = 1e6; };

  PR.endCall = function () {
    if (!this.call) return;
    var dur = (Date.now() - this.call.t0) / 1000;
    if (this.db.recents[0]) this.db.recents[0].dur = this.call.phase === 'talk' ? dur : 0;
    this.save();
    this.call.phase = 'ended'; this.call.opts = []; this.render();
    var self = this;
    this.later(function () { self.call = null; if (self.screen === 'call') { self.screen = self.stack.pop() || 'home'; if (self.screen === 'call') self.screen = 'home'; } self.render(); }, 900);
  };
  PR.hangSoon = function (ms) { var self = this, c = this.call; this.later(function () { if (self.call === c) self.endCall(); }, ms || 3000); };

  PR.locText = function () { return (this.live.level || 'bilinmeyen konum') + ', X ' + (this.live.x || 0) + ' Y ' + (this.live.y || 0); };

  var SCRIPTS = {};
  SCRIPTS['112'] = function (preset) {
    var self = this;
    function done(services, reason, text) {
      self.say(text, null);
      self.later(function () { self.send('dispatch', { services: services, reason: reason }); }, 900);
      self.hangSoon(5200);
    }
    var injured = function () {
      self.say('Yaralı var mı? Bilinci açık mı?', [
        { l: 'Evet, yaralı var', f: function () { done(['ambulance', 'police'], 'kaza', 'Konumunuzu aldım: ' + self.locText() + '. Ambulans ve trafik ekibi yönlendirildi. Yaralıyı hareket ettirmeyin, yoldan güvenli bir yere çekilin.'); } },
        { l: 'Emin değilim', f: function () { done(['ambulance', 'police'], 'kaza', 'Tedbir amaçlı ambulans ve trafik ekibi gönderiyorum. Dörtlülerinizi yakın, araçtan güvenli şekilde inin.'); } },
        { l: 'Hayır, sadece maddi hasar', f: function () { done(['police'], 'kaza', 'Anlaşıldı. Trafik ekibi tutanak için yönlendirildi. Araçları mümkünse yol kenarına çekin.'); } }
      ]);
    };
    if (preset === 'saglik') {
      self.call.lines.push({ me: true, text: 'Ambulansa ihtiyacım var.' });
      return done(['ambulance'], 'saglik', '112 Acil, anlaşıldı. Konumunuzu aldım, en yakın ambulans yola çıktı. Hattı kapatabilirsiniz, ekip sizi arayabilir.');
    }
    if (preset === 'polis') {
      self.call.lines.push({ me: true, text: 'Polise ihtiyacım var.' });
      return done(['police'], 'polis', '112 Acil, anlaşıldı. Bölgedeki polis ekibine aktarıyorum. Ekip yönlendirildi.');
    }
    this.say('112 Acil Çağrı Merkezi, buyurun. Acil durumunuz nedir?', [
      { l: 'Trafik kazası oldu', f: injured },
      { l: 'Biri yaralandı / hasta', f: function () {
        self.say('Nefes alıyor mu, bilinci yerinde mi?', [
          { l: 'Evet ama yaralı', f: function () { done(['ambulance'], 'saglik', 'Ambulans yola çıktı. Kanama varsa temiz bir bezle bastırın, hastayı hareket ettirmeyin.'); } },
          { l: 'Bilinci kapalı', f: function () { done(['ambulance'], 'saglik', 'Ambulans öncelikli yönlendirildi. Hava yolunun açık olduğundan emin olun, ekip 112 talimatlarıyla sizi arayacak.'); } }
        ]);
      } },
      { l: 'Polise ihtiyacım var', f: function () { done(['police'], 'polis', 'Sizi polis birimine bağladım. Ekip konumunuza yönlendirildi.'); } },
      { l: 'Yanlışlıkla aradım', f: function () { self.say('Anlaşıldı. Lütfen acil hatları gereksiz meşgul etmeyin. İyi günler.'); self.hangSoon(3500); } }
    ]);
  };
  SCRIPTS['155'] = function () {
    var self = this;
    function done(reason, text) { self.say(text); self.later(function () { self.send('dispatch', { services: ['police'], reason: reason }); }, 900); self.hangSoon(5000); }
    this.say('155 Polis İmdat, dinliyorum.', [
      { l: 'Kaza oldu, tutanak lazım', f: function () { done('kaza', 'Yaralı yoksa araçları güvenli bir yere çekin. Trafik ekibi ' + self.locText() + ' konumuna yönlendirildi.'); } },
      { l: 'Şüpheli bir durum var', f: function () { done('polis', 'Bilgileri aldım, bölgedeki ekip size geliyor. Kendinizi tehlikeye atmayın.'); } },
      { l: 'Yanlışlıkla aradım', f: function () { self.say('Tamam, iyi günler.'); self.hangSoon(2500); } }
    ]);
  };
  SCRIPTS['188'] = function (preset) {
    var self = this;
    var dead = this.live.incident && this.live.incident.dead;
    var hearse = (this.live.units || []).some(function (u) { return u.kind === 'hearse' && u.status !== 'leaving'; });
    function send(text) {
      if (hearse) { self.say('Başınız sağ olsun. Cenaze aracımız zaten yönlendirildi, Ekip Takip’ten izleyebilirsiniz.'); return self.hangSoon(4500); }
      self.say(text);
      self.later(function () { self.send('dispatch', { services: ['hearse'], reason: 'cenaze' }); }, 900);
      self.hangSoon(5000);
    }
    if (preset === 'cenaze') {
      self.call.lines.push({ me: true, text: 'Bulunduğum yere cenaze aracı lazım.' });
      return send('Başınız sağ olsun. Konumunuzu aldım: ' + self.locText() + '. Cenaze aracı yola çıktı.');
    }
    this.say('Belediye Cenaze Hizmetleri, başınız sağ olsun. Nasıl yardımcı olabilirim?', [
      { l: 'Cenaze aracı gönderin', f: function () { send('Başınız sağ olsun. Konumunuzu aldım, cenaze aracı yola çıktı.'); } },
      { l: 'Kazada vefat eden biri var', f: function () {
        send(dead ? 'Başınız sağ olsun. Doktorun ölüm tespiti sisteme düştü, cenaze aracı yönlendirildi.' : 'Başınız sağ olsun. Cenaze aracı yönlendirildi. Ölüm tespiti için 112’nin de olay yerine gelmesi gerekiyor.');
      } },
      { l: 'Bilgi almak istiyorum', f: function () { self.say('Cenaze nakil hizmetimiz 7/24 ücretsizdir. Kazalarda ambulans ölüm tespit ederse cenaze aracı otomatik gönderilir.'); self.hangSoon(5000); } }
    ]);
  };
  SCRIPTS['4448294'] = function () {
    var self = this;
    var t = (this.live.units || []).some(function (u) { return u.kind === 'taxi' && u.status !== 'leaving'; });
    if (t) { this.say('Abi taksin zaten yolda, uygulamadan takip edebilirsin.'); return this.hangSoon(3500); }
    this.say('Durak, buyrun abi.', [
      { l: 'Bulunduğum yere taksi', f: function () {
        self.say('Tamamdır abi, konum geldi. En yakın arabayı yolluyorum, plaka mesajla gelir.');
        self.later(function () { self.taxi = { phase: 'calling' }; self.send('taxi_call'); }, 900);
        self.hangSoon(4500);
      } },
      { l: 'Ücret ne kadar?', f: function () { self.say('Açılış 75, kilometresi 45 lira abi. Bekleme ücreti 50.', [{ l: 'Tamam, bir taksi gönder', f: function () { self.say('Hemen abi.'); self.later(function () { self.taxi = { phase: 'calling' }; self.send('taxi_call'); }, 700); self.hangSoon(3000); } }, { l: 'Sağ ol, sonra ararım', f: function () { self.hangSoon(800); } }]); } }
    ]);
  };
  SCRIPTS['05321234567'] = function () {
    var self = this;
    var recent = this.db.lastCrash && Date.now() - this.db.lastCrash < 600000;
    if (recent) {
      this.say('Alo! Oğlum iyi misin? Telefonundan kaza bildirimi geldi, ödüm koptu!', [
        { l: 'İyiyim anne, merak etme', f: function () { self.say('Allah’a şükür… Bir daha yavaş sür, söz ver bana. Akşam yemeğe gel.'); self.hangSoon(4500); } },
        { l: 'Biraz hırpalandım', f: function () { self.say('Hemen hastaneye git! Ambulans geldi mi? Ben babanı arıyorum!'); self.hangSoon(4000); } }
      ]);
    } else {
      this.say(pick(['Alo canım, neredesin? Yemek soğuyor.', 'Oğlum, araba kullanırken telefonla konuşma demedim mi sana?', 'Alo, ekmek alır mısın gelirken?']), [
        { l: 'Birazdan gelirim', f: function () { self.say('Tamam, dikkatli gel. Kemerini tak.'); self.hangSoon(3200); } },
        { l: 'Sonra ararım anne', f: function () { self.say('Peki peki, kapat o zaman. Öptüm.'); self.hangSoon(2600); } }
      ]);
    }
  };

  // =====================================================================
  // polis ifadesi ve kusur tespiti
  PR.stmtSay = function (text, opts, extra) {
    var s = this.stmt; if (!s) return;
    s.typing = true; this.render(); this.scrollEnd();
    var self = this;
    this.later(function () {
      if (self.stmt !== s) return;
      s.typing = false;
      var l = { text: text }; if (extra) for (var k in extra) l[k] = extra[k];
      s.lines.push(l); s.opts = opts || []; self.render(); self.scrollEnd();
    }, extra && extra.delay != null ? extra.delay : Math.min(2600, 700 + text.length * 20));
  };

  PR.startPoliceAsk = function (d) {
    var self = this;
    this.stmt = { officer: 'Polis Memuru ' + d.officer, lines: [], opts: [], ask: true, unit: d.unit };
    this.raise(); this.vibrate(); this.go('statement');
    this.stmtSay('İyi günler, polis. İhbar sizden mi geldi? Ne oldu?', [
      { l: 'Kaza oldu, tutanak tutun', f: function () { self.stmt = null; self.send('police_reason', { reason: 'kaza', unit: d.unit }); } },
      { l: 'Şüpheli bir araç vardı, gitti', f: function () {
        self.stmtSay('Plakayı ya da yönünü gördünüz mü? Tamam, çevrede kontrol yapacağız. Bir şey olursa yine 155’i arayın.', [{ l: 'Teşekkürler memur bey', f: function () { self.finishAsk(d, null); } }]);
      } },
      { l: 'Yanlışlıkla aradım', f: function () {
        var fine = Math.random() < 0.5;
        self.stmtSay(fine ? 'Acil hatları asılsız ihbarla meşgul etmek kabahattir. Size idari para cezası yazıyorum: 1.490 ₺.' : 'Acil hatlar gerçekten ihtiyacı olanlar için. Bu seferlik sözlü uyarıyla geçiyorum.', [{ l: 'Özür dilerim', f: function () { self.finishAsk(d, fine ? 1490 : 0); } }]);
      } }
    ]);
  };
  PR.finishAsk = function (d, fine) {
    if (fine) { this.pay(fine, 'İdari para cezası · asılsız ihbar', 'police'); this.addMsg('Emniyet Trafik', 'Adınıza 1.490 ₺ idari para cezası düzenlendi (asılsız ihbar). Ödeme Cüzdan’dan alındı.', false); }
    this.send('police_reason', { reason: 'bitti', unit: d.unit });
    this.stmt = null; this.go('home', true);
  };

  var SPEEDS = [[0, 30, '0–30 km/s'], [30, 60, '30–60 km/s'], [60, 90, '60–90 km/s'], [90, 999, '90 km/s üstü']];
  function bucket(v) { for (var i = 0; i < SPEEDS.length; i++) if (v < SPEEDS[i][1]) return i; return 3; }

  PR.startStatement = function (ev) {
    var self = this;
    var s = this.stmt = { officer: ev.officer, lines: [], opts: [], ev: ev, adj: 0, notes: [], lie: false, alcohol: false };
    this.raise(); this.vibrate();
    if (!this.call) this.go('statement');
    var other = !ev.solo;
    var otherTalks = other && ev.occupied && (ev.otherSev === 'none' || ev.otherSev === 'hafif' || ev.otherSev === 'orta');

    function q1() {
      self.stmtSay('İyi günler, trafik polisi. Kimliğinizi ve ehliyetinizi alabilir miyim?', [
        { l: 'Buyurun memur bey', f: function () { self.stmtSay('Teşekkürler, GBT sorgusu temiz. Birkaç soru soracağım, olduğu gibi anlatın.', null, { delay: 1600 }); self.later(q2, 1900); } }
      ]);
    }
    function q2() {
      self.stmtSay('Çarpışma anında hızınız yaklaşık kaçtı?', SPEEDS.map(function (b, i) {
        return { l: b[2], f: function () {
          var truth = ev.manual ? i : bucket(ev.speed), diff = truth - i;
          if (diff >= 2 && Math.random() < 0.8) { s.lie = true; s.adj += 0.15; }
          else if (diff === 1 && Math.random() < 0.35) { s.lie = true; s.adj += 0.08; }
          s.saidSpeed = i; q3();
        } };
      }));
    }
    function q3() {
      var o = other ? [
        { l: 'Karşı taraf bana çarptı', k: 'them' }, { l: 'Ben çarptım, fren yetmedi', k: 'me' },
        { l: 'Önüme aniden kırdı', k: 'cut' }, { l: 'Bana yol vermedi', k: 'yield' }
      ] : [
        { l: 'Kontrolü kaybettim', k: 'loss' }, { l: 'Yol kaygandı', k: 'slip' },
        { l: 'Önüme bir şey çıktı', k: 'obj' }, { l: 'Dikkatim dağıldı', k: 'dist' }
      ];
      self.stmtSay('Kaza nasıl gerçekleşti, anlatır mısınız?', o.map(function (x) {
        return { l: x.l, f: function () {
          s.how = x.k;
          var sh = ev.share;
          if (x.k === 'me') s.adj -= 0.05;
          if ((x.k === 'them' || x.k === 'cut' || x.k === 'yield') && sh > 0.62 && Math.random() < 0.55) { s.lie = true; s.adj += 0.1; }
          if (x.k === 'dist') s.notes.push('Sürücü dikkat dağınıklığını kabul etti');
          q4();
        } };
      }));
    }
    function q4() {
      self.stmtSay('Alkol aldınız mı? Alkolmetreye üflemeniz gerekiyor.', [
        { l: 'Hayır, üflerim', f: function () { s.alcohol = false; self.stmtSay('Sonuç: 0,00 promil. Teşekkürler.', null, { delay: 2200 }); self.later(q5, 2600); } },
        { l: 'Biraz aldım', f: function () { s.alcohol = true; s.adj += 0.1; self.stmtSay('Sonuç: 0,74 promil. Yasal sınırın üzerinde. Bunu tutanağa işliyorum.', null, { delay: 2200 }); self.later(q5, 2600); } }
      ]);
    }
    function q5() {
      if (other && !ev.occupied) {
        self.stmtSay('Çarptığınız araç park halindeymiş, içinde kimse yok. Araç sahibine plakadan ulaşılacak.', null, { delay: 1800 });
        return self.later(inspect, 2200);
      }
      if (other && !otherTalks) {
        self.stmtSay('Diğer sürücü şu an ifade verebilecek durumda değil. Sağlık ekibinin raporunu bekleyeceğiz.', null, { delay: 1800 });
        return self.later(inspect, 2200);
      }
      if (!other) return inspect();
      self.stmtSay('Diğer sürücünün de ifadesini alıyorum, bir dakika…', null, { delay: 1400 });
      self.later(function () {
        var theirFault = ev.share < 0.45;
        var lies = theirFault && Math.random() < 0.5;
        var txt;
        if (!theirFault || lies) txt = pick(['Ben kendi şeridimdeydim, o hızla gelip bana vurdu.', 'Hiç fren yapmadı, birden arkamdaydı.', 'Bana yol vermedi, kendisi kırdı direksiyonu.']);
        else txt = pick(['Sanırım geç gördüm, frene bastım ama yetmedi.', 'Telefonuma bakıyordum, bir an dikkatim dağıldı… Özür dilerim.', 'Sarı yanıyordu, geçerim sandım.']);
        if (lies) s.otherLie = true;
        s.lines.push({ who: 'Karşı sürücü', text: '“' + txt + '”', other: true }); self.render(); self.scrollEnd();
        self.later(inspect, 1800);
      }, 2600);
    }
    function inspect() {
      self.stmtSay('Araçlardaki hasar noktalarını, fren izlerini ve kameraları inceliyorum…', null, { delay: 1500 });
      self.later(function () {
        var witness = !ev.solo && Math.random() < 0.4;
        s.witness = witness;
        var f = ev.solo ? 1 : (ev.share + s.adj + (Math.random() - 0.5) * 0.16);
        if (s.otherLie && Math.random() < 0.6) f -= 0.08;
        if (witness) f = f * 0.5 + ev.share * 0.5;
        f = Math.max(0, Math.min(1, f));
        s.fault = ev.solo ? 100 : Math.round(f * 4) * 25;
        var t = [];
        if (!ev.manual) t.push('Fren izleri çarpışmadan önce yaklaşık ' + Math.max(0, Math.round(ev.speed / 5) * 5) + ' km/s hız gösteriyor.');
        if (witness) t.push('Bir görgü tanığı da ifade verdi.');
        if (s.lie) t.push('Hız beyanınız hasarla uyuşmuyor, bunu not ediyorum.');
        if (s.otherLie && s.fault < 50) t.push('Karşı tarafın anlattıkları kamera kaydıyla örtüşmüyor.');
        self.stmtSay(t.join(' ') || 'İnceleme tamam.', null, { delay: 2400 });
        self.later(verdict, 2900);
      }, 2400);
    }
    function verdict() {
      var fines = [];
      if (s.fault >= 50 && !ev.solo) fines.push(['Kusurlu olarak trafik kazasına sebep olmak', 2167]);
      if (!ev.manual && ev.speed >= 90) fines.push(['Hız sınırını %30’dan fazla aşmak', 9267]);
      else if (!ev.manual && ev.speed >= 70) fines.push(['Hız sınırını aşmak', 4512]);
      if (s.alcohol) fines.push(['Alkollü araç kullanmak (0,74 promil) · ehliyete 6 ay el konuldu', 25000]);
      if (s.how === 'dist') fines.push(['Sürüş sırasında dikkat dağıtıcı davranış', 2000]);
      s.fines = fines;
      var total = fines.reduce(function (a, b) { return a + b[1]; }, 0);
      s.total = total;
      var no = '2026/' + (ev.incidentId || Math.floor(rnd(10000, 99999)));
      var card = '<div class="tt-tut"><div class="tt-tuth"><b>KAZA TESPİT TUTANAĞI</b><span>No ' + no + ' · ' + esc(ev.location || '') + '</span></div>' +
        (ev.solo ? '<div class="tt-tutr"><span>Kaza türü</span><b>Tek taraflı</b></div><div class="tt-tutr"><span>A · Sen</span><b>%100</b></div>'
          : '<div class="tt-fbar"><i style="width:' + s.fault + '%"></i></div><div class="tt-tutr"><span>A · Sen</span><b>%' + s.fault + ' kusurlu</b></div><div class="tt-tutr"><span>B · Karşı taraf</span><b>%' + (100 - s.fault) + ' kusurlu</b></div>') +
        (s.notes.length ? '<div class="tt-tutn">' + s.notes.map(esc).join('<br>') + '</div>' : '') +
        '<div class="tt-tuts">CEZALAR</div>' +
        (fines.length ? fines.map(function (x) { return '<div class="tt-tutr f"><span>' + esc(x[0]) + '</span><b>' + tl(x[1]) + '</b></div>'; }).join('') + '<div class="tt-tutr tot"><span>Toplam</span><b>' + tl(total) + '</b></div>'
          : '<div class="tt-tutr"><span>Para cezası yok</span><b>—</b></div>') + '</div>';
      var msg = ev.solo ? 'Tek taraflı kaza. Hasar sizin sorumluluğunuzda.' : s.fault === 0 ? 'Kusurunuz bulunmuyor. Hasarınızı karşı tarafın sigortası karşılayacak.' : s.fault <= 50 ? 'Kusur paylaşıldı. Sigortalar oranlara göre ödeme yapacak.' : 'Asli kusurlu sizsiniz. Karşı tarafın hasarı sizin sigortanızdan karşılanacak.';
      self.stmtSay('Tutanağı hazırladım. ' + msg, null, { delay: 1500 });
      self.later(function () {
        s.lines.push({ card: card }); self.render(); self.scrollEnd();
        var opts = [{ l: total ? 'İmzala ve öde (' + tl(total) + ')' : 'İmzala', f: sign }];
        if (total) opts.push({ l: 'İtiraz şerhi düş', f: object });
        s.opts = opts; self.render(); self.scrollEnd();
      }, 1700);
    }
    function sign() {
      if (s.total) { self.pay(s.total, 'Trafik cezası · tutanak ' + (ev.incidentId || ''), 'police'); }
      wrap('İmzanız alındı. ' + (s.total ? 'Ceza Cüzdan’dan tahsil edildi. ' : '') + 'İyi yolculuklar, dikkatli sürün.');
    }
    function object() {
      wrap('İtirazınızı tutanağa şerh düştüm. Sonuç sulh ceza hâkimliğinden mesajla bildirilecek. Ceza o zamana kadar askıda.');
      var total = s.total, id = ev.incidentId;
      self.later(function () {
        var ok = Math.random() < 0.35;
        if (ok) self.addMsg('e-Devlet', 'Tutanak ' + id + ' için itirazınız KABUL edildi. Para cezası iptal edildi.', false);
        else { self.pay(total, 'Trafik cezası · itiraz reddi', 'police'); self.addMsg('e-Devlet', 'Tutanak ' + id + ' için itirazınız REDDEDİLDİ. ' + tl(total) + ' cezası Cüzdan’dan tahsil edildi.', false); }
        self.banner('e-Devlet', ok ? 'İtirazın kabul edildi, ceza iptal.' : 'İtirazın reddedildi, ceza tahsil edildi.', 'msg');
      }, 90000);
    }
    function wrap(text) {
      self.stmtSay(text, [{ l: 'Kapat', silent: true, f: function () { self.stmt = null; self.go('home', true); } }]);
      self.send('verdict', { fault: s.fault, total: s.total });
      var sum = 'Tutanak ' + (ev.incidentId || '') + ': ' + (ev.solo ? 'tek taraflı kaza' : 'kusur oranınız %' + s.fault) + '. ' + (s.total ? 'Ceza: ' + tl(s.total) + '.' : 'Para cezası yok.');
      self.addMsg('Emniyet Trafik', sum, false);
    }
    q1();
  };

  // ---- kaza geri sayımı ----
  PR.renderCrash = function () {
    var c = this.crash; if (!c) return;
    var pct = Math.max(0, c.left / c.total);
    this.$over.className = 'tt-overlay crash on';
    this.$over.innerHTML = '<div class="tt-crash"><div class="tt-cri">' + ic('sos') + '</div><h2>Ciddi bir kaza algılandı</h2>' +
      '<p>Yanıt vermezsen telefon 112’yi arayacak ve konumunu paylaşacak.</p>' +
      '<div class="tt-crc"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" class="bg"/><circle cx="50" cy="50" r="44" class="fg" style="stroke-dashoffset:' + (276.5 * (1 - pct)) + '"/></svg><b>' + c.left + '</b></div>' +
      '<button class="tt-big red" data-a="sosNow">' + ic('phone') + 'Acil servisi şimdi ara</button>' +
      '<button class="tt-big ghost w" data-a="sosCancel">İptal · İyiyim</button></div>';
  };

  PR.destroy = function () {
    clearInterval(this.tick);
    this.timers.forEach(clearTimeout);
    if (this.ro) this.ro.disconnect();
  };

  window.TepeTelefonMount = function (host, api) { return new Phone(host, api); };

  // ---------- BeamNG yönergesi ----------
  if (window.angular) {
    if (!document.getElementById('tepe-telefon-css')) {
      var l = document.createElement('link');
      l.id = 'tepe-telefon-css'; l.rel = 'stylesheet'; l.href = BASE + 'app.css';
      document.head.appendChild(l);
    }
    angular.module('beamng.apps').directive('tepeTelefon', [function () {
      return {
        template: '<div class="tt-root" style="width:100%;height:100%"></div>',
        replace: true,
        restrict: 'EA',
        link: function (scope, element) {
          function luaStr(s) { return '[==[' + String(s).replace(/\]==\]/g, '') + ']==]'; }
          var api = {
            send: function (cmd, data) {
              var code = 'extensions.tepeTelefon.ui(' + luaStr(cmd) + ',' + luaStr(JSON.stringify(data || {})) + ')';
              if (window.bngApi) bngApi.engineLua(code);
            }
          };
          var ph = window.TepeTelefonMount(element[0], api);
          scope.$on('TepeTelefon', function (e, data) { ph.onLua(data); });
          scope.$on('$destroy', function () { ph.destroy(); });
          api.send('ready', {});
        }
      };
    }]);
  }
})();

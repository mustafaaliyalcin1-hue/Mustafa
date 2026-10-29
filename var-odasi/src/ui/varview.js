// VAR İNCELEME EKRANI
// Çoklu kamera (1/2/4 bölünmüş), zaman çizelgesi, kare kare ilerleme, yavaş çekim,
// dijital yakınlaştırma/kaydırma, ofsayt aracı, temas karesi, ceza sahası / kale çizgisi
// göstergeleri, telsiz akışı ve karar paneli.
import * as THREE from 'three';
import { h, clear, toast, fmtTime } from './dom.js';
import { CAMS, makeCamera, placeCamera, applyZoom } from '../replay/cameras.js';
import { computeSkeleton, makeSkel, partExtent, PARTS, CAT_NAMES } from '../sim/skeleton.js';
import { BOX_LINE_X, PITCH, POSE, FPS } from '../sim/constants.js';
import { TYPE_INFO, decisionOptions, fieldLabel, outcomeLabel, VERDICTS } from '../var/protocol.js';
import { explain, TYPE_LESSONS } from '../data/rules.js';
import { fmtMinute } from '../core/util.js';

const SPEEDS = [0.1, 0.25, 0.5, 1];
const DEFAULT_CAMS = [0, 2, 3, 5];

export class VarView {
  /**
   * opts: { training, readOnly, guide:[{text, check(vv)}], onDecision(dec), onNext(), onExit(), title }
   */
  constructor(app, session, inc, opts = {}) {
    this.app = app; this.s = session; this.inc = inc; this.opts = opts;
    this.rec = session.rec;
    this.f0 = inc.segStart; this.f1 = inc.segEnd;
    this.ph = this.f0;
    this.playing = !opts.readOnly;
    this.speed = 1;
    this.layout = app.isTouch ? 1 : 1;
    this.views = DEFAULT_CAMS.map((c) => ({ cam: c, zoom: 1, panX: 0, panY: 0, camObj: makeCamera() }));
    this.active = 0;
    this.camsUsed = new Set([0]);
    this.tool = null;
    this.off = { passFrame: null, att: null, def: null };
    this.marks = { contactFrame: null };
    this.boxOn = false; this.goalOn = false;
    this.truthOn = false;
    this.timeUsed = 0;
    this.timeLimit = opts.readOnly || opts.training ? 0 : inc.timeLimit;
    this.radioShown = 0;
    this.sel = null;
    this.decided = !!opts.readOnly;
    this.guideIdx = 0;
    this.lastTick = 999;
    this.sk = makeSkel();
    this.raycaster = new THREE.Raycaster();
    this.players = (id) => session.players(id);
    this.build();
    this.app.world.overlays.clear();
    if (opts.readOnly) this.addMsg('sys', 'ANALİZ', 'Gerçek cevaplar için sağdaki “Gerçek” araçlarını kullan.');
  }

  // ---------------------------------------------------------------- DOM
  build() {
    const inc = this.inc, info = TYPE_INFO[inc.type];
    this.timerEl = h('div.var-timer', null, this.timeLimit ? fmtTime(this.timeLimit) : '∞');
    const top = h('div.var-top', null,
      h('span.var-tag', null, this.opts.readOnly ? 'ANALİZ' : 'VAR'),
      h('span.var-title', null, `${info.icon} ${info.name} · ${fmtMinute(inc.minute, inc.half)}`),
      h('span.var-field', null, 'Saha kararı:', h('b', null, fieldLabel(inc, this.players))),
      this.timerEl,
    );
    // görüntü alanları
    this.viewsEl = h('div.var-views.l1');
    this.vpEls = this.views.map((v, i) => {
      const lab = h('div.vp-label');
      const zoom = h('div.vp-zoom');
      const el = h('div.vp', null, lab, zoom, h('div.vp-rec', null, '● REPLAY'));
      el._lab = lab; el._zoom = zoom;
      this.bindViewport(el, i);
      return el;
    });
    this.readout = h('div.vp-readout', { style: { display: 'none' } });
    this.refreshViews();
    // zaman çizelgesi
    this.tlFill = h('div.tl-fill');
    this.tlHead = h('div.tl-head');
    this.tlMarks = h('div', { style: { position: 'absolute', inset: 0, pointerEvents: 'none' } });
    this.tl = h('div.tl', null, h('div.tl-ticks'), this.tlFill, this.tlMarks, this.tlHead);
    this.bindTimeline();
    this.tlInfo = h('div.tl-info');
    this.playBtn = h('button.btn.small', { onclick: () => this.togglePlay(), title: 'Oynat / Duraklat (Boşluk)' }, '▶');
    this.speedBtns = SPEEDS.map((s) => h('button.btn.small.speed-btn', { onclick: () => this.setSpeed(s) }, s + 'x'));
    this.speedCycle = h('button.btn.small.speed-cycle', { onclick: () => this.setSpeed(SPEEDS[(SPEEDS.indexOf(this.speed) + 1) % SPEEDS.length]) }, '1x');
    this.layoutBtns = [1, 2, 4].map((n) => h('button.btn.small', { onclick: () => this.setLayout(n), title: n + ' görüntü' }, n === 1 ? '▣' : n === 2 ? '◫' : '⊞'));
    const step = (d) => () => this.stepFrame(d);
    const bottom = h('div.var-bottom', null,
      h('div.tl-row.wrap', null,
        h('button.btn.small', { onclick: () => this.seek(this.inc.appFrame), title: 'Atak başlangıç anına (APP) git' }, '⏮ APP'),
        h('button.btn.small.far', { onclick: step(-10), title: '10 kare geri (Shift+←)' }, '«'),
        h('button.btn.small', { onclick: step(-1), title: '1 kare geri (←)' }, '‹ 1'),
        this.playBtn,
        h('button.btn.small', { onclick: step(1), title: '1 kare ileri (→)' }, '1 ›'),
        h('button.btn.small.far', { onclick: step(10), title: '10 kare ileri (Shift+→)' }, '»'),
        h('span.muted.hiz', { style: { fontSize: '11px', marginLeft: '6px' } }, 'HIZ'),
        ...this.speedBtns,
        this.speedCycle,
        h('div.grow'),
        ...this.layoutBtns,
      ),
      h('div.tl-row', null, this.tl, this.tlInfo),
    );
    // yan panel
    this.camBtns = CAMS.map((c) => h('button.btn.cam-btn', { onclick: () => this.setCam(c.id) }, h('span.n', null, c.id + 1), c.short));
    this.toolSec = h('div.sec');
    this.radioEl = h('div.var-radio');
    this.decideEl = h('div.var-decide');
    const side = h('div.var-side', null,
      h('div.sec', null, h('h5', null, 'KAMERALAR (seçili görüntüye)'), h('div.cam-grid', null, ...this.camBtns)),
      this.toolSec,
      h('div.sec', { style: { padding: '6px 12px 0', borderBottom: 0 } }, h('h5', null, 'TELSİZ')),
      this.radioEl,
      this.decideEl,
    );
    this.viewsEl.appendChild(this.readout);
    this.guideEl = h('div.guide', { style: { display: 'none' }, onclick: () => this.guideEl.classList.toggle('min'), title: 'Küçült / büyüt' });
    this.el = h('div.screen.var', null, top, this.viewsEl, side, bottom, this.guideEl);
    this.renderTools();
    this.renderDecision();
    this.updateButtons();
    this.updateTimeline();
  }

  refreshViews() {
    clear(this.viewsEl);
    this.viewsEl.className = 'var-views l' + this.layout;
    for (let i = 0; i < this.layout; i++) {
      const el = this.vpEls[i];
      el.classList.toggle('active', i === this.active && this.layout > 1);
      this.viewsEl.appendChild(el);
    }
    if (this.readout) this.viewsEl.appendChild(this.readout);
    this.updateLabels();
  }
  updateLabels() {
    for (let i = 0; i < this.views.length; i++) {
      const el = this.vpEls[i], v = this.views[i];
      el._lab.innerHTML = '';
      el._lab.append(h('span.n', null, String(v.cam + 1)), CAMS[v.cam].name.toUpperCase());
      el._zoom.textContent = v.zoom > 1.01 ? `🔍 ${v.zoom.toFixed(1)}x` : '';
    }
  }

  renderTools() {
    const inc = this.inc, tools = TYPE_INFO[inc.type].tools;
    const s = this.toolSec;
    clear(s);
    s.appendChild(h('h5', null, 'ARAÇLAR'));
    if (tools.includes('offside')) {
      const on = this.tool === 'offside';
      s.appendChild(h('button.btn.small.tool-btn' + (on ? '.on' : ''), { onclick: () => { this.tool = on ? null : 'offside'; this.renderTools(); this.updateOverlays(); } }, '📐 Ofsayt aracı'));
      if (on) {
        const o = this.off;
        const st = (n, txt, done, cur) => h('div.step' + (done ? '.done' : cur ? '.cur' : ''), null, h('i', null, done ? '✓' : n), h('span', null, txt));
        const step = o.passFrame === null ? 1 : !o.att ? 2 : !o.def ? 3 : 4;
        s.appendChild(h('div.tool-box', null,
          st(1, 'Pasın çıktığı kareyi bul (topa ilk temas) ve “Pas karesi” de.', o.passFrame !== null, step === 1),
          st(2, 'Hücumcunun kol HARİÇ en ileri bölgesine tıkla.', !!o.att, step === 2),
          st(3, 'Sondan ikinci savunmacının kalesine en yakın bölgesine tıkla.', !!o.def, step === 3),
          h('div.row', { style: { marginTop: '6px' } },
            h('button.btn.small.' + (step === 1 ? 'primary' : 'ghost'), { onclick: () => this.setPassFrame() }, '⏺ Pas karesi'),
            o.passFrame !== null ? h('button.btn.small.ghost', { onclick: () => this.seek(o.passFrame) }, '↩ Kareye dön') : null,
            h('button.btn.small.ghost', { onclick: () => { this.off = { passFrame: null, att: null, def: null }; this.renderTools(); this.updateOverlays(); } }, 'Sıfırla'),
          ),
        ));
      }
    }
    if (tools.includes('contact') || tools.includes('goalline')) {
      const lbl = inc.type === 'TOP_DISARI' ? '📍 Bu kare: topun en dış noktası' : '📍 Bu kare: kritik an (temas)';
      s.appendChild(h('button.btn.small.tool-btn' + (this.marks.contactFrame !== null ? '.on' : ''), { onclick: () => this.markContact() }, lbl + (this.marks.contactFrame !== null ? `  [${this.marks.contactFrame - this.f0}]` : '')));
    }
    if (tools.includes('box')) {
      s.appendChild(h('button.btn.small.tool-btn' + (this.boxOn ? '.on' : ''), { onclick: () => { this.boxOn = !this.boxOn; this.renderTools(); this.updateOverlays(); } }, '🟨 Ceza sahası çizgisi göstergesi'));
    }
    if (tools.includes('goalline')) {
      s.appendChild(h('button.btn.small.tool-btn' + (this.goalOn ? '.on' : ''), { onclick: () => { this.goalOn = !this.goalOn; this.renderTools(); this.updateOverlays(); } }, '🟦 Kale çizgisi göstergesi'));
    }
    if (this.opts.readOnly || (this.opts.training && this.decided)) {
      s.appendChild(h('h5', { style: { marginTop: '8px' } }, 'GERÇEK CEVAP'));
      const t = inc.truth;
      s.appendChild(h('button.btn.small.tool-btn', { onclick: () => this.seek(this.f0 + t.keyFrame) }, `🎯 Doğru kritik kareye git [${t.keyFrame}]`));
      if (inc.type === 'OFSAYT') s.appendChild(h('button.btn.small.tool-btn' + (this.truthOn ? '.on' : ''), { onclick: () => { this.truthOn = !this.truthOn; this.renderTools(); this.updateOverlays(); } }, '✅ Gerçek ofsayt çizgileri'));
    }
  }

  renderDecision() {
    const d = this.decideEl;
    clear(d);
    if (this.opts.readOnly) {
      d.appendChild(h('button.btn.primary.dec-btn', { onclick: () => this.opts.onExit && this.opts.onExit() }, '← Rapora dön'));
      return;
    }
    if (this.decided) return;
    const opts = decisionOptions(this.inc, this.players);
    const btn = (o, cls = '') => h('button.btn.dec-btn' + cls + (this.sel === o ? '.sel' : ''), { onclick: () => { this.sel = o; this.app.audio.ui('click'); this.renderDecision(); } }, o.label);
    d.appendChild(h('div.dec-label', null, 'KARAR'));
    d.appendChild(btn(opts.check, '.primary'));
    if (opts.ofr.length) {
      d.appendChild(h('div.dec-label', null, '📺 SAHADA İNCELEME ÖNER (OFR)'));
      for (const o of opts.ofr) d.appendChild(btn(o, '.warn'));
    }
    if (opts.direct.length) {
      d.appendChild(h('div.dec-label', null, '✏️ DOĞRUDAN DÜZELTME (olgusal)'));
      for (const o of opts.direct) d.appendChild(btn(o, '.danger'));
    }
    if (this.sel) d.appendChild(h('button.btn.primary.dec-btn', { style: { justifyContent: 'center', fontWeight: 900, letterSpacing: '1px', marginTop: '4px' }, onclick: () => this.submit(false) }, '✔ KARARI GÖNDER'));
  }

  // ---------------------------------------------------------------- girdi
  bindViewport(el, i) {
    const ptrs = new Map();
    let start = null, moved = false, pinch0 = null;
    el.addEventListener('pointerdown', (e) => {
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* sanal imleç */ }
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 1) { start = { x: e.clientX, y: e.clientY, panX: this.views[i].panX, panY: this.views[i].panY, btn: e.button }; moved = false; }
      if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), zoom: this.views[i].zoom, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
        moved = true;
      }
    });
    el.addEventListener('pointermove', (e) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const v = this.views[i];
      const r = el.getBoundingClientRect();
      if (ptrs.size === 2 && pinch0) {
        const [a, b] = [...ptrs.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        this.zoomAt(i, pinch0.zoom * (d / pinch0.d), (pinch0.cx - r.left) / r.width, (pinch0.cy - r.top) / r.height);
        return;
      }
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (Math.hypot(dx, dy) > 6) moved = true;
      if (moved && v.zoom > 1.01) {
        const z = v.zoom;
        v.panX = start.panX - (dx / z) / (r.width - r.width / z);
        v.panY = start.panY - (dy / z) / (r.height - r.height / z);
        v.panX = Math.max(-0.5, Math.min(0.5, v.panX)); v.panY = Math.max(-0.5, Math.min(0.5, v.panY));
      }
    });
    const up = (e) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinch0 = null;
      if (ptrs.size === 0) {
        if (!moved && start && start.btn === 0) this.onTap(i, e);
        start = null;
      }
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const v = this.views[i];
      this.zoomAt(i, v.zoom * Math.pow(1.0018, -e.deltaY), (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    }, { passive: false });
    el.addEventListener('dblclick', () => { const v = this.views[i]; v.zoom = 1; v.panX = v.panY = 0; this.updateLabels(); });
  }

  /** Kontrolcü sağ çubuğu ile kaydırma (yakınlaştırılmışsa). */
  gamepadPan(dx, dy) {
    const v = this.views[this.active];
    if (v.zoom <= 1.01) return;
    v.panX = Math.max(-0.5, Math.min(0.5, v.panX + dx / v.zoom * 1.5));
    v.panY = Math.max(-0.5, Math.min(0.5, v.panY + dy / v.zoom * 1.5));
  }

  zoomAt(i, nz, cx, cy) {
    const v = this.views[i];
    nz = Math.max(1, Math.min(10, nz));
    const r = this.vpEls[i].getBoundingClientRect();
    const W = r.width, H = r.height, z = v.zoom;
    const ox = z > 1.001 ? (W - W / z) * (0.5 + v.panX) : 0;
    const oy = z > 1.001 ? (H - H / z) * (0.5 + v.panY) : 0;
    const X = ox + cx * W / z, Y = oy + cy * H / z;
    if (nz > 1.001) {
      v.panX = (X - cx * W / nz) / (W - W / nz) - 0.5;
      v.panY = (Y - cy * H / nz) / (H - H / nz) - 0.5;
    } else { v.panX = v.panY = 0; }
    v.zoom = nz;
    this.updateLabels();
  }

  onTap(i, e) {
    if (i !== this.active) { this.active = i; this.refreshViews(); this.updateButtons(); }
    if (this.tool === 'offside' && this.off.passFrame !== null && !this.decided) this.offsideClick(i, e);
  }

  pick(i, e) {
    const el = this.vpEls[i], r = el.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const cam = this.views[i].camObj;
    this.raycaster.setFromCamera(ndc, cam);
    const vis = this.app.world.pickables.filter((m) => m.parent && m.parent.visible);
    return this.raycaster.intersectObjects(vis, false);
  }

  offsideClick(i, e) {
    const hits = this.pick(i, e);
    if (!hits.length) { toast('Bir oyuncunun vücuduna tıkla.'); return; }
    let hit = hits[0];
    const { ent } = hit.object.userData;
    // önde bir kol varsa, aynı oyuncunun arkasındaki sayılabilir bölgeyi al
    if (PARTS[hit.object.userData.part].cat === 'kol') {
      const behind = hits.find((x) => x.object.userData.ent === ent && PARTS[x.object.userData.part].cat !== 'kol');
      if (behind) hit = behind;
    }
    const part = hit.object.userData.part;
    const inc = this.inc;
    const team = ent < 11 ? 0 : ent < 22 ? 1 : 2;
    const step = !this.off.att ? 'att' : !this.off.def ? 'def' : null;
    // her iki işaret de doluysa: tıklanan takıma göre değiştir
    let which = step;
    if (!which) which = team === inc.attackTeam ? 'att' : 'def';
    if (which === 'att' && team !== inc.attackTeam) { toast('Önce HÜCUM eden takımdan oyuncu işaretle.', 'warn'); return; }
    if (which === 'def' && team !== inc.defTeam) { toast('Savunma takımından bir oyuncu işaretle.', 'warn'); return; }
    if (PARTS[part].cat === 'kol') { toast('Kol ve el ofsayt değerlendirmesinde sayılmaz! Başka bölge seç.', 'bad'); this.app.audio.ui('bad'); return; }
    if (this.playheadFrame() !== this.off.passFrame) toast(`Çizgi pas karesine (${this.off.passFrame - this.f0}) göre çizildi.`);
    this.off[which] = { ent, part, point: [hit.point.x, hit.point.y, hit.point.z] };
    this.app.audio.ui('mark');
    this.renderTools();
    this.updateOverlays();
  }

  bindTimeline() {
    let down = false;
    const seekEv = (e) => {
      const r = this.tl.getBoundingClientRect();
      const t = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      this.playing = false;
      this.ph = Math.round(this.f0 + t * (this.f1 - this.f0));
      this.updateButtons();
    };
    this.tl.addEventListener('pointerdown', (e) => { down = true; try { this.tl.setPointerCapture(e.pointerId); } catch (err) { /* sanal imleç */ } seekEv(e); });
    this.tl.addEventListener('pointermove', (e) => { if (down) seekEv(e); });
    this.tl.addEventListener('pointerup', () => { down = false; });
    this.tl.addEventListener('pointercancel', () => { down = false; });
  }

  onKey(e) {
    if (e.target && e.target.tagName === 'INPUT') return;
    const k = e.key;
    if (k === 'ArrowLeft') { this.stepFrame(e.shiftKey ? -10 : -1); e.preventDefault(); }
    else if (k === 'ArrowRight') { this.stepFrame(e.shiftKey ? 10 : 1); e.preventDefault(); }
    else if (k === ' ') { this.togglePlay(); e.preventDefault(); }
    else if (k >= '1' && k <= '6') this.setCam(+k - 1);
    else if (k === 'Tab') { e.preventDefault(); this.active = (this.active + 1) % this.layout; this.refreshViews(); this.updateButtons(); }
    else if (k === '+' || k === '=') { const v = this.views[this.active]; this.zoomAt(this.active, v.zoom * 1.25, 0.5, 0.5); }
    else if (k === '-') { const v = this.views[this.active]; this.zoomAt(this.active, v.zoom / 1.25, 0.5, 0.5); }
    else if (k === 'p' || k === 'P') { if (this.tool === 'offside') this.setPassFrame(); }
    else if (k === 'k' || k === 'K') this.markContact();
    else if (k === 'a' || k === 'A') this.seek(this.inc.appFrame);
    else if (k === '[' || k === ']') {
      const v = this.views[this.active];
      this.setCam((v.cam + (k === ']' ? 1 : CAMS.length - 1)) % CAMS.length);
    } else if (k === 'm' || k === 'M') { if (this.tool === 'offside' && this.off.passFrame === null) this.setPassFrame(); else if (this.tool !== 'offside') this.markContact(); else this.setPassFrame(); }
    else if (k === 'l' || k === 'L') this.setLayout(this.layout === 1 ? 2 : this.layout === 2 ? 4 : 1);
    else if (k === '0') { const v = this.views[this.active]; v.zoom = 1; v.panX = v.panY = 0; this.updateLabels(); }
    else if (k === 'Escape') { if (this.sel && !this.decided) { this.sel = null; this.renderDecision(); } }
  }

  // ---------------------------------------------------------------- eylemler
  playheadFrame() { return Math.round(this.ph); }
  togglePlay() {
    if (!this.playing && this.ph >= this.f1 - 0.5) this.ph = this.f0;
    this.playing = !this.playing;
    this.updateButtons();
  }
  setSpeed(s) { this.speed = s; this.updateButtons(); }
  setLayout(n) { this.layout = n; if (this.active >= n) this.active = 0; for (let i = 0; i < n; i++) this.camsUsed.add(this.views[i].cam); this.refreshViews(); this.updateButtons(); }
  setCam(id) { this.views[this.active].cam = id; this.camsUsed.add(id); this.app.audio.ui('click'); this.updateLabels(); this.updateButtons(); }
  stepFrame(d) { this.playing = false; this.ph = Math.max(this.f0, Math.min(this.f1, this.playheadFrame() + d)); this.updateButtons(); this.app.audio.ui('tick'); }
  seek(f) { this.playing = false; this.ph = Math.max(this.f0, Math.min(this.f1, f)); this.updateButtons(); }
  setPassFrame() {
    this.playing = false;
    this.off.passFrame = this.playheadFrame();
    this.ph = this.off.passFrame;
    this.app.audio.ui('mark');
    this.renderTools(); this.updateOverlays(); this.updateButtons();
  }
  markContact() {
    if (this.decided && !this.opts.training) return;
    this.playing = false;
    this.marks.contactFrame = this.playheadFrame();
    this.ph = this.marks.contactFrame;
    this.app.audio.ui('mark');
    this.renderTools(); this.updateButtons();
  }

  offsideMeasure() {
    const o = this.off;
    if (o.passFrame === null || !o.att || !o.def) return null;
    const dir = this.inc.dir;
    const ext = (m) => {
      const st = this.rec.ent(o.passFrame, m.ent);
      computeSkeleton(st, this.sk);
      return partExtent(this.sk, m.part, dir, 0);
    };
    const a = ext(o.att), d = ext(o.def);
    return { a, d, margin: a - d };
  }

  updateOverlays() {
    const ov = this.app.world.overlays;
    const inc = this.inc, dir = inc.dir;
    ov.clear();
    ov.showBox(dir, this.boxOn);
    ov.showGoal(dir, this.goalOn);
    if (this.tool === 'offside' || this.truthOn) {
      const m = this.offsideMeasure();
      if (this.off.att) ov.marker(0, this.off.att.point);
      if (this.off.def) ov.marker(1, this.off.def.point);
      if (m) {
        ov.setLine('attLine', m.a * dir);
        ov.setLine('defLine', m.d * dir);
        const cm = m.margin * 100;
        const offs = cm > 0;
        this.readout.style.display = '';
        this.readout.innerHTML = '';
        this.readout.append(h('div', { class: 'muted', style: { fontSize: '11px' } }, `Pas karesi ${this.off.passFrame - this.f0} · ${PARTS[this.off.att.part].name} ↔ ${PARTS[this.off.def.part].name}`),
          h('b', { style: { color: offs ? 'var(--red)' : 'var(--green)' } }, `${offs ? '+' : '−'}${Math.abs(cm).toFixed(1)} cm`),
          h('div', null, offs ? 'Hücumcu önde → OFSAYT' : 'Hücumcu geride → ofsayt değil'));
      } else {
        this.readout.style.display = this.tool === 'offside' ? '' : 'none';
        this.readout.innerHTML = '<span class="muted">Ofsayt aracı: adımları takip et</span>';
      }
    } else this.readout.style.display = 'none';
    if (this.truthOn && inc.type === 'OFSAYT') {
      const f = inc.truth.facts;
      ov.setLine('truthAtt', f.attExt * dir);
      ov.setLine('truthDef', f.defExt * dir);
      const extra = h('div', { style: { color: 'var(--green)', fontSize: '12px', marginTop: '4px' } }, `GERÇEK: ${f.marginM > 0 ? '+' : '−'}${Math.abs(f.marginM * 100).toFixed(1)} cm (kare ${inc.truth.keyFrame}) — beyaz/yeşil çizgi`);
      this.readout.style.display = '';
      this.readout.appendChild(extra);
    }
  }

  // ---------------------------------------------------------------- karar
  submit(timeout) {
    if (this.decided) return;
    const sel = timeout ? { action: 'CHECK' } : this.sel;
    if (!sel) return;
    this.decided = true;
    this.playing = false;
    const m = this.offsideMeasure();
    const dec = {
      action: sel.action, outcome: sel.outcome, timeUsed: this.timeUsed, timeout: !!timeout,
      camsUsed: new Set(this.camsUsed),
      marks: {
        passFrame: this.off.passFrame !== null ? this.off.passFrame - this.f0 : null,
        offsideMargin: m ? m.margin : null,
        contactFrame: this.marks.contactFrame !== null ? this.marks.contactFrame - this.f0 : null,
      },
    };
    this.app.audio.ui('stamp');
    if (this.app.gamepad) this.app.gamepad.rumble(180, 0.6);
    this.renderDecision();
    if (this.opts.training) {
      const res = this.s.submitDecision(dec);
      this.showFeedback(res);
      if (this.opts.onTrainingResult) this.opts.onTrainingResult(res);
    } else if (this.opts.onDecision) this.opts.onDecision(dec);
  }

  showOverlay(kind, text, sub) {
    const ov = h('div.ofr-overlay', null,
      kind === 'ofr' ? h('div.monitor-ico') : null,
      h('div.big', null, text),
      sub ? h('div', { style: { fontSize: '15px', color: '#cfd8e3', maxWidth: '520px' } }, sub) : null,
    );
    this.viewsEl.appendChild(ov);
    return ov;
  }

  showFeedback(res) {
    const inc = this.inc, ev = res.ev, t = inc.truth;
    const V = VERDICTS[ev.verdict];
    const yourDec = res.dec.action === 'CHECK' ? `Kontrol tamamlandı (saha kararı: ${fieldLabel(inc, this.players)})` : outcomeLabel(inc, res.dec.outcome, this.players) + (res.dec.action === 'OFR' ? ' (OFR)' : ' (doğrudan)');
    const correct = t.gray ? `Gri alan — saha kararı korunmalı (${fieldLabel(inc, this.players)})` : (ev.clearError ? outcomeLabel(inc, t.outcome, this.players) : `Müdahale yok — saha kararı doğru (${fieldLabel(inc, this.players)})`);
    const body = h('div.fb-body', null,
      h('div.kv', null, h('span', null, 'Senin kararın'), h('span', null, yourDec), h('span', null, 'Doğru karar'), h('span', null, correct),
        h('span', null, 'Puan'), h('span', null, `${ev.acc} doğruluk + ${ev.prec} hassasiyet`)),
      ev.notes.length ? h('div.muted', { style: { fontSize: '13px', margin: '6px 0' } }, ev.notes.join(' · ')) : null,
      h('div.rule', null, ...explain(inc).map((p) => h('p', null, p))),
      h('p.muted', { style: { fontSize: '12.5px' } }, '💡 ' + TYPE_LESSONS[inc.type]),
    );
    const box = h('div.panel.feedback', null,
      h('div.fb-head', null, h('span.verdict.' + V.cls, null, V.text), h('div.grow'),
        h('button.btn.small', { onclick: () => { box.remove(); this.renderTools(); } }, '🔍 Görüntüyü incele'),
        this.opts.onNext ? h('button.btn.small.primary', { onclick: () => this.opts.onNext() }, this.opts.nextLabel || 'Yeni pozisyon') : null,
        this.opts.onExit ? h('button.btn.small', { onclick: () => this.opts.onExit() }, 'Menü') : null),
      body,
    );
    this.el.appendChild(box);
    this.app.audio.ui(V.cls === 'ok' ? 'good' : 'bad');
    this.renderTools();
    this.decideEl.innerHTML = '';
    this.decideEl.append(
      h('button.btn.small.dec-btn', { onclick: () => { if (!box.isConnected) this.el.appendChild(box); } }, '📋 Sonucu göster'),
      this.opts.onNext ? h('button.btn.primary.dec-btn', { onclick: () => this.opts.onNext() }, this.opts.nextLabel || 'Yeni pozisyon') : null,
    );
  }

  addMsg(cls, who, text, pressure) {
    const m = h('div.rmsg.' + cls + (pressure ? '.pressure' : ''), null, h('b', null, who), text);
    this.radioEl.appendChild(m);
    this.radioEl.scrollTop = this.radioEl.scrollHeight;
  }

  // ---------------------------------------------------------------- döngü
  updateButtons() {
    this.playBtn.textContent = this.playing ? '⏸' : '▶';
    this.speedBtns.forEach((b, i) => b.classList.toggle('on', SPEEDS[i] === this.speed));
    this.speedCycle.textContent = '⏱ ' + this.speed + 'x';
    this.layoutBtns.forEach((b, i) => b.classList.toggle('on', [1, 2, 4][i] === this.layout));
    const cur = this.views[this.active].cam;
    this.camBtns.forEach((b, i) => b.classList.toggle('on', i === cur));
    this.updateTimeline();
  }

  updateTimeline() {
    const span = this.f1 - this.f0 || 1;
    const p = (f) => ((f - this.f0) / span) * 100 + '%';
    this.tlHead.style.left = p(this.ph);
    this.tlFill.style.width = p(this.ph);
    const marks = [];
    marks.push(['app', this.inc.appFrame, 'APP']);
    if (this.off.passFrame !== null) marks.push(['pass', this.off.passFrame, 'PAS']);
    if (this.marks.contactFrame !== null) marks.push(['contact', this.marks.contactFrame, this.inc.type === 'TOP_DISARI' ? 'ÇİZGİ' : 'TEMAS']);
    if ((this.opts.readOnly || (this.opts.training && this.decided))) marks.push(['truth', this.f0 + this.inc.truth.keyFrame, 'GERÇEK']);
    const key = marks.map((m) => m.join(':')).join('|');
    if (key !== this._mk) {
      this._mk = key;
      clear(this.tlMarks);
      for (const [c, f, l] of marks) this.tlMarks.appendChild(h('div.tl-mark.' + c, { style: { left: p(f) } }, h('span', null, l)));
    }
    const f = this.playheadFrame();
    const sec = (f - this.f0) / FPS;
    this.tlInfo.textContent = `kare ${String(f - this.f0).padStart(3, '0')}/${this.f1 - this.f0} · ${sec.toFixed(2)} sn`;
  }

  update(dt) {
    if (this.playing) {
      this.ph += dt * FPS * this.speed;
      if (this.ph >= this.f1) { this.ph = this.f1; this.playing = false; this.updateButtons(); }
      this.updateTimeline();
    }
    this.timeUsed += dt;
    // telsiz
    const radio = this.inc.radio || [];
    while (!this.opts.readOnly && this.radioShown < radio.length && radio[this.radioShown].t <= this.timeUsed && (!this.decided || this.opts.training)) {
      const r = radio[this.radioShown++];
      if (r.pressure && !this.timeLimit) continue;
      this.addMsg(r.who === 'HAKEM' ? 'ref' : 'avar', r.who === 'HAKEM' ? `HAKEM (${this.s.refName})` : `AVAR (${this.s.avarName})`, r.text, r.pressure);
      this.app.audio.radio('in');
      this.app.audio.speak(r.text);
    }
    if (this.timeLimit && !this.decided) {
      const left = this.timeLimit - this.timeUsed;
      this.timerEl.textContent = fmtTime(Math.ceil(left));
      this.timerEl.classList.toggle('warn', left <= this.timeLimit * 0.35 && left > 10);
      this.timerEl.classList.toggle('crit', left <= 10);
      this.el.classList.toggle('crit', left <= 10);
      this.app.audio.setCrowd(0.25 + 0.75 * Math.min(1, this.timeUsed / this.timeLimit));
      const sLeft = Math.ceil(left);
      if (left <= 10 && sLeft !== this.lastTick) { this.lastTick = sLeft; this.app.audio.ui('tick'); }
      if (left <= 0) {
        this.addMsg('ref', `HAKEM (${this.s.refName})`, 'Süre doldu, saha kararıyla devam ediyorum!', true);
        this.submit(true);
      }
    }
    // rehber
    const g = this.opts.guide;
    if (g && this.guideIdx < g.length) {
      const step = g[this.guideIdx];
      if (step.check(this)) { this.guideIdx++; this.app.audio.ui('good'); this._gk = null; }
      const cur = g[this.guideIdx];
      if (cur && this._gk !== this.guideIdx) {
        this._gk = this.guideIdx;
        this.guideEl.style.display = '';
        this.guideEl.classList.remove('min');
        this.guideEl.innerHTML = `<div class="gstep">ADIM ${this.guideIdx + 1} / ${g.length}</div>${cur.text}`;
      } else if (!cur) this.guideEl.style.display = 'none';
    }
  }

  camInfo(f) {
    const rec = this.rec, inc = this.inc;
    const a = Math.max(this.f0, f - 8), b = Math.min(this.f1, f + 8);
    const ball = [0, 0, 0], focus = [0, 0, 0];
    let n = 0, lineX = 0;
    const st = {};
    const bb = [0, 0, 0, 0];
    const dir = inc.dir;
    let lx = 0;
    for (let k = a; k <= b; k += 2) {
      rec.ball(k, bb);
      ball[0] += bb[0]; ball[1] += bb[1]; ball[2] += bb[2];
      rec.ent(k, inc.focus, st);
      focus[0] += st.x; focus[2] += st.z;
      if (inc.line === 'offside') {
        let best = -1e9;
        for (let i = 1; i < 11; i++) {
          const e = rec.ent(k, inc.defTeam * 11 + i, st);
          if (e.pose === POSE.HIDDEN) continue;
          best = Math.max(best, e.x * dir);
        }
        lx += best * dir;
      }
      n++;
    }
    for (let i = 0; i < 3; i++) { ball[i] /= n; focus[i] /= n; }
    if (inc.line === 'offside') lineX = lx / n;
    else if (inc.line === 'box') lineX = dir * BOX_LINE_X;
    else lineX = focus[0];
    focus[1] = 0.9;
    // yakın plan için ikili (hücumcu – savunmacı) doğrultusu
    let pair = null;
    const m = inc.meta || {};
    const other = [m.defender, m.offender, m.attacker, m.lineDefender].find((x) => x !== undefined && x !== null && x !== inc.focus);
    if (other !== undefined && other !== null) {
      const a = rec.ent(f, inc.focus, {}), b = rec.ent(f, other, {});
      if (a.pose !== POSE.HIDDEN && b.pose !== POSE.HIDDEN && Math.hypot(a.x - b.x, a.z - b.z) < 12) pair = [b.x - a.x, b.z - a.z];
    }
    return { ball, focus, dir, lineX, lineKind: inc.line, ballRaw: rec.ball(f), pair };
  }

  render(g) {
    const f = this.playing ? this.ph : this.playheadFrame();
    const rec = this.rec;
    this.app.world.apply((i, out) => rec.sampleEnt(f, i, out), () => rec.sampleBall(f));
    this.app.world.setCrowd(this.app.time, 0);
    const info = this.camInfo(Math.round(f));
    for (let i = 0; i < this.layout; i++) {
      const el = this.vpEls[i];
      const r = el.getBoundingClientRect();
      const rect = { x: r.left + 2, y: r.top + 2, w: r.width - 4, h: r.height - 4 };
      const v = this.views[i];
      placeCamera(v.camObj, v.cam, info, rect.w / rect.h);
      applyZoom(v.camObj, v, rect);
      g.renderView(v.camObj, rect);
    }
  }

  destroy() { this.app.world.overlays.clear(); }
}

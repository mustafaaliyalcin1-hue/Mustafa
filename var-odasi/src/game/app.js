// Uygulama: çizici, dünya, ses, kayıt, ekran yöneticisi ve ana döngü.
import { Gfx } from '../render/gfx.js';
import { World } from '../render/world.js';
import { AudioEngine } from '../audio/audio.js';
import { Save } from '../career/save.js';
import { makeCamera } from '../replay/cameras.js';
import { makeSquad } from '../data/names.js';
import { LEAGUES, resolveKits } from '../data/teams.js';
import { RNG } from '../core/rng.js';
import { h } from '../ui/dom.js';
import { MatchSim } from '../sim/match.js';
import { DT, POSE } from '../sim/constants.js';
import { GamepadInput } from '../ui/gamepad.js';

export class App {
  constructor() {
    this.save = new Save();
    this.settings = this.save.settings;
    this.canvas = document.getElementById('gl');
    this.uiRoot = document.getElementById('ui');
    this.applyDevice();
    this.gfx = new Gfx(this.canvas, this.resolveQuality());
    const t = LEAGUES[4].teams;
    const r = new RNG(7);
    this.defaultSetup = { kits: resolveKits(t[0], t[1]), squads: [makeSquad(r), makeSquad(r)], teams: [t[0], t[1]] };
    this.world = new World(this.gfx, this.defaultSetup);
    this.audio = new AudioEngine(this.settings);
    this.menuCam = makeCamera();
    this.screen = null;
    this.time = 0;
    this.fpsEl = null;
    this.frames = 0; this.fpsT = 0;
    this.stack = [];
    const unlock = () => {
      this.audio.unlock();
      if (this.isTouch) this.tryFullscreen();
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', (e) => { this.audio.unlock(); if (this.screen && this.screen.onKey) this.screen.onKey(e); });
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    this.updateFpsEl();
    this.gamepad = new GamepadInput(this);
  }

  detectTouch() {
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    return (navigator.maxTouchPoints > 0 && coarse) || ('ontouchstart' in window && coarse);
  }
  applyDevice() {
    const c = this.settings.controls;
    this.isTouch = c === 'auto' ? this.detectTouch() : c === 'touch';
    document.body.classList.toggle('touch', this.isTouch);
  }
  resolveQuality() {
    const q = this.settings.quality;
    if (q !== 'auto') return q;
    if (this.detectTouch()) return (navigator.deviceMemory && navigator.deviceMemory >= 6) ? 'orta' : 'dusuk';
    return 'yuksek';
  }
  rebuildGraphics() {
    const q = this.resolveQuality();
    if (q === this.gfx.quality) return;
    this.gfx.applyQuality(q);
    // dünyayı yeni kalitede yeniden kur
    this.gfx.scene.remove(this.world.root);
    this.world = new World(this.gfx, this.world.setup || this.defaultSetup);
  }
  tryFullscreen() {
    if (this._fsTried) return;
    this._fsTried = true;
    const el = document.documentElement;
    const p = el.requestFullscreen ? el.requestFullscreen() : null;
    if (p && p.then) p.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* desteklenmiyor */ } }).catch(() => {});
  }
  updateFpsEl() {
    if (this.settings.showFps && !this.fpsEl) { this.fpsEl = h('div.fps', null, '-- FPS'); document.body.appendChild(this.fpsEl); }
    if (!this.settings.showFps && this.fpsEl) { this.fpsEl.remove(); this.fpsEl = null; }
  }
  persist() { this.save.persist(); }

  show(screen) {
    if (this.screen && this.screen.exit) this.screen.exit();
    this.uiRoot.innerHTML = '';
    this.screen = screen;
    if (screen.el) this.uiRoot.appendChild(screen.el);
    if (screen.enter) screen.enter();
  }

  start() {
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      this.time += dt;
      try {
        this.gamepad.update(dt);
        if (this.screen && this.screen.update) this.screen.update(dt);
        this.audio.update(dt);
        this.render(dt);
      } catch (e) {
        console.error(e);
      }
      this.frames++; this.fpsT += dt;
      if (this.fpsT >= 0.5) { if (this.fpsEl) this.fpsEl.textContent = Math.round(this.frames / this.fpsT) + ' FPS'; this.frames = 0; this.fpsT = 0; }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  render(dt) {
    const g = this.gfx;
    g.clear();
    if (this.screen && this.screen.render) { this.screen.render(g, dt); return; }
    this.renderMenuBackground(g, dt);
  }

  renderMenuBackground(g, dt = 1 / 60) {
    // menü arkasında oynanan gösteri maçı + sinematik dönen kamera
    if (!this.demo) {
      this.demo = new MatchSim({ seed: 2024, squads: (this.world.setup || this.defaultSetup).squads });
      this.demoAcc = 0; this.demoFocus = [0, 0];
    }
    const d = this.demo;
    this.demoAcc += Math.min(0.1, dt);
    while (this.demoAcc >= DT) {
      this.demoAcc -= DT;
      d.step();
      for (const ev of d.events) if (ev.type === 'kickoffNeeded') d.kickoff(ev.team);
      d.events.length = 0;
    }
    this.world.apply((i, o) => {
      const e = d.ents[i];
      o.x = e.x; o.z = e.z; o.h = e.h; o.ph = e.ph; o.sp = e.sp; o.pose = e.active ? e.pose : POSE.HIDDEN; o.pt = e.pt; o.p1 = e.p1; o.p2 = e.p2; o.p3 = e.p3;
      return o;
    }, () => [d.ball.x, d.ball.y, d.ball.z, d.ball.spin], true);
    this.world.setCrowd(this.time, d.celebrate > 0 ? 1 : 0);
    this.world.setScoreboard(`${d.score[0]} - ${d.score[1]}`, 'GÖSTERİ MAÇI', '');
    const f = this.demoFocus, k = 1 - Math.exp(-dt * 0.8);
    f[0] += (d.ball.x - f[0]) * k; f[1] += (d.ball.z - f[1]) * k;
    const a = this.time * 0.05;
    const c = this.menuCam;
    c.position.set(f[0] * 0.6 + Math.cos(a) * 34, 11 + Math.sin(this.time * 0.13) * 3, f[1] * 0.4 + Math.sin(a) * 26);
    c.lookAt(f[0], 0.8, f[1]);
    c.fov = 38;
    if (this.debugCam) { // geliştirme için: window.__varApp.debugCam = { pos, at, fov, ent }
      const dc = this.debugCam;
      const e = dc.ent !== undefined ? d.ents[dc.ent] : null;
      const at = e ? [e.x, dc.at[1], e.z] : dc.at;
      c.position.set(at[0] + dc.pos[0], dc.pos[1], at[2] + dc.pos[2]);
      c.lookAt(at[0], at[1], at[2]); c.fov = dc.fov || 30;
      if (dc.freeze) this.demoAcc = -1e9;
    }
    c.aspect = g.w / g.h; c.clearViewOffset(); c.updateProjectionMatrix();
    g.renderView(c, { x: 0, y: 0, w: g.w, h: g.h });
  }
}

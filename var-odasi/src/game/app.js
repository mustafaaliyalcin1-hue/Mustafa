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
    this.defaultSetup = { kits: resolveKits(t[0], t[1]), squads: [makeSquad(r), makeSquad(r)] };
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
    this.renderMenuBackground(g);
  }

  renderMenuBackground(g) {
    // boş stadyumda yavaş dönen kamera
    this.world.apply(() => null, () => [0, 0.11, 0, 0], false);
    this.world.setCrowd(this.time, 0);
    const a = this.time * 0.04;
    const c = this.menuCam;
    c.position.set(Math.cos(a) * 62, 19 + Math.sin(this.time * 0.1) * 3, Math.sin(a) * 44);
    c.lookAt(0, 0, 0);
    c.fov = 45; c.aspect = g.w / g.h; c.clearViewOffset(); c.updateProjectionMatrix();
    g.renderView(c, { x: 0, y: 0, w: g.w, h: g.h });
  }
}

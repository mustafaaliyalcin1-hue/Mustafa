// Kontrolcü (gamepad) desteği — standart Xbox / PlayStation düzeni.
//  Sol çubuk : ekran imleci          A / ✕  : tıkla / seç
//  D-pad     : menüde gezin           B / ○  : geri
//  Start     : duraklat / oynat       Y / △  : (VAR) görüntü düzeni, (maç) hız
//  VAR ekranı: LT/RT kare geri/ileri, D-pad ←/→ 10 kare, ↑/↓ yakınlaştır,
//              LB/RB kamera değiştir, X / □ işaret (pas karesi / kritik an),
//              Select görüntü seç, sağ çubuk kaydır, sağ çubuğa bas: yakınlaştırmayı sıfırla
import { h, toast } from './dom.js';

const BTN = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, BACK: 8, START: 9, L3: 10, R3: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
const REPEAT = new Set([BTN.LT, BTN.RT, BTN.UP, BTN.DOWN, BTN.LEFT, BTN.RIGHT]);

export class GamepadInput {
  constructor(app) {
    this.app = app;
    this.prev = [];
    this.hold = {};
    this.x = window.innerWidth / 2; this.y = window.innerHeight / 2;
    this.cursorT = 0;
    this.connected = null;
    this.focusEl = null;
    this.cursor = h('div.gp-cursor', { style: { display: 'none' } });
    document.body.appendChild(this.cursor);
    window.addEventListener('gamepadconnected', (e) => { this.connected = e.gamepad.id; toast('🎮 Kontrolcü bağlandı'); this.rumble(120, 0.4); });
    window.addEventListener('gamepaddisconnected', () => { this.connected = null; toast('🎮 Kontrolcü ayrıldı', 'warn'); this.cursor.style.display = 'none'; });
  }

  pad() {
    if (!navigator.getGamepads) return null;
    for (const p of navigator.getGamepads()) if (p && p.connected) return p;
    return null;
  }

  rumble(ms = 100, strong = 0.5) {
    if (this.app.settings.gpRumble === false) return;
    const p = this.pad();
    const va = p && p.vibrationActuator;
    if (va && va.playEffect) va.playEffect('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: strong * 0.6 }).catch(() => {});
  }

  varView() {
    const s = this.app.screen;
    return s ? s.varView || s.vv || null : null;
  }

  key(k, shift = false) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: k, shiftKey: shift, bubbles: true }));
  }

  update(dt) {
    const p = this.pad();
    if (!p) return;
    const dz = (v) => (Math.abs(v) < 0.18 ? 0 : (v - Math.sign(v) * 0.18) / 0.82);
    const lx = dz(p.axes[0] || 0), ly = dz(p.axes[1] || 0), rx = dz(p.axes[2] || 0), ry = dz(p.axes[3] || 0);
    // imleç
    if (lx || ly) {
      const sp = 950 * (this.app.settings.gpSpeed || 1) * dt;
      const m = Math.hypot(lx, ly);
      const k = Math.pow(m, 1.6) / (m || 1);
      this.x = Math.max(0, Math.min(window.innerWidth - 1, this.x + lx * k * sp));
      this.y = Math.max(0, Math.min(window.innerHeight - 1, this.y + ly * k * sp));
      this.cursorT = 6;
      this.setFocus(null);
      this.move();
    }
    if (this.cursorT > 0) { this.cursorT -= dt; if (this.cursorT <= 0) this.cursor.style.display = 'none'; }
    // sağ çubuk: VAR'da kaydırma, sayfalarda kaydırma
    if (rx || ry) {
      const vv = this.varView();
      if (vv && vv.gamepadPan) vv.gamepadPan(rx * dt * 0.9, ry * dt * 0.9);
      else {
        const sc = this.scrollTarget();
        if (sc) sc.scrollTop += ry * dt * 900;
      }
    }
    // düğmeler (kenar algılama + tekrar)
    const now = p.buttons.map((b) => b.pressed || b.value > 0.5);
    for (let i = 0; i < now.length; i++) {
      if (now[i] && !this.prev[i]) { this.press(i); this.hold[i] = 0.32; }
      else if (now[i] && REPEAT.has(i)) {
        this.hold[i] -= dt;
        if (this.hold[i] <= 0) { this.hold[i] = 0.07; this.press(i, true); }
      }
    }
    this.prev = now;
  }

  move() {
    const c = this.cursor;
    c.style.display = '';
    c.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

  scrollTarget() {
    const el = document.elementFromPoint(this.x, this.y);
    let e = el;
    while (e && e !== document.body) { if (e.scrollHeight > e.clientHeight + 4 && getComputedStyle(e).overflowY !== 'visible') return e; e = e.parentElement; }
    return document.querySelector('.page-body.scroll') || document.querySelector('.var-side');
  }

  clickAt(x, y) {
    this.cursor.style.display = 'none';
    const el = document.elementFromPoint(x, y);
    this.cursor.style.display = '';
    if (!el) return;
    const opt = { clientX: x, clientY: y, bubbles: true, cancelable: true, pointerId: 77, button: 0, pointerType: 'mouse', isPrimary: true };
    el.dispatchEvent(new PointerEvent('pointerdown', opt));
    el.dispatchEvent(new PointerEvent('pointerup', opt));
    el.dispatchEvent(new MouseEvent('click', opt));
    this.app.audio.unlock();
  }

  buttons() {
    const modal = document.querySelector('.modal-wrap:last-of-type .modal');
    const root = modal || document.getElementById('ui');
    return [...root.querySelectorAll('button, input')].filter((b) => {
      if (b.disabled) return false;
      const r = b.getBoundingClientRect();
      return r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < window.innerHeight && getComputedStyle(b).visibility !== 'hidden';
    });
  }

  setFocus(el) {
    if (this.focusEl) this.focusEl.classList.remove('gp-focus');
    this.focusEl = el;
    if (el) { el.classList.add('gp-focus'); el.scrollIntoView({ block: 'nearest' }); }
  }

  nav(dx, dy) {
    const list = this.buttons();
    if (!list.length) return;
    if (!this.focusEl || !list.includes(this.focusEl)) { this.setFocus(list[0]); return; }
    const a = this.focusEl.getBoundingClientRect();
    const ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = null, bs = Infinity;
    for (const b of list) {
      if (b === this.focusEl) continue;
      const r = b.getBoundingClientRect();
      const bx = r.left + r.width / 2, by = r.top + r.height / 2;
      const prim = (bx - ax) * dx + (by - ay) * dy;
      if (prim <= 4) continue;
      const sec = Math.abs((bx - ax) * dy) + Math.abs((by - ay) * dx);
      const s = prim + sec * 2.2;
      if (s < bs) { bs = s; best = b; }
    }
    if (best) { this.setFocus(best); this.app.audio.ui('tick'); }
  }

  press(i, repeat = false) {
    const vv = this.varView();
    const modal = document.querySelector('.modal-wrap');
    if (vv && !modal) { this.pressVar(i, vv, repeat); return; }
    switch (i) {
      case BTN.A:
        if (this.cursorT > 0 && !this.focusEl) this.clickAt(this.x, this.y);
        else if (this.focusEl && this.focusEl.isConnected) { this.focusEl.click(); this.app.audio.unlock(); }
        else this.nav(0, 1);
        break;
      case BTN.B: {
        if (modal) { const btns = modal.querySelectorAll('.btn'); if (btns.length > 1) { const p = modal.querySelector('.btn.primary'); if (p) p.click(); } break; }
        const back = document.querySelector('.page-head .btn');
        if (back) back.click(); else this.key('Escape');
        break;
      }
      case BTN.START: this.key('Escape'); break;
      case BTN.Y: this.key('f'); break;
      case BTN.UP: this.nav(0, -1); break;
      case BTN.DOWN: this.nav(0, 1); break;
      case BTN.LEFT: this.nav(-1, 0); break;
      case BTN.RIGHT: this.nav(1, 0); break;
      default: break;
    }
  }

  pressVar(i, vv, repeat) {
    switch (i) {
      case BTN.A: if (!repeat) this.clickAt(this.x, this.y); break;
      case BTN.B: this.key('Escape'); break;
      case BTN.START: this.key(' '); break;
      case BTN.LT: this.key('ArrowLeft'); break;
      case BTN.RT: this.key('ArrowRight'); break;
      case BTN.LEFT: this.key('ArrowLeft', true); break;
      case BTN.RIGHT: this.key('ArrowRight', true); break;
      case BTN.UP: this.key('+'); break;
      case BTN.DOWN: this.key('-'); break;
      case BTN.LB: this.key('['); break;
      case BTN.RB: this.key(']'); break;
      case BTN.X: this.key('m'); this.rumble(60, 0.3); break;
      case BTN.Y: this.key('l'); break;
      case BTN.BACK: this.key('Tab'); break;
      case BTN.R3: this.key('0'); break;
      default: break;
    }
  }
}

// Prosedürel ses motoru (Web Audio API). Hiçbir ses dosyası gerekmez, tamamen çevrimdışı.
// Katmanlar: stadyum uğultusu, VAR odası ambiyansı (monitör vızıltısı, klavye), telsiz,
// düdük, vuruş, gol coşkusu, arayüz sesleri.

export class AudioEngine {
  constructor(settings) {
    this.ctx = null;
    this.settings = settings;
    this.crowdLevel = 0.3;
    this.crowdTarget = 0.3;
    this.roomOn = false;
    this.started = false;
  }

  // Tarayıcılar sesi ancak kullanıcı etkileşiminden sonra başlatır
  unlock() {
    if (this.started) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.started = true;
    const c = this.ctx;
    this.master = c.createGain();
    this.master.connect(c.destination);
    this.sfx = c.createGain(); this.sfx.connect(this.master);
    this.amb = c.createGain(); this.amb.connect(this.master);
    this.radioBus = c.createGain(); this.radioBus.connect(this.master);
    this.applyVolumes();
    this.noise = this.makeNoise(3);
    this.buildCrowd();
    this.buildRoom();
    this.keyTimer = 0;
  }

  applyVolumes() {
    if (!this.ctx) return;
    const s = this.settings;
    this.master.gain.value = s.muted ? 0 : s.volMaster;
    this.amb.gain.value = s.volAmbient;
    this.sfx.gain.value = s.volSfx;
    this.radioBus.gain.value = s.volRadio;
  }

  makeNoise(sec) {
    const c = this.ctx;
    const b = c.createBuffer(1, c.sampleRate * sec, c.sampleRate);
    const d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02; // pembe-kahverengi gürültü
      d[i] = w * 0.5 + last * 3;
    }
    return b;
  }

  noiseSrc(loop = true) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noise; s.loop = loop;
    s.loopStart = Math.random() * 2;
    return s;
  }

  buildCrowd() {
    const c = this.ctx;
    // iki bant geçiren filtreli gürültü + yavaş dalgalanma
    this.crowdGain = c.createGain(); this.crowdGain.gain.value = 0;
    this.crowdGain.connect(this.amb);
    for (const [f, q, g] of [[420, 0.7, 0.9], [1100, 1.2, 0.45], [2600, 2, 0.12]]) {
      const n = this.noiseSrc();
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
      const gg = c.createGain(); gg.gain.value = g;
      const lfo = c.createOscillator(); lfo.frequency.value = 0.07 + Math.random() * 0.15;
      const lg = c.createGain(); lg.gain.value = g * 0.35;
      lfo.connect(lg); lg.connect(gg.gain);
      n.connect(bp); bp.connect(gg); gg.connect(this.crowdGain);
      n.start(); lfo.start();
    }
  }

  buildRoom() {
    const c = this.ctx;
    this.roomGain = c.createGain(); this.roomGain.gain.value = 0;
    this.roomGain.connect(this.amb);
    // monitör / klima vızıltısı
    for (const [f, g] of [[60, 0.05], [120, 0.03], [180, 0.012]]) {
      const o = c.createOscillator(); o.frequency.value = f; o.type = 'sine';
      const gg = c.createGain(); gg.gain.value = g;
      o.connect(gg); gg.connect(this.roomGain); o.start();
    }
    const n = this.noiseSrc();
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300;
    const gg = c.createGain(); gg.gain.value = 0.05;
    n.connect(lp); lp.connect(gg); gg.connect(this.roomGain); n.start();
  }

  setCrowd(level) { this.crowdTarget = level; }
  setRoom(on) { this.roomOn = on; }

  update(dt) {
    if (!this.ctx) return;
    this.crowdLevel += (this.crowdTarget - this.crowdLevel) * Math.min(1, dt * 1.5);
    const t = this.ctx.currentTime;
    this.crowdGain.gain.setTargetAtTime(this.crowdLevel * (this.roomOn ? 0.35 : 1), t, 0.1);
    this.roomGain.gain.setTargetAtTime(this.roomOn ? 1 : 0, t, 0.3);
    if (this.roomOn) {
      this.keyTimer -= dt;
      if (this.keyTimer <= 0) { this.keyTimer = 0.08 + Math.random() * (Math.random() < 0.15 ? 2.5 : 0.35); this.keyClick(); }
    }
  }

  env(g, t0, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  }

  keyClick() {
    const c = this.ctx, t = c.currentTime;
    const n = this.noiseSrc(false);
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500 + Math.random() * 2000;
    const g = c.createGain();
    this.env(g, t, 0.001, 0.05 + Math.random() * 0.04, 0.03);
    n.connect(hp); hp.connect(g); g.connect(this.roomGain);
    n.start(t, Math.random()); n.stop(t + 0.06);
  }

  whistle(long = false, triple = false) {
    if (!this.ctx) return;
    const c = this.ctx;
    const blow = (t0, dur) => {
      const o = c.createOscillator(); o.type = 'square';
      o.frequency.setValueAtTime(2900, t0);
      const trem = c.createOscillator(); trem.frequency.value = 38;
      const tg = c.createGain(); tg.gain.value = 120;
      trem.connect(tg); tg.connect(o.frequency);
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3000; bp.Q.value = 3;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.03);
      g.gain.setValueAtTime(0.25, t0 + dur - 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(bp); bp.connect(g); g.connect(this.sfx);
      o.start(t0); trem.start(t0); o.stop(t0 + dur); trem.stop(t0 + dur);
    };
    const t = c.currentTime + 0.01;
    if (triple) { blow(t, 0.35); blow(t + 0.45, 0.35); blow(t + 0.9, 0.9); }
    else blow(t, long ? 0.8 : 0.28);
  }

  kick(power = 15) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.08);
    const g = c.createGain();
    this.env(g, t, 0.002, Math.min(0.5, 0.1 + power / 60), 0.1);
    o.connect(g); g.connect(this.sfx); o.start(t); o.stop(t + 0.15);
  }

  roar(strength = 1) {
    if (!this.ctx) return;
    this.crowdLevel = Math.min(1.4, this.crowdLevel + 0.7 * strength);
    const c = this.ctx, t = c.currentTime;
    const n = this.noiseSrc(false);
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 0.6;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.6 * strength, t + 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);
    n.connect(bp); bp.connect(g); g.connect(this.amb);
    n.start(t); n.stop(t + 3.6);
  }

  groan() {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    const n = this.noiseSrc(false);
    const bp = c.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.setValueAtTime(900, t); bp.frequency.linearRampToValueAtTime(300, t + 1.2);
    const g = c.createGain();
    this.env(g, t, 0.15, 0.35, 1.3);
    n.connect(bp); bp.connect(g); g.connect(this.amb);
    n.start(t); n.stop(t + 1.6);
  }

  // Telsiz: cızırtı + bip
  radio(kind = 'in') {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    const n = this.noiseSrc(false);
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.9;
    const g = c.createGain();
    this.env(g, t, 0.005, 0.18, 0.16);
    n.connect(bp); bp.connect(g); g.connect(this.radioBus);
    n.start(t); n.stop(t + 0.25);
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = kind === 'in' ? 1250 : 880;
    const og = c.createGain();
    this.env(og, t + 0.18, 0.005, 0.12, 0.08);
    o.connect(og); og.connect(this.radioBus); o.start(t + 0.18); o.stop(t + 0.3);
  }

  ui(kind = 'click') {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    if (kind === 'click') { o.type = 'triangle'; o.frequency.value = 900; this.env(g, t, 0.002, 0.08, 0.05); }
    else if (kind === 'tick') { o.type = 'square'; o.frequency.value = 1500; this.env(g, t, 0.001, 0.05, 0.03); }
    else if (kind === 'stamp') { o.type = 'sawtooth'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.2); this.env(g, t, 0.005, 0.2, 0.25); }
    else if (kind === 'good') { o.type = 'sine'; o.frequency.setValueAtTime(660, t); o.frequency.setValueAtTime(990, t + 0.09); this.env(g, t, 0.005, 0.15, 0.25); }
    else if (kind === 'bad') { o.type = 'sine'; o.frequency.setValueAtTime(300, t); o.frequency.setValueAtTime(200, t + 0.12); this.env(g, t, 0.005, 0.15, 0.3); }
    else if (kind === 'mark') { o.type = 'sine'; o.frequency.value = 1320; this.env(g, t, 0.002, 0.1, 0.07); }
    o.connect(g); g.connect(this.sfx); o.start(t); o.stop(t + 0.4);
  }

  /** İsteğe bağlı sesli telsiz: yalnızca cihazda YEREL Türkçe ses varsa (internet gerekmez). */
  speak(text) {
    if (!this.settings.tts || !window.speechSynthesis) return;
    const voices = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith('tr') && v.localService);
    if (!voices.length) return;
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voices[0]; u.lang = 'tr-TR'; u.rate = 1.08; u.pitch = 0.9;
    u.volume = Math.min(1, this.settings.volRadio * this.settings.volMaster * 1.2);
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }
}

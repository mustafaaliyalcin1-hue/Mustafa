// Kayıt: localStorage (tamamen cihazda; sunucu yok).
const KEY = 'varodasi.save.v1';

export const DEFAULT_SETTINGS = {
  controls: 'auto', // auto | pc | touch
  quality: 'auto', // auto | yuksek | orta | dusuk
  volMaster: 0.8,
  volAmbient: 0.7,
  volSfx: 0.8,
  volRadio: 0.9,
  muted: false,
  tts: false,
  matchMinutes: 7,
  showFps: false,
  reduceMotion: false,
};

function defaults() {
  return {
    v: 1,
    settings: { ...DEFAULT_SETTINGS },
    career: null,
    stats: emptyStats(),
    daily: {},
    tutorialDone: false,
    trainingBest: {},
  };
}

export function emptyStats() {
  return {
    matches: 0, incidents: 0, correct: 0, missed: 0, wrong: 0, unnecessary: 0,
    totalTime: 0, notesSum: 0, bestNote: 0,
    offsideErrSum: 0, offsideN: 0, framesPerfect: 0,
    byType: {}, history: [],
  };
}

export class Save {
  constructor() {
    this.data = defaults();
    this.load();
  }
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        this.data = { ...defaults(), ...d, settings: { ...DEFAULT_SETTINGS, ...(d.settings || {}) }, stats: { ...emptyStats(), ...(d.stats || {}) } };
      }
    } catch (e) {
      console.warn('Kayıt okunamadı, yeni kayıt açılıyor.', e);
    }
  }
  persist() {
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { console.warn('Kayıt yazılamadı', e); }
  }
  reset() { this.data = defaults(); this.persist(); }
  get settings() { return this.data.settings; }
}

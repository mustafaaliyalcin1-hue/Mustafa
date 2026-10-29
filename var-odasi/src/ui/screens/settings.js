// Ayarlar
import { h, modal, toast } from '../dom.js';
import { page, optGroup } from './common.js';

export class SettingsScreen {
  constructor(app) {
    this.app = app;
    const s = app.settings;
    const save = () => app.persist();
    const range = (label, key) => {
      const val = h('span.mono', { style: { width: '44px', textAlign: 'right' } }, Math.round(s[key] * 100) + '%');
      const inp = h('input', { type: 'range', min: 0, max: 100, value: Math.round(s[key] * 100) });
      inp.addEventListener('input', () => { s[key] = inp.value / 100; val.textContent = inp.value + '%'; app.audio.applyVolumes(); });
      inp.addEventListener('change', () => { save(); app.audio.ui('click'); });
      return h('label.set', null, h('span', null, label), inp, val);
    };
    const detected = app.detectTouch() ? 'dokunmatik' : 'fare + klavye';
    const body = h('div.grid2', null,
      h('div.card', null,
        h('h3', null, '🎮 Kontrol'),
        h('p.muted', { style: { fontSize: '13px' } }, `Otomatik algılanan cihaz: ${detected}`),
        optGroup([{ value: 'auto', label: 'Otomatik' }, { value: 'pc', label: 'PC (fare + klavye)' }, { value: 'touch', label: 'Telefon / tablet' }], s.controls, (v) => { s.controls = v; app.applyDevice(); save(); }),
        h('h3', null, '🖥️ Grafik'),
        optGroup([{ value: 'auto', label: 'Otomatik' }, { value: 'yuksek', label: 'Yüksek' }, { value: 'orta', label: 'Orta' }, { value: 'dusuk', label: 'Düşük (telefon)' }], s.quality, (v) => { s.quality = v; save(); app.rebuildGraphics(); toast('Grafik: ' + app.gfx.quality); }),
        h('p.muted', { style: { fontSize: '13px' } }, 'Düşük mod: gölge yok, daha az seyirci, düşük çözünürlük — telefonda 60 FPS için.'),
        h('label.set', null, h('span', null, 'FPS göstergesi'), optGroup([{ value: false, label: 'Kapalı' }, { value: true, label: 'Açık' }], s.showFps, (v) => { s.showFps = v; save(); app.updateFpsEl(); })),
        h('h3', null, '⏱️ Maç süresi'),
        optGroup([5, 6, 7, 8].map((m) => ({ value: m, label: `${m} dk` })), s.matchMinutes, (v) => { s.matchMinutes = v; save(); }),
        h('p.muted', { style: { fontSize: '13px' } }, '90 dakikalık maçın gerçek zamanda kaç dakika süreceği (VAR incelemeleri hariç).'),
      ),
      h('div.card', null,
        h('h3', null, '🔊 Ses'),
        range('Genel ses', 'volMaster'),
        range('Ambiyans (tribün, oda)', 'volAmbient'),
        range('Efektler (düdük, top)', 'volSfx'),
        range('Telsiz', 'volRadio'),
        h('label.set', null, h('span', null, 'Ses'), optGroup([{ value: false, label: 'Açık' }, { value: true, label: 'Kapalı' }], s.muted, (v) => { s.muted = v; app.audio.applyVolumes(); save(); })),
        h('label.set', null, h('span', null, 'Sesli telsiz (cihaz sesi)'), optGroup([{ value: false, label: 'Kapalı' }, { value: true, label: 'Açık' }], s.tts, (v) => { s.tts = v; save(); })),
        h('p.muted', { style: { fontSize: '12px' } }, 'Sesli telsiz yalnızca cihazında yerel (çevrimdışı) Türkçe ses varsa çalışır; internet kullanılmaz.'),
        h('h3', { style: { marginTop: '16px' } }, '💾 Kayıt'),
        h('p.muted', { style: { fontSize: '13px' } }, 'Tüm ilerleme yalnızca bu cihazda (tarayıcı belleğinde) tutulur. Hesap, sunucu ya da reklam yoktur.'),
        h('button.btn.danger', { onclick: () => modal('Kaydı sil', h('p', null, 'Kariyer, istatistikler ve ayarlar silinecek. Emin misin?'), [{ label: 'Vazgeç' }, { label: 'Sil', cls: 'danger', on: () => { app.save.reset(); location.reload(); } }]) }, 'Tüm kaydı sıfırla'),
      ),
    );
    this.el = page(app, 'Ayarlar', body);
  }
}

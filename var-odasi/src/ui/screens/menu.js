// Ana menü
import { h } from '../dom.js';
import { CareerScreen } from './career.js';
import { QuickScreen } from './quick.js';
import { TrainingScreen } from './training.js';
import { DailyScreen } from './daily.js';
import { StatsScreen } from './stats.js';
import { SettingsScreen } from './settings.js';
import { HowToScreen } from './howto.js';

export class MenuScreen {
  constructor(app) {
    this.app = app;
    const go = (S) => () => { app.audio.ui('click'); app.show(new S(app)); };
    const item = (ic, label, desc, S, cls = '') => h('button.btn.menu-btn' + cls, { onclick: go(S) }, h('span.ic', null, ic), label, h('span.desc', null, desc));
    const firstTime = !app.save.data.tutorialDone;
    this.el = h('div.screen.menu', null,
      h('div.menu-left', null,
        h('div.logo', null, h('div.logo-mon', null, 'VAR'), h('div', null, h('div.logo-title', { html: 'VAR <span>ODASI</span>' }), h('div.logo-sub', null, 'Video Yardımcı Hakem Simülasyonu'))),
        item('🏆', 'Kariyer', 'Amatörden finale', CareerScreen),
        item('⚡', 'Hızlı Maç', 'Zorluğu seç, oyna', QuickScreen),
        item('🎯', 'Pozisyon Antrenmanı', 'Süresiz, sınırsız', TrainingScreen),
        item('📅', 'Günlük Zorluk', 'Herkese aynı 5 pozisyon', DailyScreen),
        item('📊', 'İstatistikler', 'Karnen', StatsScreen),
        item('⚙️', 'Ayarlar', 'Kontrol, grafik, ses', SettingsScreen),
        item('📘', 'Nasıl Oynanır', firstTime ? 'Buradan başla!' : 'Protokol ve eğitim maçı', HowToScreen, firstTime ? '.primary' : ''),
        h('div.badges', null,
          h('span.chip.green', null, '✓ Reklamsız'), h('span.chip.green', null, '✓ Satın alma yok'), h('span.chip.green', null, '✓ İnternetsiz çalışır'), h('span.chip.green', null, '🎮 Kontrolcü desteği')),
      ),
      h('div.menu-right', null,
        h('div.panel.menu-card', null,
          h('b', null, 'Görev: VAR odasındaki video hakemsin.'), h('br'),
          'Saha hakeminin kararını izle, kamera açılarını incele, çizgini çek. ',
          'Yalnızca “açık ve net hata” varsa müdahale et. Her pozisyonun ölçülmüş tek bir doğru cevabı var — şans yok, sadece göz ve kural bilgisi.',
        ),
      ),
    );
  }
  enter() { this.app.audio.setRoom(false); this.app.audio.setCrowd(0.12); }
}

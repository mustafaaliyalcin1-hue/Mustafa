// VAR ODASI — giriş noktası
import './ui/styles.css';
import { App } from './game/app.js';
import { MenuScreen } from './ui/screens/menu.js';

const app = new App();
window.__varApp = app; // hata ayıklama / testler için
app.show(new MenuScreen(app));
app.start();

// Üretim derlemesinde çevrimdışı önbellek (servis çalışanı)
if (import.meta.env.PROD && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

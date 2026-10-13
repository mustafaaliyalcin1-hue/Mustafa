// Uygulama giriş noktası: ekranları yükler ve başlatır.

import { render, showSoundHelp } from "./ui.js";
import { unlockSpeech, onSpeechProblem } from "./speech.js";
import { unlockAudio } from "./fx.js";
import "./activities/home.js";
import "./activities/stories.js";
import "./activities/games.js";
import "./activities/parent.js";

render();

// Ses: ilk dokunuşta ses motorunu aç; ses hiç çıkmazsa ne yapılacağını göster.
document.addEventListener("pointerdown", () => { unlockSpeech(); unlockAudio(); }, { once: true, capture: true });
onSpeechProblem(showSoundHelp);

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

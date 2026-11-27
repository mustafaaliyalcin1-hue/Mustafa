// Uygulama giriş noktası: ekranları yükler ve başlatır.

import { render, showSoundHelp } from "./ui.js";
import { unlockSpeech, onSpeechProblem, elevenLabs } from "./speech.js";
import { unlockAudio } from "./fx.js";
import "./activities/home.js";
import "./activities/stories.js";
import "./activities/games.js";
import "./activities/parent.js";
import "./activities/character.js";
import "./activities/adventure.js";
import { applySettings, openMenu } from "./menu.js";
import "./chaos.js";

applySettings();
document.getElementById("menuBtn").addEventListener("click", openMenu);

render();

// Ses: ilk dokunuşta ses motorunu aç; ses hiç çıkmazsa ne yapılacağını göster.
document.addEventListener("pointerdown", () => { unlockSpeech(); unlockAudio(); }, { once: true, capture: true });
// iPhone (Safari) sesi parmak kalkınca/tıklamada açar: ses oynatıcı açılana kadar bunlarda da dene.
const unlockPlayer = () => { if (!elevenLabs.unlocked) elevenLabs.unlock(); };
["touchend", "click"].forEach((ev) => document.addEventListener(ev, unlockPlayer, { capture: true, passive: true }));
onSpeechProblem(showSoundHelp);

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

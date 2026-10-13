// Uygulama giriş noktası: ekranları yükler ve başlatır.

import { render } from "./ui.js";
import "./activities/home.js";
import "./activities/stories.js";
import "./activities/games.js";
import "./activities/parent.js";

render();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

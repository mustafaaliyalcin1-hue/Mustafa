// Sorulardaki resimler: emoji yerine tek tarzda çizim (Fluent Emoji Flat, MIT lisansı, Microsoft).
// Çizim yoksa emoji gösterilir.
import { PICS } from "./resim-liste.js";

const key = (e) => [...String(e)].map((c) => c.codePointAt(0).toString(16).padStart(4, "0")).join("-").replace(/-fe0f/g, "");

/** Emoji → <img> çizim. alt boş: resmin anlamı yanındaki yazı ya da ses ile verilir. */
export function pic(e, cls = "pic-img") {
  if (!e) return "";
  const k = key(e);
  return PICS.has(k) ? `<img class="${cls}" src="resim/${k}.svg" alt="" draggable="false" loading="lazy">` : e;
}

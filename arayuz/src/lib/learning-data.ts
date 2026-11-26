// Ana uygulamanın (Konuşan Arkadaşım) içeriğini ve cihazdaki ilerlemeyi okur.
// Panel aynı sitede yayınlandığı için aynı localStorage kaydını görür.
import { THEMES, STORIES } from "@app/content.js";
import { EN_THEMES, EN_STORIES } from "@app/content-en.js";
import { characterSVG, DEFAULT_LOOK, bodyOf } from "@app/character.js";

type Look = typeof DEFAULT_LOOK;

const KEY = "konusan-baykus:v2";
export const APP_URL = "../index.html";

type Lang = "tr" | "en";
interface Item { t: string; g: number }
interface Theme { id: string; title: string; sub?: string; icon: string; items: Item[] }
interface Story { id: string; title: string; tr?: string; icon: string; g: number; lines: (string | { t: string })[] }

export interface Progress {
  profile: { name: string; grade: number; buddy?: string } | null;
  lang: Lang;
  stars: number;
  done: Record<string, string[]>;
  days: Record<string, number>;
  look: Look;
}

export function readProgress(): Progress {
  let raw: Partial<Progress> = {};
  try { raw = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { /* gizli sekme vb. */ }
  return {
    profile: raw.profile ?? null,
    lang: raw.lang === "en" ? "en" : "tr",
    stars: raw.stars ?? 0,
    done: raw.done ?? {},
    days: raw.days ?? {},
    look: { ...DEFAULT_LOOK, ...(raw.look ?? {}) },
  };
}

/** Çalışılan dili ana uygulamayla ortak kaydeder (Devam et doğru dile gitsin). */
export function saveLang(lang: Lang) {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    raw.lang = lang;
    localStorage.setItem(KEY, JSON.stringify(raw));
  } catch { /* yok say */ }
}

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const DAILY_GOAL = 15;
export const todayStars = (p: Progress) => p.days[dayKey(new Date())] || 0;
export function streak(p: Progress) {
  let n = 0;
  const d = new Date();
  if (!p.days[dayKey(d)]) d.setDate(d.getDate() - 1);
  while (p.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
/** Son 7 günün yıldızları (eskiden yeniye) */
export function lastWeek(p: Progress) {
  const out: { label: string; stars: number }[] = [];
  const names = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ label: names[d.getDay()], stars: p.days[dayKey(d)] || 0 });
  }
  return out;
}

export interface Course {
  id: string;
  kind: "theme" | "story";
  title: string;
  subtitle: string;
  icon: string;
  total: number;
  done: number;
  href: string;
  grade: number;
}

export function courses(p: Progress, lang: Lang): Course[] {
  const g = p.profile?.grade || 1;
  const themes = (lang === "en" ? EN_THEMES : THEMES) as Theme[];
  const stories = (lang === "en" ? EN_STORIES : STORIES) as Story[];
  const themeCards = themes.map((t): Course => {
    const items = t.items.filter((x) => x.g === g);
    const done = items.filter((x) => (p.done[t.id] || []).includes(x.t)).length;
    return { id: t.id, kind: "theme", title: t.sub || t.title, subtitle: t.sub ? t.title : "Dinle ve söyle", icon: t.icon, total: items.length, done, href: `${APP_URL}#/theme/${t.id}`, grade: g };
  });
  const storyCards = stories.map((s): Course => {
    const done = Math.min((p.done["story:" + s.id] || []).length, s.lines.length);
    return { id: s.id, kind: "story", title: s.title, subtitle: s.tr || "Hikâye", icon: s.icon, total: s.lines.length, done, href: `${APP_URL}#/story/${s.id}`, grade: s.g };
  });
  return [...themeCards, ...storyCards];
}

export const buddyName = (p: Progress) => p.profile?.buddy || bodyOf(p.look.body).name;
export const buddySVG = (p: Progress, cls = "") => characterSVG(p.look, cls) as string;
export const lookSVG = (look: Look) => characterSVG(look, "") as string;

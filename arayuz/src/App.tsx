import { useEffect, useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { CourseDesignCard, type CardData } from "@/components/ui/course-design-cards";
import { cn } from "@/lib/utils";
import {
  APP_URL, DAILY_GOAL, buddyName, buddySVG, courses, lastWeek, readProgress, saveLang, streak, todayStars,
  type Course, type Progress,
} from "@/lib/learning-data";

const COLORS = ["green", "orange", "blue", "red"] as const;
type Tab = "theme" | "story";

/* ---------- İkonlar ---------- */
const Sun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const Moon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/* ---------- Tema (koyu/aydınlık) ---------- */
function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("panel:tema", dark ? "dark" : "light"); } catch { /* yok say */ }
  }, [dark]);
  return [dark, () => setDark((d) => !d)] as const;
}

function SpaceBackground() {
  return (
    <div className="space-bg" aria-hidden="true">
      <div className="aurora a" /><div className="aurora b" /><div className="aurora c" />
      <div className="stars" /><div className="grid-floor" />
      <i className="meteor m1" /><i className="meteor m2" /><i className="meteor m3" />
    </div>
  );
}

function GoalRing({ value, goal }: { value: number; goal: number }) {
  const r = 34, c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  useEffect(() => { const t = setTimeout(() => setShown(Math.min(value / goal, 1)), 120); return () => clearTimeout(t); }, [value, goal]);
  return (
    <div className="relative grid size-24 place-items-center">
      <svg viewBox="0 0 80 80" className="goal-ring absolute inset-0 -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="goal-g" x1="0" x2="1">
            <stop offset="0" stopColor="var(--neon-1)" /><stop offset="1" stopColor="var(--neon-3)" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--track)" strokeWidth="7" />
        <circle className="val" cx="40" cy="40" r={r} fill="none" stroke="url(#goal-g)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - shown)} />
      </svg>
      <div className="text-center leading-tight">
        <div className="font-mono text-lg font-semibold">{Math.min(value, goal)}</div>
        <div className="text-[10px] text-muted-foreground">/ {goal} ⭐</div>
      </div>
    </div>
  );
}

/** Sayıyı 0'dan hedefe doğru sayarak gösterir */
function useCountUp(target: number, ms = 1200, delay = 0) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(target); return; }
    let raf = 0;
    const t0 = performance.now() + delay;
    const tick = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - t0) / ms));
      setN(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, delay]);
  return n;
}

function Stat({ label, value, delay }: { label: string; value: number; delay: number; suffix?: string }) {
  const n = useCountUp(value, 1200, delay);
  return (
    <div className="glass animate-in fade-in slide-in-from-bottom-2 fill-mode-both min-w-0 rounded-2xl px-3 py-2.5 duration-700 sm:px-4 sm:py-3" style={{ animationDelay: `${delay}ms` }}>
      <div className="truncate font-mono text-lg font-semibold sm:text-xl">{n}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Hero({ p, lang }: { p: Progress; lang: "tr" | "en" }) {
  const name = p.profile?.name;
  const buddy = buddyName(p);
  const today = todayStars(p);
  const all = courses(p, lang);
  const finished = all.filter((c) => c.total && c.done >= c.total).length;
  const next = all.find((c) => c.kind === "theme" && c.done < c.total);
  return (
    <section className="glass neon-ring animate-in fade-in zoom-in-95 fill-mode-both grid gap-6 p-5 duration-700 sm:grid-cols-[auto_1fr] sm:p-7">
      <div className="relative mx-auto size-40 sm:size-48">
        <div className="orbit" /><div className="orbit two" />
        <button type="button" aria-label={`${buddy} zıplasın`} className="absolute inset-[14%] cursor-pointer border-0 bg-transparent p-0"
          onClick={(e) => { const el = e.currentTarget.firstElementChild as HTMLElement; el.classList.remove("jump"); void el.offsetWidth; el.classList.add("jump"); }}>
          <div className="float size-full"><div className="buddy size-full" dangerouslySetInnerHTML={{ __html: buddySVG(p) }} /></div>
        </button>
      </div>
      <div className="flex flex-col justify-center gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Öğrenme paneli · {lang === "en" ? "English" : "Türkçe"}</p>
          <h1 className="mt-1 text-3xl font-bold leading-tight sm:text-4xl">
            {name ? <>Merhaba <span className="text-glow">{name}</span>!</> : <>Hoş geldin, <span className="text-glow">kaşif</span>!</>}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {name
              ? <>{buddy} seni bekliyor. {next ? <>Sıradaki görev: <b className="text-foreground">{next.icon} {next.title}</b>.</> : "Bütün konuları bitirdin!"}</>
              : "Henüz başlamadın. Uygulamaya girip karakterini seç, sonra ilerlemen burada görünsün."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <GoalRing value={today} goal={DAILY_GOAL} />
          <div className="grid flex-1 grid-cols-3 gap-2 sm:gap-3">
            <Stat label="⭐ Yıldız" value={p.stars} delay={150} />
            <Stat label="🔥 Seri" value={streak(p)} delay={250} />
            <Stat label={`✓ Biten / ${all.length}`} value={finished} delay={350} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={next ? next.href : APP_URL} className={buttonVariants({ variant: "default", size: "lg", className: "group shadow-[0_0_24px_var(--glow)]" })}>
            {name ? "Devam et" : "Başla"}
            <span className="btn-icon-motion btn-icon-motion--arrow inline-flex"><Arrow /></span>
          </a>
          <a href={`${APP_URL}#/character`} className={buttonVariants({ variant: "outline", size: "lg" })}>👕 Karakteri giydir</a>
        </div>
      </div>
    </section>
  );
}

function WeekChart({ p }: { p: Progress }) {
  const week = lastWeek(p);
  const max = Math.max(DAILY_GOAL, ...week.map((d) => d.stars));
  return (
    <section className="glass animate-in fade-in slide-in-from-bottom-4 fill-mode-both flex flex-col p-5 duration-700" style={{ animationDelay: "200ms" }}>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Son 7 gün</h2>
        <span className="font-mono text-xs text-muted-foreground">{week.reduce((a, d) => a + d.stars, 0)} ⭐</span>
      </div>
      <div className="flex min-h-28 flex-1 items-end gap-2">
        {week.map((d, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center gap-1.5">
            <div className="relative w-full flex-1">
              <div
                className="bar-grow absolute inset-x-0 bottom-0 rounded-lg bg-gradient-to-t from-neon-2 to-neon-1 shadow-[0_0_14px_var(--glow)]"
                style={{ height: `${Math.max(4, (d.stars / max) * 100)}%`, animationDelay: `${300 + i * 70}ms`, opacity: d.stars ? 1 : 0.25 }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function toCard(c: Course, i: number, p: Progress, nextId?: string): CardData {
  const pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
  const left = c.total - c.done;
  return {
    id: c.id,
    colorClass: COLORS[i % COLORS.length],
    date: c.kind === "story" ? `Hikâye · ${c.grade}. sınıf` : `${c.grade}. sınıf · ${c.total} görev`,
    title: c.title,
    description: c.subtitle,
    progressPercent: `${pct}%`,
    progressValue: `${pct}%`,
    countdownText: left <= 0 ? "Tamamlandı ✓" : c.done ? `${left} kaldı →` : "Başla →",
    href: c.href,
    icon: c.icon,
    done: left <= 0,
    isNext: c.id === nextId,
    avatars: p.profile ? [<span key="b" dangerouslySetInnerHTML={{ __html: buddySVG(p) }} />] : [],
  };
}

export default function App() {
  const [dark, toggleTheme] = useTheme();
  const [p, setP] = useState<Progress>(readProgress);
  const [lang, setLang] = useState<"tr" | "en">(p.lang);
  const [tab, setTab] = useState<Tab>("theme");

  // Uygulamadan geri gelince ilerlemeyi tazele
  useEffect(() => {
    const refresh = () => setP(readProgress());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener("storage", refresh); };
  }, []);

  const list = useMemo(() => courses(p, lang).filter((c) => c.kind === tab && c.total > 0), [p, lang, tab]);
  const switchLang = (l: "tr" | "en") => { setLang(l); saveLang(l); };
  const nextId = p.profile ? list.find((c) => c.done < c.total)?.id : undefined;

  return (
    <>
      <SpaceBackground />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-16 pt-4 sm:px-6">
        <header className="flex items-center justify-between gap-3">
          <a href={APP_URL} className="flex items-center gap-2 font-semibold no-underline text-foreground">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-neon-1 via-neon-2 to-neon-3 text-sm font-bold text-white shadow-[0_0_18px_var(--glow)]">KA</span>
            <span className="hidden sm:inline">Konuşan Arkadaşım</span>
          </a>
          <div className="flex items-center gap-2">
            <a href={APP_URL} className={buttonVariants({ variant: "ghost", size: "sm" })}>← Uygulama</a>
            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label={dark ? "Aydınlık moda geç" : "Koyu moda geç"}>
              {dark ? <Sun /> : <Moon />}
            </Button>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <Hero p={p} lang={lang} />
          <WeekChart p={p} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="glass inline-flex gap-1 rounded-2xl p-1" role="tablist" aria-label="Bölüm">
            {([["theme", "🎤 Konular"], ["story", "📚 Hikâyeler"]] as const).map(([t, label]) => (
              <Button key={t} size="sm" role="tab" aria-selected={tab === t} variant={tab === t ? "default" : "ghost"} onClick={() => setTab(t)}>{label}</Button>
            ))}
          </div>
          <div className="glass inline-flex gap-1 rounded-2xl p-1" role="group" aria-label="Dil">
            {([["tr", "🇹🇷 Türkçe"], ["en", "🇬🇧 English"]] as const).map(([l, label]) => (
              <Button key={l} size="sm" variant={lang === l ? "secondary" : "ghost"} onClick={() => switchLang(l)} aria-pressed={lang === l}>{label}</Button>
            ))}
          </div>
        </div>

        <section key={`${tab}-${lang}`} className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3")}>
          {list.map((c, i) => (
            <CourseDesignCard
              key={c.id}
              data={toCard(c, i, p, nextId)}
              style={{ animation: `enter 0.7s var(--primitive-ease) both`, animationDelay: `${Math.min(i, 12) * 80}ms`, ["--i" as string]: i }}
            />
          ))}
        </section>
      </div>
      <style>{`@keyframes enter { from { opacity: 0; transform: translateY(40px) scale(.92); } 60% { opacity: 1; } }`}</style>
    </>
  );
}

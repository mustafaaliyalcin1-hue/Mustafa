import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Apple, ArrowLeft, ArrowRight, BookOpen, Check, Flame, Hand, Hash, Leaf, Moon, Palette, PawPrint,
  Repeat, School, Shirt, Star, Sun, Users,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { CourseDesignCard, type CardData } from "@/components/ui/course-design-cards";
import {
  APP_URL, DAILY_GOAL, buddyName, buddySVG, courses, lastWeek, readProgress, saveLang, streak, todayStars,
  type Course, type Progress,
} from "@/lib/learning-data";

const COLORS = ["green", "orange", "blue", "red"] as const;
type Tab = "theme" | "story";
type Lang = "tr" | "en";

// Tek ikon seti (lucide): her konuya sabit bir simge
const ICONS: Record<string, ReactNode> = {
  ailem: <Users />, okulum: <School />, hayvanlar: <PawPrint />, doga: <Leaf />, yiyecekler: <Apple />, tekerleme: <Repeat />,
  "en-greetings": <Hand />, "en-colors": <Palette />, "en-numbers": <Hash />, "en-animals": <PawPrint />, "en-food": <Apple />, "en-school": <School />,
};
const iconFor = (c: Course) => (c.kind === "story" ? <BookOpen /> : ICONS[c.id] ?? <BookOpen />);

/* ---------- Tema (koyu/aydınlık) ---------- */
function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("panel:tema", dark ? "dark" : "light");
      // Uygulamanın menüsündeki tema ayarıyla aynı kalsın
      const raw = JSON.parse(localStorage.getItem("konusan-baykus:v2") || "{}");
      if (raw.profile) { raw.settings = { ...(raw.settings || {}), theme: dark ? "dark" : "light" }; localStorage.setItem("konusan-baykus:v2", JSON.stringify(raw)); }
    } catch { /* yok say */ }
  }, [dark]);
  return [dark, () => setDark((d) => !d)] as const;
}

function Stat({ icon, value, label, color }: { icon: ReactNode; value: ReactNode; label: string; color: string }) {
  return (
    <div className="stat">
      <span style={{ color }} aria-hidden="true">{icon}</span>
      <div className="min-w-0"><b>{value}</b><span>{label}</span></div>
    </div>
  );
}

function Hero({ p, lang }: { p: Progress; lang: Lang }) {
  const name = p.profile?.name;
  const today = Math.min(todayStars(p), DAILY_GOAL);
  const all = courses(p, lang).filter((c) => c.kind === "theme");
  const finished = all.filter((c) => c.total && c.done >= c.total).length;
  const next = all.find((c) => c.done < c.total);

  if (!name) {
    return (
      <section className="surface enter grid gap-4 text-center">
        <h1 className="t-display">Hoş geldin!</h1>
        <p className="t-body text-muted-foreground">Önce uygulamada kendine bir arkadaş seç. Sonra yıldızların burada görünecek.</p>
        <div><a href={APP_URL} className={buttonVariants({ size: "lg", className: "px-6" })}>Uygulamaya git</a></div>
      </section>
    );
  }

  return (
    <section className="surface enter grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-7">
      <div className="mx-auto grid size-36 place-items-center rounded-full bg-muted sm:size-40">
        <div className="buddy size-28 sm:size-32" dangerouslySetInnerHTML={{ __html: buddySVG(p) }} />
      </div>
      <div className="grid gap-4 text-center sm:text-left">
        <div className="grid gap-1">
          <h1 className="t-display">Merhaba {name}!</h1>
          <p className="t-body text-muted-foreground">
            {next ? <>Sıradaki konu: <b className="font-semibold text-foreground">{next.title}</b></> : "Bütün konuları bitirdin. Harikasın!"}
          </p>
        </div>

        <div className="grid gap-2">
          <div className="flex items-baseline justify-between text-[15px]">
            <span className="font-medium">Bugünkü hedef</span>
            <span className="text-muted-foreground tabular-nums">{today} / {DAILY_GOAL} yıldız</span>
          </div>
          <div className="meter" role="progressbar" aria-label="Bugünkü hedef" aria-valuemin={0} aria-valuemax={DAILY_GOAL} aria-valuenow={today}
            style={{ ["--value" as string]: `${(today / DAILY_GOAL) * 100}%` }}><i /></div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat icon={<Star size={22} />} value={p.stars} label="yıldız" color="var(--clr-orange)" />
          <Stat icon={<Flame size={22} />} value={streak(p)} label="gün seri" color="var(--clr-red)" />
          <Stat icon={<Check size={22} />} value={`${finished}/${all.length}`} label="konu" color="var(--clr-green)" />
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <a href={next ? next.href : APP_URL}
            className={buttonVariants({ size: "lg", className: "flex-1 px-6 text-base shadow-[0_8px_20px_-8px_var(--glow)] sm:flex-none" })}>
            Devam et <ArrowRight className="size-5" aria-hidden="true" />
          </a>
          <a href={`${APP_URL}#/character`} className={buttonVariants({ variant: "outline", size: "lg", className: "flex-1 px-5 text-base sm:flex-none" })}>
            <Shirt className="size-5" aria-hidden="true" /> Kıyafet seç
          </a>
        </div>
      </div>
    </section>
  );
}

function Week({ p }: { p: Progress }) {
  const week = lastWeek(p);
  const total = week.reduce((a, d) => a + d.stars, 0);
  const max = Math.max(DAILY_GOAL, ...week.map((d) => d.stars));
  return (
    <section className="surface enter flex flex-col gap-4" style={{ animationDelay: "60ms" }}>
      <div className="grid gap-1">
        <h2 className="t-title">Bu hafta</h2>
        <p className="t-small">{total ? `Bu hafta ${total} yıldız topladın.` : "Bu hafta henüz yıldız yok. Hadi başlayalım!"}</p>
      </div>
      <div className="flex min-h-28 flex-1 items-end gap-2" aria-hidden="true">
        {week.map((d, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center gap-2">
            <div className="relative w-full flex-1">
              <div className="bar absolute inset-x-0 bottom-0 rounded-lg"
                style={{ height: `${Math.max(5, (d.stars / max) * 100)}%`, animationDelay: `${120 + i * 40}ms`,
                  background: d.stars ? "var(--primary)" : "var(--track)" }} />
            </div>
            <span className="text-[13px] text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function toCard(c: Course, i: number, nextId?: string): CardData {
  const pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
  const left = c.total - c.done;
  return {
    id: c.id,
    colorClass: COLORS[i % COLORS.length],
    date: c.kind === "story" ? `${c.grade}. sınıf · ${c.total} cümle` : `${c.total} cümle`,
    title: c.title,
    // İngilizce konularda İngilizce adı altta gösterilir (ör. Selamlaşma — Greetings)
    description: c.kind === "story" ? (c.subtitle !== "Hikâye" ? c.subtitle : "Dinle, sonra sen oku") : c.subtitle || "Dinle, sonra söyle",
    progressPercent: `${pct}%`,
    progressValue: `${c.done} / ${c.total}`,
    countdownText: left <= 0 ? "Bitti" : c.done ? "Devam et" : "Başla",
    href: c.href,
    icon: iconFor(c),
    done: left <= 0,
    isNext: c.id === nextId,
  };
}

export default function App() {
  const [dark, toggleTheme] = useTheme();
  const [p, setP] = useState<Progress>(readProgress);
  const [lang, setLang] = useState<Lang>(p.lang);
  const [tab, setTab] = useState<Tab>("theme");

  // Uygulamadan geri gelince ilerlemeyi tazele
  useEffect(() => {
    const refresh = () => setP(readProgress());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener("storage", refresh); };
  }, []);

  const list = useMemo(() => courses(p, lang).filter((c) => c.kind === tab && c.total > 0), [p, lang, tab]);
  const nextId = p.profile ? list.find((c) => c.done < c.total)?.id : undefined;
  const switchLang = (l: Lang) => { setLang(l); saveLang(l); };

  return (
    <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-5 px-4 pb-16 pt-4 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <a href={APP_URL} className="flex min-w-0 items-center gap-3 text-foreground no-underline">
          <span className="grid size-11 flex-none place-items-center overflow-hidden rounded-[14px] bg-muted">
            <span className="buddy size-9" dangerouslySetInnerHTML={{ __html: buddySVG(p) }} />
          </span>
          <span className="truncate text-[17px] font-semibold">{p.profile ? `${buddyName(p)} ile öğren` : "Konuşan Arkadaşım"}</span>
        </a>
        <div className="flex flex-none items-center gap-2">
          <a href={APP_URL} className={buttonVariants({ variant: "ghost", size: "sm", className: "text-[15px]" })}>
            <ArrowLeft className="size-5" aria-hidden="true" /> <span className="hidden sm:inline">Uygulamaya dön</span><span className="sm:hidden">Geri</span>
          </a>
          <Button variant="outline" size="icon" className="size-11" onClick={toggleTheme} aria-label={dark ? "Aydınlık görünüm" : "Koyu görünüm"}>
            {dark ? <Sun /> : <Moon />}
          </Button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
        <Hero p={p} lang={lang} />
        {p.profile ? <Week p={p} /> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="segmented" role="tablist" aria-label="Bölüm">
          {([["theme", "Konular"], ["story", "Hikâyeler"]] as const).map(([t, label]) => (
            <Button key={t} size="sm" role="tab" aria-selected={tab === t} variant={tab === t ? "default" : "ghost"}
              className="px-5 text-[15px]" onClick={() => setTab(t)}>{label}</Button>
          ))}
        </div>
        <div className="segmented" role="group" aria-label="Dil">
          {([["tr", "Türkçe"], ["en", "İngilizce"]] as const).map(([l, label]) => (
            <Button key={l} size="sm" variant={lang === l ? "white" : "ghost"} aria-pressed={lang === l}
              className="px-4 text-[15px]" onClick={() => switchLang(l)}>{label}</Button>
          ))}
        </div>
      </div>

      <section key={`${tab}-${lang}`} className="grid gap-4 pt-1 sm:grid-cols-2 lg:grid-cols-3" aria-label={tab === "theme" ? "Konular" : "Hikâyeler"}>
        {list.map((c, i) => (
          <CourseDesignCard key={c.id} data={toCard(c, i, nextId)}
            style={{ animation: "enter 0.45s var(--primitive-ease) both", animationDelay: `${Math.min(i, 8) * 40}ms` }} />
        ))}
      </section>
    </div>
  );
}

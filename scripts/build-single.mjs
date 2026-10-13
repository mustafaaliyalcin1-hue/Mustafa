// Tüm uygulamayı tek bir HTML dosyasında toplar (paylaşılabilir demo için).
// Kullanım: node scripts/build-single.mjs [çıktı.html]
// Not: esbuild'i npx ile indirir (internet gerekir).
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
const out = resolve(process.argv[2] || resolve(root, "dist/konusan-baykus.html"));

const js = execFileSync("npx", ["--yes", "esbuild@0.24.0", resolve(root, "js/main.js"), "--bundle", "--format=iife", "--minify", "--target=es2020"], { encoding: "utf8" });
const css = readFileSync(resolve(root, "styles.css"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const body = html.slice(html.indexOf("<header"), html.indexOf("<noscript>"));

const page = `<title>Konuşan Baykuş</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap" rel="stylesheet">
<style>
${css}
</style>
${body.trim()}
<script>
${js.replace(/<\/script/gi, "<\\/script")}
</script>
`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, page);
console.log(`${out} (${(page.length / 1024).toFixed(0)} KB)`);

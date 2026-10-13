// Tüm uygulamayı tek bir HTML dosyasında toplar (paylaşılabilir demo için).
// Kullanım: node scripts/build-single.mjs [çıktı.html] [--standalone]
//   --standalone: tarayıcıda doğrudan açılabilen tam HTML belgesi üretir
//   (varsayılan: claude.ai Artifact'i için gövde parçası)
// Not: esbuild'i npx ile indirir (internet gerekir).
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const standalone = args.includes("--standalone");
const outArg = args.find((a) => !a.startsWith("--"));
const out = resolve(outArg || resolve(root, standalone ? "dist/konusan-baykus-tam.html" : "dist/konusan-baykus.html"));

const js = execFileSync("npx", ["--yes", "esbuild@0.24.0", resolve(root, "js/main.js"), "--bundle", "--format=iife", "--minify", "--target=es2020"], { encoding: "utf8" });
const css = readFileSync(resolve(root, "styles.css"), "utf8");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const body = html.slice(html.indexOf("<header"), html.indexOf("<noscript>"));

const head = `<title>Konuşan Baykuş</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap" rel="stylesheet">
<style>
${css}
</style>
`;
const content = `${body.trim()}
<script>
${js.replace(/<\/script/gi, "<\\/script")}
</script>
`;
let page = head + content;
if (standalone) {
  page = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#5b4bdb">
${head}</head>
<body>
${content}</body>
</html>
`;
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, page);
console.log(`${out} (${(page.length / 1024).toFixed(0)} KB)`);

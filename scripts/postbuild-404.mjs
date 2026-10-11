#!/usr/bin/env node
// Postbuild for GitHub Pages (static export).
//
// Next.js `output: "export"` emits real files like ops.html, properties.html,
// and properties/__placeholder.html, but its <Link> hrefs are extensionless
// (/property-manager/ops). GitHub Pages has no rewrite layer, so a direct visit
// or refresh on an extensionless URL 404s (client-side nav still works).
//
// This writes a smart 404.html that:
//   1. Tries the .html sibling of the requested path.
//   2. Tries <path>/index.html.
//   3. For /properties/<id>, falls back to the prerendered placeholder.
//   4. Otherwise sends you to the app root (which loads the beta demo).
//
// Docs: https://docs.github.com/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'out')
const BASE = '/property-manager'

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>VestaOS</title>
<script>
(function () {
  var BASE = ${JSON.stringify(BASE)};
  var path = location.pathname;
  var rest = path.startsWith(BASE) ? path.slice(BASE.length) : path;
  rest = rest.replace(/\\/+$/, ''); // trim trailing slash

  var candidates = [];
  if (rest && rest !== '/') {
    candidates.push(BASE + rest + '.html');
    candidates.push(BASE + rest + '/index.html');
    // dynamic route fallback (e.g. /properties/<id> -> placeholder build)
    var m = rest.match(/^(\\/properties)\\/[^/]+$/);
    if (m) candidates.push(BASE + m[1] + '/__placeholder.html');
  }
  candidates.push(BASE + '/'); // beta root -> demo loader
  candidates.push(BASE + '/index.html');

  // Probe candidates in order with HEAD requests; first 200 wins.
  (function probe(i) {
    if (i >= candidates.length) { location.replace(candidates[candidates.length - 1]); return; }
    var url = candidates[i] + location.search + location.hash;
    fetch(url, { method: 'GET', headers: { 'Range': 'bytes=0-0' } })
      .then(function (r) { if (r.ok || r.status === 206) location.replace(url); else probe(i + 1); })
      .catch(function () { probe(i + 1); });
  })(0);
})();
</script>
<noscript><meta http-equiv="refresh" content="0; url=${BASE}/"></noscript>
</head>
<body style="font-family: system-ui, sans-serif; background:#0a0a0a; color:#e5e5e5; display:flex; align-items:center; justify-content:center; height:100vh; margin:0">
<p>Redirecting…</p>
</body>
</html>
`

fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(path.join(OUT, '404.html'), html)
console.log('[postbuild] wrote out/404.html (Pages deep-link fallback)')

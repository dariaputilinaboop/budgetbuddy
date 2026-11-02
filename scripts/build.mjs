// Собирает папку www/ для приложения (Capacitor) и сайта.
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';

mkdirSync('www', { recursive: true });
await build({ entryPoints: ['src/native.js'], bundle: true, format: 'iife', minify: true, target: 'es2019', outfile: 'www/native.js' });

const body = readFileSync('src/app.html', 'utf8');
const head = [
  '<!doctype html><html lang="ru"><head><meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
  '<meta name="theme-color" content="#1D6B58">',
  '<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon.svg"><link rel="apple-touch-icon" href="icon.svg">',
  '<style>html{color-scheme:light}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style>',
  '<script src="native.js"></script>',
  '</head><body>',
].join('');
writeFileSync('www/index.html', head + '\n' + body + '\n</body></html>\n');
for (const f of ['icon.svg', 'manifest.webmanifest']) copyFileSync('src/' + f, 'www/' + f);
console.log('www/ готово');

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'dist');
const assetsDir = path.join(distDir, 'assets');
const budgetPath = path.join(__dirname, 'quality-budgets.json');
const budgets = JSON.parse(readFileSync(budgetPath, 'utf8'));

const toKb = (bytes) => Math.round((bytes / 1024) * 100) / 100;

const fail = (message, details) => {
  console.error(`\n[build-audit] FAIL: ${message}`);
  if (details) {
    console.error(JSON.stringify(details, null, 2));
  }
  process.exit(1);
};

if (!existsSync(distDir) || !existsSync(assetsDir)) {
  fail('Missing dist output. Run `npm run build` before `npm run audit:build`.');
}

const indexPath = path.join(distDir, 'index.html');
if (!existsSync(indexPath)) {
  fail('Missing dist/index.html.');
}

const indexHtml = readFileSync(indexPath, 'utf8');
const assets = readdirSync(assetsDir)
  .filter((name) => ['.js', '.css', '.map'].includes(path.extname(name)))
  .map((name) => ({
    name,
    ext: path.extname(name),
    bytes: statSync(path.join(assetsDir, name)).size,
  }));

const jsAssets = assets.filter((asset) => asset.ext === '.js');
const cssAssets = assets.filter((asset) => asset.ext === '.css');
const sourceMaps = assets.filter((asset) => asset.ext === '.map');

const oversizedJs = jsAssets.filter((asset) => toKb(asset.bytes) > budgets.maxJsAssetKb);
const oversizedCss = cssAssets.filter((asset) => toKb(asset.bytes) > budgets.maxCssAssetKb);
const totalJsKb = toKb(jsAssets.reduce((sum, asset) => sum + asset.bytes, 0));
const totalCssKb = toKb(cssAssets.reduce((sum, asset) => sum + asset.bytes, 0));

const unhashedAssets = assets.filter((asset) => {
  if (asset.ext === '.map') {
    return false;
  }

  return !/-[A-Za-z0-9_-]{6,}\.(?:js|css)$/.test(asset.name);
});

if (budgets.forbidSourceEntrypoints && indexHtml.includes('/src/')) {
  fail('Production index still references source entrypoints.');
}

if (budgets.forbidSourceMaps && sourceMaps.length) {
  fail('Production build emitted source maps.', sourceMaps.map((asset) => asset.name));
}

if (budgets.requireHashedAssets && unhashedAssets.length) {
  fail('Production assets must be content-hashed.', unhashedAssets.map((asset) => asset.name));
}

if (oversizedJs.length) {
  fail(`A JS asset exceeds ${budgets.maxJsAssetKb}KB.`, oversizedJs.map((asset) => ({ name: asset.name, kb: toKb(asset.bytes) })));
}

if (oversizedCss.length) {
  fail(`A CSS asset exceeds ${budgets.maxCssAssetKb}KB.`, oversizedCss.map((asset) => ({ name: asset.name, kb: toKb(asset.bytes) })));
}

if (totalJsKb > budgets.maxTotalJsKb) {
  fail(`Total JS exceeds ${budgets.maxTotalJsKb}KB.`, { totalJsKb });
}

if (totalCssKb > budgets.maxTotalCssKb) {
  fail(`Total CSS exceeds ${budgets.maxTotalCssKb}KB.`, { totalCssKb });
}

console.log(`[build-audit] PASS: ${jsAssets.length} JS assets, total ${totalJsKb}KB`);
console.log(`[build-audit] PASS: ${cssAssets.length} CSS assets, total ${totalCssKb}KB`);
console.log('[build-audit] PASS: production index, hashed assets, and source-map policy validated');

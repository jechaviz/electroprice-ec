import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const providerRoot = path.join(repoRoot, 'config', 'providers');
const catalogPath = path.join(providerRoot, 'catalog.json');

const normalizePath = (filePath) => filePath.replaceAll(path.sep, '/');

const readJson = (filePath) => JSON.parse(readFileSync(filePath, 'utf8'));

const listFiles = (dir, extension) =>
  readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => normalizePath(path.relative(repoRoot, path.join(dir, entry.name))))
    .sort((a, b) => a.localeCompare(b));

const getLineCount = (relativePath) => {
  const text = readFileSync(path.join(repoRoot, relativePath), 'utf8');
  return text.split(/\r\n|\r|\n/).length;
};

const fail = (message, details) => {
  console.error(`\n[provider-config-audit] FAIL: ${message}`);
  if (details) {
    console.error(JSON.stringify(details, null, 2));
  }
  process.exit(1);
};

if (!existsSync(catalogPath)) {
  fail('Missing provider catalog.', { expected: normalizePath(path.relative(repoRoot, catalogPath)) });
}

const catalog = readJson(catalogPath);
const apiDir = path.join(providerRoot, 'api_integrator');
const vimportDir = path.join(providerRoot, 'vimport');
const actualAiSpecs = listFiles(apiDir, '.yaml');
const actualVimportSpecs = listFiles(vimportDir, '.yml');
const catalogAiSpecs = catalog.integrations.map((item) => item.aiSpec).sort((a, b) => a.localeCompare(b));
const catalogVimportSpecs = catalog.integrations
  .map((item) => item.vimportSpec)
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b));

const missingAiSpecs = catalogAiSpecs.filter((file) => !actualAiSpecs.includes(file));
const unindexedAiSpecs = actualAiSpecs.filter((file) => !catalogAiSpecs.includes(file));
const missingVimportSpecs = catalogVimportSpecs.filter((file) => !actualVimportSpecs.includes(file));
const unindexedVimportSpecs = actualVimportSpecs.filter((file) => !catalogVimportSpecs.includes(file));

if (missingAiSpecs.length || unindexedAiSpecs.length) {
  fail('API integrator spec inventory does not match catalog.', { missingAiSpecs, unindexedAiSpecs });
}

if (missingVimportSpecs.length || unindexedVimportSpecs.length) {
  fail('VImport portal spec inventory does not match catalog.', { missingVimportSpecs, unindexedVimportSpecs });
}

const auditedFiles = [
  normalizePath(path.relative(repoRoot, catalogPath)),
  normalizePath(path.relative(repoRoot, path.join(providerRoot, 'README.md'))),
  ...actualAiSpecs,
  ...actualVimportSpecs,
  normalizePath(path.relative(repoRoot, path.join(vimportDir, 'mexico_provider_credentials.env.example'))),
];

const oversizedFiles = auditedFiles
  .map((file) => ({ file, lines: getLineCount(file) }))
  .filter((entry) => entry.lines >= 600)
  .sort((a, b) => b.lines - a.lines);

if (oversizedFiles.length) {
  fail('Provider configuration file reached the 600 line limit.', oversizedFiles);
}

const credentialAssignmentPattern =
  /^\s*([A-Z0-9_]*(?:PASSWORD|PASSWD|PWD|SECRET|TOKEN|API_KEY|ACCESS_TOKEN|RFC|CLIENTE|EMAIL|CUSTOMER_NUMBER)[A-Z0-9_]*)\s*[:=]\s*["']?([^"'\s{}]+)/;

const leakedFiles = auditedFiles.filter((file) => {
  const lines = readFileSync(path.join(repoRoot, file), 'utf8').split(/\r\n|\r|\n/);
  return lines.some((line) => {
    const match = line.match(credentialAssignmentPattern);
    if (!match) {
      return false;
    }

    const value = match[2].trim();
    return value.length > 0 && !value.startsWith('{{') && !value.startsWith('$');
  });
});

if (leakedFiles.length) {
  fail('Potential raw credential values found in provider config files.', leakedFiles);
}

console.log(`[provider-config-audit] PASS: ${catalog.integrations.length} catalog entries indexed`);
console.log(`[provider-config-audit] PASS: ${actualAiSpecs.length} API specs and ${actualVimportSpecs.length} portal specs matched`);
console.log('[provider-config-audit] PASS: no provider config file reaches 600 lines');
console.log('[provider-config-audit] PASS: no raw provider credential values detected');

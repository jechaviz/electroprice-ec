import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const baselinePath = path.join(__dirname, 'project-audit.baseline.json');
const updateBaseline = process.argv.includes('--update');

const ignoredDirs = new Set([
  '.git',
  'dist',
  'node_modules',
  'coverage',
  '.vite',
]);

const generatedPathPrefixes = [
  'pb/pb_data/',
  'pb/pb_public/',
];

const auditedRoots = [
  'config',
  'src',
  'public',
  'pb',
  'tools',
  '.',
];

const lineLimitedExtensions = new Set([
  '.css',
  '.cjs',
  '.html',
  '.js',
  '.jsx',
  '.mjs',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
]);

const requiredAbstractions = [
  {
    path: 'src/lib/geminiClient.ts',
    contains: ['createGeminiTextClient', 'parseJsonBlock'],
    reason: 'Shared Gemini SDK adapter keeps AI integrations out of feature services.',
  },
  {
    path: 'src/services/ServiceContainer.ts',
    contains: ['export class ServiceContainer', 'export const services'],
    reason: 'Dependency container centralizes service composition.',
  },
  {
    path: 'src/utils/pricing.ts',
    contains: ['PricingConfig', 'calculateOrderAmounts', 'getPricingConfig'],
    reason: 'Pricing math is reusable and configurable instead of duplicated in pages.',
  },
];

const normalizePath = (filePath) => filePath.replaceAll(path.sep, '/');

const isGeneratedPath = (relativePath) => generatedPathPrefixes.some((prefix) => relativePath.startsWith(prefix));

const walk = (absoluteDir, relativeDir = '') => {
  const entries = readdirSync(absoluteDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = normalizePath(path.join(relativeDir, entry.name));
    const absolutePath = path.join(absoluteDir, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name) || isGeneratedPath(`${relativePath}/`)) {
        continue;
      }

      files.push(...walk(absolutePath, relativePath));
      continue;
    }

    if (entry.isFile() && !isGeneratedPath(relativePath)) {
      files.push(relativePath);
    }
  }

  return files;
};

const shouldIncludeRootFile = (relativePath) => {
  const allowedRootFiles = new Set([
    '.env.example',
    '.gitignore',
    'README.md',
    'bun.lock',
    'eslint.config.js',
    'index.html',
    'metadata.json',
    'package-lock.json',
    'package.json',
    'postcss.config.js',
    'tsconfig.app.json',
    'tsconfig.json',
    'tsconfig.node.json',
    'vite.config.ts',
  ]);

  return allowedRootFiles.has(relativePath);
};

const collectInventory = () => {
  const rootFiles = walk(repoRoot)
    .filter((relativePath) => relativePath !== 'tools/project-audit.baseline.json')
    .filter((relativePath) => {
      const root = relativePath.split('/')[0];
      return auditedRoots.includes(root) || shouldIncludeRootFile(relativePath);
    })
    .filter((relativePath) => !relativePath.endsWith('.tsbuildinfo'))
    .sort((a, b) => a.localeCompare(b));

  const hash = createHash('sha256').update(rootFiles.join('\n')).digest('hex');

  return {
    generatedAt: new Date().toISOString(),
    fileCount: rootFiles.length,
    fileNameHash: hash,
    files: rootFiles,
  };
};

const getLineCount = (relativePath) => {
  const text = readFileSync(path.join(repoRoot, relativePath), 'utf8');
  return text.split(/\r\n|\r|\n/).length;
};

const auditLineLengths = (files) => {
  return files
    .filter((relativePath) => lineLimitedExtensions.has(path.extname(relativePath)))
    .map((relativePath) => ({ path: relativePath, lines: getLineCount(relativePath) }))
    .filter((entry) => entry.lines >= 600)
    .sort((a, b) => b.lines - a.lines);
};

const auditRequiredAbstractions = () => {
  return requiredAbstractions.flatMap((requirement) => {
    const absolutePath = path.join(repoRoot, requirement.path);
    if (!existsSync(absolutePath)) {
      return [{ path: requirement.path, reason: requirement.reason, missing: 'file' }];
    }

    const text = readFileSync(absolutePath, 'utf8');
    return requirement.contains
      .filter((needle) => !text.includes(needle))
      .map((needle) => ({ path: requirement.path, reason: requirement.reason, missing: needle }));
  });
};

const compareInventory = (current, baseline) => {
  const currentSet = new Set(current.files);
  const baselineSet = new Set(baseline.files);

  const added = current.files.filter((file) => !baselineSet.has(file));
  const removed = baseline.files.filter((file) => !currentSet.has(file));

  return {
    expectedFileCount: baseline.fileCount,
    actualFileCount: current.fileCount,
    expectedFileNameHash: baseline.fileNameHash,
    actualFileNameHash: current.fileNameHash,
    added,
    removed,
  };
};

const fail = (message, details) => {
  console.error(`\n[project-audit] FAIL: ${message}`);
  if (details) {
    console.error(JSON.stringify(details, null, 2));
  }
  process.exit(1);
};

const current = collectInventory();

if (updateBaseline) {
  mkdirSync(path.dirname(baselinePath), { recursive: true });
  writeFileSync(baselinePath, `${JSON.stringify(current, null, 2)}\n`);
  console.log(`[project-audit] baseline updated: ${current.fileCount} files, hash ${current.fileNameHash}`);
  process.exit(0);
}

if (!existsSync(baselinePath)) {
  fail('Missing baseline. Run `npm run audit:project:update` intentionally after reviewing file inventory.');
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const inventoryDiff = compareInventory(current, baseline);
const oversizedFiles = auditLineLengths(current.files);
const missingAbstractions = auditRequiredAbstractions();

if (inventoryDiff.added.length || inventoryDiff.removed.length || current.fileNameHash !== baseline.fileNameHash) {
  fail('File inventory changed without an updated audit baseline.', inventoryDiff);
}

if (oversizedFiles.length) {
  fail('One or more source files reached the 600 line limit.', oversizedFiles);
}

if (missingAbstractions.length) {
  fail('Required architectural abstraction checks failed.', missingAbstractions);
}

console.log(`[project-audit] PASS: ${current.fileCount} files match baseline ${current.fileNameHash}`);
console.log('[project-audit] PASS: maintained source files stay below 600 lines');
console.log('[project-audit] PASS: required abstraction checks satisfied');

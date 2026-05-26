import fs from 'node:fs';
import path from 'node:path';

export const readDotEnv = (cwd = process.cwd()) => {
  const envPath = path.resolve(cwd, '.env');
  if (!fs.existsSync(envPath)) return {};

  return fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((acc, line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) return acc;
    acc[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    return acc;
  }, {});
};

export const getPocketBaseConfig = (cwd = process.cwd()) => {
  const dotEnv = readDotEnv(cwd);
  return {
    url: process.env.PB_URL || process.env.VITE_POCKETBASE_URL || dotEnv.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090',
    email: process.env.PB_SUPERUSER_EMAIL || process.env.PB_ADMIN_EMAIL || dotEnv.PB_SUPERUSER_EMAIL || dotEnv.PB_ADMIN_EMAIL || 'admin@electroprice.com',
    password: process.env.PB_SUPERUSER_PASSWORD || process.env.PB_ADMIN_PASSWORD || dotEnv.PB_SUPERUSER_PASSWORD || dotEnv.PB_ADMIN_PASSWORD || 'test1234',
    geminiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY || dotEnv.GEMINI_API_KEY || dotEnv.GOOGLE_API_KEY || dotEnv.VITE_GEMINI_API_KEY || '',
  };
};

export const parseArgs = (argv = process.argv.slice(2)) => argv.reduce((acc, arg, index) => {
  if (!arg.startsWith('--')) return acc;
  const [rawKey, inlineValue] = arg.split('=');
  const key = rawKey.slice(2);
  const nextValue = argv[index + 1];
  acc[key] = inlineValue ?? (nextValue && !nextValue.startsWith('--') ? nextValue : true);
  return acc;
}, {});

export const argEnabled = (value) => value === true || value === 'true' || value === '1' || value === 'yes';

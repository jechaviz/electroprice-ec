import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { join } from 'node:path'

const MANUAL_CHUNK_GROUPS: ReadonlyArray<readonly [string, readonly string[]]> = [
   ['react-core', ['react', 'react-dom', 'scheduler']],
   ['vendor', ['react-router', 'react-router-dom']],
   ['sanitize', ['dompurify']],
   ['pocketbase', ['pocketbase']],
   ['ai', ['@google/genai', 'p-retry', 'retry']],
];

const getManualChunk = (id: string) => {
   if (!id.includes('node_modules')) {
      return undefined;
   }

   const normalizedId = id.replace(/\\/g, '/');

   for (const [chunkName, packages] of MANUAL_CHUNK_GROUPS) {
      if (packages.some((pkg) => normalizedId.includes(`/node_modules/${pkg}/`))) {
         return chunkName;
      }
   }

   return undefined;
};

const getInlineScriptHashes = () => {
   const indexHtml = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
   const inlineScriptPattern = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
   const hashes: string[] = [];
   let match: RegExpExecArray | null;

   while ((match = inlineScriptPattern.exec(indexHtml)) !== null) {
      if (match[1].trim()) {
         hashes.push(`'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`);
      }
   }

   return hashes;
};

export default defineConfig(({ mode }) => {
   const env = loadEnv(mode, process.cwd(), '');
   const pocketBaseUrl = env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
   const vhubUrl = env.VITE_VHUB_BASE_URL || 'http://127.0.0.1:8787';
   const vimportUrl = env.VITE_VIMPORT_BASE_URL || 'http://127.0.0.1:8788';
   const productionScriptSources = ["'self'", ...getInlineScriptHashes()];
   const devScriptSources = ["'self'", "'unsafe-inline'", "'unsafe-eval'"];
   const connectSources = [
      "'self'",
      pocketBaseUrl,
      vhubUrl,
      vimportUrl,
      'http://127.0.0.1:8090',
      'http://127.0.0.1:8092',
      'https://generativelanguage.googleapis.com',
   ];
   const styleSources = [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
      'https://cdnjs.cloudflare.com',
   ];
   const fontSources = [
      "'self'",
      'https://fonts.gstatic.com',
      'https://cdnjs.cloudflare.com',
   ];
   const imageSources = [
      "'self'",
      'data:',
      'blob:',
      'https://images.pexels.com',
      'https://images.unsplash.com',
      'https://i.pravatar.cc',
      'https://picsum.photos',
      'https://fastly.picsum.photos',
   ];
   const applySecurityHeaders = (_req: IncomingMessage, res: ServerResponse, next: () => void, allowDevScripts = false) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader(
         'Content-Security-Policy',
         [
            "default-src 'self'",
            `script-src ${(allowDevScripts ? devScriptSources : productionScriptSources).join(' ')}`,
            `style-src ${styleSources.join(' ')}`,
            `style-src-elem ${styleSources.join(' ')}`,
            `font-src ${fontSources.join(' ')}`,
            `img-src ${imageSources.join(' ')}`,
            `connect-src ${connectSources.join(' ')}`,
            "media-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests",
         ].join('; ')
      );
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      next();
   };

   return {
      plugins: [
         react(),
         {
            name: 'security-headers',
            configureServer(server) {
               server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => applySecurityHeaders(req, res, next, true));
            },
            configurePreviewServer(server) {
               server.middlewares.use(applySecurityHeaders);
            },
         },
      ],
      test: {
         globals: true,
         environment: 'jsdom',
         setupFiles: ['./src/test/setup.ts'],
         include: ['src/**/*.{test,spec}.{ts,tsx}'],
         testTimeout: 15000,
         hookTimeout: 15000,
      },
      build: {
         rollupOptions: {
            output: {
               manualChunks: getManualChunk,
            },
         },
      },
   };
})

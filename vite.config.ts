import fs from 'node:fs/promises';
import path from 'node:path';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const ALLOWED_LOCAL_IMAGE_PATH =
  /^public\/images\/(projects|skins|avatars)\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp|avif)$/;

/**
 * Vite dev-only middleware so admins running `npm run dev` locally can click "保存更改"
 * to write `src/content/siteData.json` and uploaded images straight to disk without configuring a remote Worker.
 */
function couriersLocalCmsPlugin(): Plugin {
  return {
    name: 'couriers-local-cms-save',
    configureServer(server) {
      server.middlewares.use('/__cms_local_save', (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const raw = Buffer.concat(chunks).toString('utf8');
            const payload = JSON.parse(raw) as {
              siteData?: unknown;
              files?: Array<{ path: string; contentBase64: string }>;
            };

            if (!payload.siteData) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: '缺少 siteData' }));
              return;
            }

            const rootDir = server.config.root || process.cwd();

            // 1. Write uploaded images to public/images/...
            if (Array.isArray(payload.files)) {
              for (const file of payload.files) {
                if (
                  typeof file.path !== 'string' ||
                  !ALLOWED_LOCAL_IMAGE_PATH.test(file.path)
                ) {
                  throw new Error(`不允许写入的路径: ${file.path}`);
                }
                const absPath = path.resolve(rootDir, file.path);
                if (!absPath.startsWith(path.resolve(rootDir, 'public/images'))) {
                  throw new Error(`非法路径: ${file.path}`);
                }
                await fs.mkdir(path.dirname(absPath), { recursive: true });
                await fs.writeFile(
                  absPath,
                  Buffer.from(file.contentBase64, 'base64')
                );
              }
            }

            // 2. Write src/content/siteData.json
            const dataPath = path.resolve(rootDir, 'src/content/siteData.json');
            await fs.mkdir(path.dirname(dataPath), { recursive: true });
            await fs.writeFile(
              dataPath,
              JSON.stringify(payload.siteData, null, 2) + '\n',
              'utf8'
            );

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, mode: 'local-disk' }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                ok: false,
                error: err instanceof Error ? err.message : '本地保存失败',
              })
            );
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), couriersLocalCmsPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'vendor-three'
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react'
          }
        },
      },
    },
  },
});

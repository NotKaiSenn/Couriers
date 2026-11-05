import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('./dist/', import.meta.url)));
const port = Number(process.env.PORT || 4173);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.png':'image/png', '.webp':'image/webp', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.mp3':'audio/mpeg' };
http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + path.sep) && file !== root) { response.writeHead(403).end(); return; }
    const info = await stat(file);
    if (!info.isFile()) { response.writeHead(404).end(); return; }
    const headers = { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-cache', 'Accept-Ranges':'bytes' };
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Math.min(Number(range[2] || info.size - 1), info.size - 1);
      if (start > end || start >= info.size) { response.writeHead(416, { 'Content-Range':`bytes */${info.size}` }).end(); return; }
      response.writeHead(206, { ...headers, 'Content-Range':`bytes ${start}-${end}/${info.size}`, 'Content-Length':end-start+1 });
      createReadStream(file,{start,end}).pipe(response);
    } else {
      response.writeHead(200, { ...headers, 'Content-Length':info.size });
      if (request.method === 'HEAD') response.end(); else createReadStream(file).pipe(response);
    }
  } catch { response.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Couriers preview: http://localhost:${port}`));

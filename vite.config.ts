import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const r = (p: string) => path.resolve(__dirname, p);

// Halaman utama = folder per rute (/endorser/ -> endorser/index.html) sehingga URL bersih
// berfungsi di GitHub Pages, Vercel, Netlify, dan Cloudflare Pages tanpa aturan rewrite.
// File *.html di root hanya stub pengalihan untuk URL lama (/login.html dst.).
const ROUTES = ['dashboard', 'endorser', 'resources', 'tutorial', 'login', 'register', 'admin'];

export default defineConfig({
  server: { port: 3000, host: '0.0.0.0' },
  plugins: [
    {
      // Dev server saja: /endorser -> /endorser/ (GitHub Pages melakukan hal yang sama di produksi).
      name: 'trailing-slash-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const [pathname, query] = (req.url || '').split('?');
          const name = pathname.replace(/^\/+|\/+$/g, '');
          if (ROUTES.includes(name) && !pathname.endsWith('/')) {
            res.statusCode = 302;
            res.setHeader('Location', `/${name}/${query ? '?' + query : ''}`);
            res.end();
            return;
          }
          next();
        });
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: r('index.html'),
        ...Object.fromEntries(ROUTES.map((n) => [n, r(`${n}/index.html`)])),
        legacyEndorser: r('endorser.html'),
        legacyResources: r('resources.html'),
        legacyTutorial: r('tutorial.html'),
        legacyLogin: r('login.html'),
        legacyRegister: r('register.html'),
        legacyAdmin: r('admin.html'),
        notfound: r('404.html'),
      },
    },
  },
});

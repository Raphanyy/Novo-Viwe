import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
    fs: {
      allow: ["./client", "./shared", "./node_modules"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [
    react(),
    expressPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5000000, // 5MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300, // 5 minutes
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400, // 1 day
              },
            },
          },
        ],
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "Viwe App",
        short_name: "Viwe",
        description: "Uma aplicação moderna e responsiva",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        lang: "pt-BR",
        categories: ["productivity", "utilities"],
        icons: [
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable any",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable any",
          },
        ],
        shortcuts: [
          {
            name: "Dashboard",
            short_name: "Dashboard",
            description: "Acesso rápido ao dashboard",
            url: "/internal/dashboard",
            icons: [
              {
                src: "shortcut-dashboard.png",
                sizes: "96x96",
              },
            ],
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}

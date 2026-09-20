import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
    plugins: [ react() ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "./apps"),
            "@bot": path.resolve(import.meta.dirname, "./apps/bot"),
            "@utils": path.resolve(import.meta.dirname, "./apps/utils"),
            "@database": path.resolve(import.meta.dirname, "./apps/database"),
        },
    },
    build: {
        sourcemap: false, // отключит source maps в production сборке
    },
    server: {
        fs: {
            strict: false,
        },
    },
});

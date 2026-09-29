import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
    plugins: [ react() ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "./apps"),
            "@assets": path.resolve(import.meta.dirname, "./apps/assets"),
            "@bot": path.resolve(import.meta.dirname, "./apps/bot"),
            "@utils": path.resolve(import.meta.dirname, "./apps/utils"),
            "@database": path.resolve(import.meta.dirname, "./apps/database"),
        },
    },
    build: {
        sourcemap: false,
    },
    server: {
        fs: {
            strict: false,
        },
    },
});

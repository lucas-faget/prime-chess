import tailwindcss from "@tailwindcss/vite";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../.env") });

export default defineNuxtConfig({
    compatibilityDate: "2025-06-14",
    devtools: { enabled: false },
    runtimeConfig: {
        public: {
            assetsBaseUrl: process.env.NUXT_PUBLIC_ASSETS_BASE_URL,
        },
    },
    alias: {
        "@chess": resolve(__dirname, "../../packages/chess/src"),
    },
    css: ["~/assets/css/main.css"],
    modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@primevue/nuxt-module"],
    vite: {
        plugins: [tailwindcss()],
    },
    primevue: {
        importTheme: { from: "@/themes/theme.ts" },
        options: {
            ripple: true,
        },
        components: {
            exclude: ["Form", "FormField"],
        },
    },
});

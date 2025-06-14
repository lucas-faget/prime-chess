import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineNuxtConfig({
    compatibilityDate: "2025-06-14",
    devtools: { enabled: false },
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

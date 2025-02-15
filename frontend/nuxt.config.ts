export default defineNuxtConfig({
    compatibilityDate: "2024-04-03",
    devtools: { enabled: true },
    alias: {
        "@shared": "../shared",
    },
    css: ["~/assets/css/main.css"],
    modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@primevue/nuxt-module"],
    primevue: {
        importTheme: { from: "@/themes/theme.ts" },
        options: {
            ripple: true,
        },
    },
});

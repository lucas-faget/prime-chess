import type { Config } from "tailwindcss";

export default {
    content: [],
    plugins: [require("tailwindcss-primeui")],
    darkMode: ["selector", '[class*="p-dark"]'],
} satisfies Config;

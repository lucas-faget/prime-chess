import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";

const MyPreset = definePreset(Aura, {
    semantic: {
        colorScheme: {
            light: {
                surface: {
                    0: "#ffffff",
                    50: "{zinc.50}",
                    100: "{zinc.100}",
                    200: "{zinc.200}",
                    300: "{zinc.300}",
                    400: "{zinc.400}",
                    500: "{zinc.500}",
                    600: "{zinc.600}",
                    700: "{zinc.700}",
                    800: "{zinc.800}",
                    900: "{zinc.900}",
                    950: "{zinc.950}",
                },
            },
            dark: {
                surface: {
                    0: "#ffffff",
                    50: "{zinc.50}",
                    100: "{zinc.100}",
                    200: "{zinc.200}",
                    300: "{zinc.300}",
                    400: "{zinc.400}",
                    500: "{zinc.500}",
                    600: "{zinc.600}",
                    700: "{zinc.700}",
                    800: "{zinc.800}",
                    900: "{zinc.900}",
                    950: "{zinc.950}",
                },
            },
        },
    },
});

export default {
    preset: MyPreset,
    options: {
        darkModeSelector: ".p-dark",
    },
};

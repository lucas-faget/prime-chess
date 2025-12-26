export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();

    return {
        provide: {
            apiBaseUrl: config.public.apiBaseUrl,
        },
    };
});

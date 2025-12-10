export default defineNuxtRouteMiddleware(() => {
    const store = useChessStore();

    if (!store.game) {
        return navigateTo("/");
    }
});

export default defineNuxtRouteMiddleware((to) => {
    const store = useChessStore();
    const gameId: string = to.params.id as string;

    if (!gameId && !store.game) {
        return navigateTo("/");
    }
});

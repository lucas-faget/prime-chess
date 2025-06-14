import { useChessStore } from "~/stores/chess";
const chessStore = useChessStore();

export default defineNuxtRouteMiddleware((to, from) => {
    if (!chessStore.gameExists()) {
        return navigateTo("/");
    }
});

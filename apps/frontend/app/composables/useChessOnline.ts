import type { Move } from "@primechess/chess-lib";
import { ApiService } from "~/services/ApiService";

export function useChessOnline(gameId: string) {
    const store = useChessStore();
    const core = useChessCore();

    let unsubscribe: (() => void) | null = null;
    const playerIndex = ref<number | undefined>(undefined);
    const canMove = computed<boolean>(() => core.canMove.value && playerIndex.value === core.activePlayerIndex.value);

    onMounted(async () => {
        try {
            const data = await ApiService.joinGame(gameId);
            playerIndex.value = data.playerIndex;
            core.playerInFrontIndex.value = playerIndex.value;
            core.loadState(data.state);
            store.storeGame("online", { id: data.gameId, state: data.state });

            unsubscribe = ApiService.subscribe(gameId, (data: any) => {
                core.tryMove(data.move.from, data.move.to);
                store.storeMove(data.move);
            });
        } catch (error) {
            console.error("Failed to join game.", error);
            navigateTo("/");
        }
    });

    onUnmounted(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });

    async function tryMove(from: string, to: string): Promise<void> {
        try {
            await ApiService.move(gameId, { from, to });
        } catch (error) {
            console.error("Failed to play move.", error);
        }
    }

    function cancelLastMove(): Move | null {
        return null;
    }

    return {
        ...core,
        playerIndex,
        canMove,
        tryMove,
        cancelLastMove,
    };
}

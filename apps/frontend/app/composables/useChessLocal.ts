import type { Move } from "@primechess/chess-lib";

export function useChessLocal() {
    const store = useChessStore();
    const core = useChessCore(store.game?.state ?? null);

    onMounted(() => {
        if (core.fen.value) {
            store.storeInitialFen(core.fen.value);
        }
    });

    function tryMove(from: string, to: string): void {
        const move: Move | null = core.tryMove(from, to);
        if (move) store.storeMove(move);
    }

    function cancelLastMove(): void {
        if (core.cancelLastMove()) {
            store.game?.state.moves.pop();
        }
    }

    return {
        ...core,
        tryMove,
        cancelLastMove,
    };
}

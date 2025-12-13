import type { GameState } from "@primechess/types";

export function useChessLocal(state: GameState | null = null) {
    return useChessCore(state);
}

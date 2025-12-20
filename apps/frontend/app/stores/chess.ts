import { ChessVariant, type GameState } from "@primechess/types";
import type { Move } from "@primechess/chess-lib";
import { defineStore } from "pinia";

interface Game {
    type: "local" | "online";
    id: string;
    state: GameState;
}

export const useChessStore = defineStore("chess", () => {
    const game = ref<Game | null>(null);

    function storeGame(
        type: "local" | "online",
        options?: {
            id?: string;
            variant?: ChessVariant;
            state?: GameState;
        },
    ) {
        game.value = {
            type,
            id: options?.id ?? crypto.randomUUID(),
            state: options?.state ?? {
                variant: options?.variant ?? ChessVariant.Standard,
                initialFen: null,
                moves: [],
            },
        };
    }

    function storeInitialFen(fen: string) {
        if (!game.value) return;
        if (game.value.state.initialFen !== null) return;

        game.value.state.initialFen = fen;
    }

    function storeMove(move: Move) {
        game.value?.state.moves.push({
            from: move.fromSquare,
            to: move.toSquare,
        });
    }

    return {
        game,
        storeGame,
        storeInitialFen,
        storeMove,
    };
});

import { ChessVariant, type GameState } from "@primechess/types";
import type { Move } from "@primechess/chess-lib";
import { defineStore } from "pinia";

interface Game {
    type: string;
    id: string;
    state: GameState;
}

export const useChessStore = defineStore("chess", () => {
    const game = ref<Game | null>(null);

    async function newGame(variant: ChessVariant = ChessVariant.Standard) {
        game.value = {
            type: "local",
            id: crypto.randomUUID(),
            state: {
                variant,
                initialFen: null,
                moves: [],
            },
        };
    }

    function storeMove(move: Move) {
        game.value?.state.moves.push({
            from: move.fromSquare,
            to: move.toSquare,
        });
    }

    return {
        game,
        newGame,
        storeMove,
    };
});

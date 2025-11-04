import { chess, type Chess, type Chessboard, type Direction, type LegalMoves, type Move } from "@primechess/chess-lib";

export function useLocalChess() {
    const game = ref<Chess>(chess.new());

    const rows = computed<string[]>(() => {
        return playerInFrontIndex.value === 0 ? [...game.value.ranks].reverse() : game.value.ranks;
    });

    const columns = computed<string[]>(() => {
        return playerInFrontIndex.value === 0 ? game.value.files : [...game.value.files].reverse();
    });

    const chessboard = ref<Chessboard>(game.value.getChessboard());
    const legalMoves = ref<LegalMoves>(game.value.getLegalMoves());
    const playerInFrontIndex = ref<number>(0);
    const playerInFrontDirection = computed<Direction>(() => game.value.players[playerInFrontIndex.value]!.direction);

    function isLegalMove(from: string, to: string): boolean {
        return game.value.isLegalMove(from, to);
    }

    function tryMove(from: string, to: string): Move | null {
        const move = game.value.tryMove(from, to);
        if (move) {
            chessboard.value = game.value.getChessboard();
            legalMoves.value = game.value.getLegalMoves();
        }
        return move;
    }

    function spinChessboard(): void {
        playerInFrontIndex.value = (playerInFrontIndex.value + 1) % game.value.players.length;
    }

    function cancelLastMove(): Move | null {
        const move = game.value.cancelLastMove();
        if (move) {
            chessboard.value = game.value.getChessboard();
            legalMoves.value = game.value.getLegalMoves();
        }
        return move;
    }

    return {
        rows,
        columns,
        chessboard,
        legalMoves,
        playerInFrontIndex,
        playerInFrontDirection,

        isLegalMove,
        tryMove,
        spinChessboard,
        cancelLastMove,
    };
}

import {
    chess,
    type Chess,
    type Chessboard,
    type Direction,
    type HistoryEntry,
    type LegalMoves,
    type Move,
    type Squares,
} from "@primechess/chess-lib";

export function useLocalChess() {
    const game = ref<Chess>(chess.new());
    let board = ref<Chessboard>(game.value.getChessboard());
    let squares = ref<Squares>(board.value.getSquares());

    const rows = computed<string[]>(() => {
        return playerInFrontIndex.value === 0 ? [...board.value.ranks].reverse() : board.value.ranks;
    });

    const columns = computed<string[]>(() => {
        return playerInFrontIndex.value === 0 ? board.value.files : [...board.value.files].reverse();
    });

    const legalMoves = ref<LegalMoves>(game.value.getLegalMoves());
    const history = ref<HistoryEntry[]>(game.value.getHistory());
    const lastHalfmoveIndex = ref<number>(0);
    const activeHalfmoveIndex = ref<number>(0);
    const playerInFrontIndex = ref<number>(0);
    const playerInFrontDirection = computed<Direction>(() => game.value.players[playerInFrontIndex.value]!.direction);

    function isLegalMove(from: string, to: string): boolean {
        return game.value.isLegalMove(from, to);
    }

    function tryMove(from: string, to: string): Move | null {
        const move = game.value.tryMove(from, to);
        if (move) {
            board.value.carryOutMove(move);
            squares.value = board.value.getSquares();
            legalMoves.value = game.value.getLegalMoves();
            lastHalfmoveIndex.value++;
            activeHalfmoveIndex.value++;
        }
        return move;
    }

    function spinChessboard(): void {
        playerInFrontIndex.value = (playerInFrontIndex.value + 1) % game.value.players.length;
    }

    function goToMove(halfmoveIndex: number): void {
        if (
            halfmoveIndex !== activeHalfmoveIndex.value &&
            halfmoveIndex > 0 &&
            halfmoveIndex <= lastHalfmoveIndex.value
        ) {
            const fen: string | undefined = history.value[halfmoveIndex]?.fen;
            if (fen) {
                board.value.fill(fen);
                squares.value = board.value.getSquares();
                activeHalfmoveIndex.value = halfmoveIndex;
            }
        }
    }

    function goToFirstMove(): void {
        if (activeHalfmoveIndex.value > 1) {
            goToMove(1);
        }
    }

    function goToPreviousMove(): void {
        if (activeHalfmoveIndex.value > 1) {
            goToMove(activeHalfmoveIndex.value - 1);
        }
    }

    function goToNextMove(): void {
        if (activeHalfmoveIndex.value < lastHalfmoveIndex.value) {
            goToMove(activeHalfmoveIndex.value + 1);
        }
    }

    function goToLastMove(): void {
        if (activeHalfmoveIndex.value < lastHalfmoveIndex.value) {
            goToMove(lastHalfmoveIndex.value);
        }
    }

    function cancelLastMove(): Move | null {
        const move = game.value.cancelLastMove();
        if (move) {
            board.value.undoMove(move);
            squares.value = board.value.getSquares();
            legalMoves.value = game.value.getLegalMoves();
            lastHalfmoveIndex.value--;
            activeHalfmoveIndex.value--;
        }
        return move;
    }

    return {
        rows,
        columns,
        squares,
        legalMoves,
        playerInFrontIndex,
        playerInFrontDirection,

        isLegalMove,
        tryMove,
        spinChessboard,
        goToFirstMove,
        goToPreviousMove,
        goToNextMove,
        goToLastMove,
        cancelLastMove,
    };
}

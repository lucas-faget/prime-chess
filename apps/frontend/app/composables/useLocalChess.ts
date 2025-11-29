import { useSettings } from "./useSettings";
import {
    chess,
    Directions,
    type Chess,
    type Chessboard,
    type Direction,
    type HistoryEntry,
    type LegalMoves,
    type Move,
    type Player,
    type Squares,
} from "@primechess/chess-lib";

export function useLocalChess() {
    const { isChessboardSpinAutomatic } = useSettings();

    const game = ref<Chess>(chess.new());
    const players: Player[] = game.value.players;
    const activePlayerIndex = ref<number>(game.value.getActivePlayerIndex());
    const board = ref<Chessboard>(game.value.getChessboard());
    const squares = ref<Squares>(board.value.getSquares());
    const legalMoves = ref<LegalMoves>(game.value.getLegalMoves());
    const history = ref<HistoryEntry[]>(game.value.getHistory());
    const algebraicMoves = ref<string[]>([]);
    const lastHalfmoveIndex = ref<number>(0);
    const activeHalfmoveIndex = ref<number>(0);
    const playerInFrontIndex = ref<number>(0);
    const playerInFrontDirection = computed<Direction>(
        () => game.value.players[playerInFrontIndex.value]?.direction ?? Directions.Up,
    );
    const rows = computed<string[]>(() =>
        playerInFrontIndex.value === 0 ? [...board.value.ranks].reverse() : board.value.ranks,
    );
    const columns = computed<string[]>(() =>
        playerInFrontIndex.value === 0 ? board.value.files : [...board.value.files].reverse(),
    );
    const activeMove = computed<Move | null>(() => history.value[activeHalfmoveIndex.value]?.move ?? null);

    function isLegalMove(from: string, to: string): boolean {
        return game.value.isLegalMove(from, to);
    }

    function tryMove(from: string, to: string): Move | null {
        const move = game.value.tryMove(from, to);
        if (move) {
            board.value.carryOutMove(move);
            squares.value = board.value.getSquares();
            legalMoves.value = game.value.getLegalMoves();
            algebraicMoves.value = history.value.slice(1).map((entry) => entry.move?.algebraic ?? "");
            lastHalfmoveIndex.value++;
            activeHalfmoveIndex.value++;
            activePlayerIndex.value = game.value.getActivePlayerIndex();
            if (isChessboardSpinAutomatic()) {
                playerInFrontIndex.value = activePlayerIndex.value;
            }
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
            algebraicMoves.value = history.value.slice(1).map((entry) => entry.move?.algebraic ?? "");
            lastHalfmoveIndex.value--;
            activeHalfmoveIndex.value--;
            activePlayerIndex.value = game.value.getActivePlayerIndex();
            if (isChessboardSpinAutomatic()) {
                playerInFrontIndex.value = activePlayerIndex.value;
            }
        }
        return move;
    }

    return {
        players,
        rows,
        columns,
        squares,
        legalMoves,
        algebraicMoves,
        activeHalfmoveIndex,
        playerInFrontIndex,
        playerInFrontDirection,
        activeMove,

        isLegalMove,
        tryMove,
        spinChessboard,
        goToMove,
        goToFirstMove,
        goToPreviousMove,
        goToNextMove,
        goToLastMove,
        cancelLastMove,
    };
}

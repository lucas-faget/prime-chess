import { ChessVariant, type GameState } from "@primechess/types";
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

export function useLocalChess(state: GameState | null = null) {
    const { isChessboardSpinAutomatic } = useSettings();

    const game = ref<Chess>(initGame(state));
    const players: Player[] = game.value.players;
    const activePlayerIndex = ref<number>(game.value.getActivePlayerIndex());
    const board = ref<Chessboard>(game.value.getChessboard());
    const squares = ref<Squares>(board.value.getSquares());
    const legalMoves = ref<LegalMoves>(game.value.getLegalMoves());
    const history = ref<HistoryEntry[]>(game.value.getHistory());
    const algebraicMoves = ref<string[]>(history.value.slice(1).map((entry) => entry.move?.algebraic ?? ""));
    const lastHalfmoveIndex = ref<number>(history.value.length - 1);
    const activeHalfmoveIndex = ref<number>(lastHalfmoveIndex.value);
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
    const fen = computed<string | null>(() => history.value[lastHalfmoveIndex.value]?.fen ?? null);
    const activeMove = computed<Move | null>(() => history.value[activeHalfmoveIndex.value]?.move ?? null);
    const checkedSquare = computed<string | null>(
        () => history.value[activeHalfmoveIndex.value]?.checkedSquare ?? null,
    );

    function initGame(state: GameState | null = null): Chess {
        if (state?.initialFen) {
            const c: Chess = chess.fromFen(state.initialFen);
            for (const move of state.moves) {
                c.tryMove(move.from, move.to);
            }
            return c;
        } else {
            switch (state?.variant) {
                case ChessVariant.FischerRandom:
                    return chess.fischerRandom();
                case ChessVariant.Standard:
                default:
                    return chess.new();
            }
        }
    }

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
        fen,
        activeMove,
        checkedSquare,

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

import { Transmit } from "@adonisjs/transmit-client";
import { useSettings } from "./useSettings";
import {
    chessboard,
    Directions,
    type Chessboard,
    type Direction,
    type HistoryEntry,
    type LegalMoves,
    type Move,
    type Player,
    type Squares,
} from "@primechess/chess-lib";

export async function useOnlineChess() {
    const { isChessboardSpinAutomatic } = useSettings();

    let transmit: Transmit | null = null;

    const gameId = ref<string | undefined>(undefined);
    const players = ref<Player[]>([]);
    const playerIndex = ref<number | undefined>(undefined);
    const activePlayerIndex = ref<number>(0);
    const board = ref<Chessboard>(chessboard.new());
    const squares = ref<Squares>(board.value.getSquares());
    const legalMoves = ref<LegalMoves>({});
    const history = ref<HistoryEntry[]>([]);
    const algebraicMoves = ref<string[]>([]);
    const lastHalfmoveIndex = ref<number>(0);
    const activeHalfmoveIndex = ref<number>(0);
    const playerInFrontIndex = ref<number>(0);
    const playerInFrontDirection = computed<Direction>(() => Directions.Up);
    const rows = computed<string[]>(() =>
        playerInFrontIndex.value === 0 ? [...board.value.ranks].reverse() : board.value.ranks,
    );
    const columns = computed<string[]>(() =>
        playerInFrontIndex.value === 0 ? board.value.files : [...board.value.files].reverse(),
    );
    const activeMove = computed<Move | null>(() => history.value[activeHalfmoveIndex.value]?.move ?? null);

    onMounted(async () => {
        transmit = new Transmit({
            baseUrl: "http://localhost:3333",
        });
    });

    async function join(id: string | undefined = undefined): Promise<void> {
        if (!transmit) return;

        const url: string = id ? `http://localhost:3333/games/${id}/join` : "http://localhost:3333/games/create";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-uid": transmit.uid,
            },
        });

        const data = await response.json();

        if (data.gameId) {
            gameId.value = data.gameId;
            players.value = data.players;
            playerIndex.value = data.playerIndex;
            activePlayerIndex.value = data.activePlayerIndex;
            board.value.fill(data.chessboardFen);
            legalMoves.value = playerIndex.value === data.activePlayerIndex ? data.legalMoves : {};
            history.value = data.history;

            const subscription = transmit.subscription(`games/${gameId.value}`);
            await subscription.create();

            subscription.onMessage((data: any) => {
                activePlayerIndex.value = data.activePlayerIndex;
                board.value.fill(data.chessboardFen);
                squares.value = board.value.getSquares();
                legalMoves.value = playerIndex.value === data.activePlayerIndex ? data.legalMoves : {};
                history.value = data.history;
                algebraicMoves.value = history.value.slice(1).map((entry) => entry.move?.algebraic ?? "");
                lastHalfmoveIndex.value++;
                activeHalfmoveIndex.value++;
                if (isChessboardSpinAutomatic()) {
                    playerInFrontIndex.value = activePlayerIndex.value;
                }
            });
        }
    }

    async function move(from: string, to: string): Promise<void> {
        if (!transmit || !gameId.value) return;

        const response = await fetch(`http://localhost:3333/games/${gameId.value}/move`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-uid": transmit.uid,
            },
            body: JSON.stringify({ from, to }),
        });

        await response.json();
    }

    function isLegalMove(from: string, to: string): boolean {
        return !!legalMoves.value[from]?.[to];
    }

    async function tryMove(from: string, to: string): Promise<void> {
        await move(from, to);
    }

    function spinChessboard(): void {
        playerInFrontIndex.value = (playerInFrontIndex.value + 1) % players.value.length;
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
        return null;
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

        join,
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

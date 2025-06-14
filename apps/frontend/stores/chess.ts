import { defineStore } from "pinia";
import { useSettings } from "~/composables/useSettings";
import { ChessVariant } from "@chess/types/ChessVariant";
import type { PlayerColor } from "@chess/types/PlayerColor";
import type { SerializedPlayer } from "@chess/serialization/SerializedPlayer";
import type { SerializedPiece } from "@chess/serialization/SerializedPiece";
import type { SerializedMove } from "@chess/serialization/SerializedMove";
import type { SerializedLegalMoves } from "@chess/serialization/SerializedLegalMoves";
import { TwoPlayerChessboard } from "@chess/chessboards/TwoPlayerChessboard";
import { Chess } from "@chess/games/Chess";

const { isChessboardSpinAutomatic } = useSettings();

export const useChessStore = defineStore("chess", {
    state: () => ({
        variant: null as ChessVariant | null,
        chess: null as Chess | null,
        players: [] as SerializedPlayer[],
        activePlayerIndex: 0,
        lastHalfmoveIndex: 0,
        activeHalfmoveIndex: 0,
        algebraicMoves: [] as string[],
        legalMoves: {} as SerializedLegalMoves,
        chessboard: null as TwoPlayerChessboard | null,
        playerInFrontIndex: 0,
        gameOver: false as boolean,
        checkmatePiece: undefined as SerializedPiece | undefined,
        winnerPlayerIndex: undefined as number | undefined,
    }),
    getters: {
        isActiveMoveTheLast: (state) => state.lastHalfmoveIndex === state.activeHalfmoveIndex,
    },
    actions: {
        gameExists(): boolean {
            return this.chess !== null;
        },
        async createChessGame(variant: ChessVariant = ChessVariant.Standard) {
            this.variant = variant;
            this.chess = new Chess(variant);
            this.activePlayerIndex = this.chess.activePlayerIndex;
            this.players = this.chess.players.map((player) => {
                return {
                    name: player.name,
                    color: player.color as string,
                };
            });
            this.lastHalfmoveIndex = 0;
            this.activeHalfmoveIndex = 0;
            this.legalMoves = this.chess.serializeLegalMoves();
            this.chessboard = new TwoPlayerChessboard(this.chess.getFenPositionByIndex(this.activeHalfmoveIndex));
            this.playerInFrontIndex = this.activePlayerIndex;
        },
        fillChessboard(fenPosition: string) {
            this.chessboard?.fill(fenPosition);
        },
        getActivePlayerColor(): PlayerColor | null {
            return this.chess?.getActivePlayer().color ?? null;
        },
        getActiveMove(): SerializedMove | null {
            return this.chess?.getHalfmove(this.activeHalfmoveIndex) ?? null;
        },
        getCheckedSquare(): string | null {
            return this.chess?.getCheckedSquare() ?? null;
        },
        checkLegalMove(fromSquareName: string, toSquareName: string): boolean {
            return fromSquareName in this.legalMoves && toSquareName in this.legalMoves[fromSquareName];
        },
        getLegalMove(fromSquareName: string, toSquareName: string): SerializedMove | null {
            return this.chess?.getLegalMove(fromSquareName, toSquareName)?.serialize() ?? null;
        },
        carryOutMove(move: SerializedMove) {
            this.chessboard?.move(move);
        },
        undoMove(move: SerializedMove) {
            this.chessboard?.undoMove(move);
        },
        tryMove(fromSquareName: string, toSquareName: string) {
            if (this.chess && this.isActiveMoveTheLast) {
                const move: SerializedMove = this.chess.tryMove(fromSquareName, toSquareName) as SerializedMove;
                if (move) {
                    this.carryOutMove(move);
                    this.activePlayerIndex = this.chess.activePlayerIndex;
                    this.lastHalfmoveIndex++;
                    this.activeHalfmoveIndex++;
                    this.algebraicMoves = this.chess.getAlgebraicMoves();
                    this.legalMoves = this.chess.serializeLegalMoves() ?? {};
                    if (isChessboardSpinAutomatic()) {
                        this.playerInFrontIndex = this.activePlayerIndex;
                    }
                    this.gameOver = this.chess.gameOver;
                    this.checkmatePiece = this.chess.checkmatePiece?.serialize() ?? undefined;
                    if (this.checkmatePiece) {
                        this.winnerPlayerIndex = this.players.findIndex(
                            (player) => this.checkmatePiece && player.color === this.checkmatePiece.color
                        );
                    }
                }
            }
        },
        spinChessboard() {
            const index = (this.playerInFrontIndex + 1) % this.players.length;
            this.playerInFrontIndex = index;
        },
        goToMove(moveIndex: number) {
            if (
                this.chess &&
                this.variant !== ChessVariant.FogOfWar &&
                moveIndex !== this.activeHalfmoveIndex &&
                moveIndex > 0 &&
                moveIndex <= this.lastHalfmoveIndex
            ) {
                const fenPosition: string = this.chess.getFenPositionByIndex(moveIndex);
                this.chessboard?.empty();
                this.fillChessboard(fenPosition);
                this.activeHalfmoveIndex = moveIndex;
            }
        },
        goToFirstMove() {
            if (this.activeHalfmoveIndex > 1) {
                this.goToMove(1);
            }
        },
        goToPreviousMove() {
            if (this.activeHalfmoveIndex > 1) {
                this.goToMove(this.activeHalfmoveIndex - 1);
            }
        },
        goToNextMove() {
            if (this.activeHalfmoveIndex < this.lastHalfmoveIndex) {
                this.goToMove(this.activeHalfmoveIndex + 1);
            }
        },
        goToLastMove() {
            if (this.activeHalfmoveIndex < this.lastHalfmoveIndex) {
                this.goToMove(this.lastHalfmoveIndex);
            }
        },
        cancelLastMove() {
            if (this.chess && this.isActiveMoveTheLast) {
                const move: SerializedMove = this.chess.cancelLastMove() as SerializedMove;
                if (move) {
                    this.undoMove(move);
                    this.activePlayerIndex = this.chess.activePlayerIndex;
                    this.lastHalfmoveIndex--;
                    this.activeHalfmoveIndex--;
                    this.algebraicMoves = this.chess.getAlgebraicMoves();
                    this.legalMoves = this.chess.serializeLegalMoves() ?? {};
                    this.gameOver = this.chess.gameOver;
                    this.checkmatePiece = undefined;
                    this.winnerPlayerIndex = undefined;
                }
            }
        },
    },
});

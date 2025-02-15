import { defineStore } from "pinia";
import { useSettings } from "~/composables/useSettings";
import { Chess } from "@shared/chess/games/Chess.ts";
import { type VPlayer, type VPiece, type VMove, type VLegalMoves, VChessboard } from "~/types";
import { ChessVariant } from "@shared/chess/types/ChessVariant.ts";

const { isChessboardSpinAutomatic } = useSettings();

export const useChessStore = defineStore("chess", {
    state: () => ({
        variant: null as ChessVariant | null,
        chess: null as Chess | null,
        players: [] as VPlayer[],
        activePlayerIndex: 0,
        lastHalfmoveIndex: 0,
        activeHalfmoveIndex: 0,
        algebraicMoves: [] as string[],
        legalMoves: {} as VLegalMoves,
        chessboard: null as VChessboard | null,
        playerInFrontIndex: 0,
        gameOver: false as boolean,
        checkmatePiece: undefined as VPiece | undefined,
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
            this.chess = new Chess(variant as string);
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
            this.chessboard = new VChessboard(
                this.chess.chessboard.ranks,
                this.chess.chessboard.files,
                this.chess.getChessboardPositionByIndex(this.activeHalfmoveIndex)
            );
            this.playerInFrontIndex = this.activePlayerIndex;
        },
        fillChessboard(position: string) {
            this.chessboard?.fill(position);
        },
        getActiveMove(): VMove | null {
            return this.chess?.getHalfmove(this.activeHalfmoveIndex) ?? null;
        },
        getCheckedSquare(): string | null {
            return this.chess?.getCheckedSquare() ?? null;
        },
        checkLegalMove(fromSquareName: string, toSquareName: string): boolean {
            return fromSquareName in this.legalMoves && toSquareName in this.legalMoves[fromSquareName];
        },
        getLegalMove(fromSquareName: string, toSquareName: string): VMove | null {
            return this.chess?.getLegalMove(fromSquareName, toSquareName)?.serialize() ?? null;
        },
        carryOutMove(move: VMove) {
            this.chessboard?.carryOutMove(move);
        },
        undoMove(move: VMove) {
            this.chessboard?.undoMove(move);
        },
        tryMove(fromSquareName: string, toSquareName: string) {
            if (this.chess && this.isActiveMoveTheLast) {
                const move: VMove = this.chess.tryMove(fromSquareName, toSquareName) as VMove;
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
                moveIndex !== this.activeHalfmoveIndex &&
                moveIndex > 0 &&
                moveIndex <= this.lastHalfmoveIndex
            ) {
                const position: string = this.chess.getChessboardPositionByIndex(moveIndex);
                this.fillChessboard(position);
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
                const move: VMove = this.chess.cancelLastMove() as VMove;
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

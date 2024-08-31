import { ChessVariant } from "../types/ChessVariant";
import type { Coordinates } from "../coordinates/Position";
import type { PlayerColor } from "../types/PlayerColor";
import type { Player } from "../players/Player";
import { Blacks, Golds, Silvers, Whites } from "../players/Players";
import type { Square } from "../squares/Square";
import type { Move } from "../moves/Move";
import type { LegalMoves } from "../types/LegalMoves";
import type { GameState } from "../types/GameState";
import type { Chessboard } from "../chessboards/Chessboard";
import { TwoPlayerChessboard } from "../chessboards/TwoPlayerChessboard";
import { FourPlayerChessboard } from "../chessboards/FourPlayerChessboard";
import type { SerializedMove } from "../serialization/SerializedMove";
import type { SerializedLegalMoves } from "../serialization/SerializedLegalMoves";

const isChessVariant = (variant: string) =>
    Object.values(ChessVariant).includes(variant.toLowerCase() as ChessVariant);

export class Chess {
    static TwoPlayerFenPosition: string =
        "bRbNbBbQbKbBbNbR/bPbPbPbPbPbPbPbP/8/8/8/8/wPwPwPwPwPwPwPwP/wRwNwBwQwKwBwNwR";
    static FourPlayerFenPosition: string =
        "3bRbNbBbKbQbBbNbR3/" +
        "3bPbPbPbPbPbPbPbP3/" +
        "14/" +
        "sRsP10gPgR/" +
        "sNsP10gPgN/" +
        "sBsP10gPgB/" +
        "sQsP10gPgK/" +
        "sKsP10gPgQ/" +
        "sBsP10gPgB/" +
        "sNsP10gPgN/" +
        "sRsP10gPgR/" +
        "14/" +
        "3wPwPwPwPwPwPwPwP3/" +
        "3wRwNwBwQwKwBwNwR3";

    variant: ChessVariant;
    players: Player[];
    chessboard: Chessboard;
    legalMoves: LegalMoves = {};
    gameStates: GameState[] = [];

    activePlayerIndex = 0;
    currentMoveIndex: number = 0;

    constructor(variant: string = "", fenPosition: string = "") {
        this.variant = isChessVariant(variant) ? (variant as ChessVariant) : ChessVariant.Standard;
        this.players =
            variant === ChessVariant.FourPlayer
                ? [Whites, Silvers, Blacks, Golds]
                : [Whites, Blacks];
        this.chessboard =
            variant === ChessVariant.FourPlayer
                ? new FourPlayerChessboard(
                      fenPosition !== "" ? fenPosition : Chess.FourPlayerFenPosition
                  )
                : new TwoPlayerChessboard(
                      fenPosition !== "" ? fenPosition : Chess.TwoPlayerFenPosition
                  );

        this.addNewGameState();

        this.setLegalMoves();
    }

    setLegalMoves(): void {
        const player: Player = this.players[this.activePlayerIndex];
        const kingSquare: Square | null = this.chessboard.findKingSquare(player.color);
        const enPassantTarget: string | null =
            this.gameStates[this.currentMoveIndex].enPassantTarget;

        this.legalMoves = this.chessboard.calculateLegalMoves(player, kingSquare, enPassantTarget);
    }

    isLegalMove(fromSquareName: string, toSquareName: string): boolean {
        return fromSquareName in this.legalMoves && toSquareName in this.legalMoves[fromSquareName];
    }

    getLegalMove(fromSquareName: string, toSquareName: string): Move | null {
        return this.isLegalMove(fromSquareName, toSquareName)
            ? this.legalMoves[fromSquareName][toSquareName]
            : null;
    }

    isActiveMoveTheLast(): boolean {
        return this.currentMoveIndex === this.gameStates.length - 1;
    }

    isPlayerActive(color: PlayerColor): boolean {
        return this.isActiveMoveTheLast() && this.players[this.activePlayerIndex].color === color;
    }

    setNextPlayer(): void {
        this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    }

    setPreviousPlayer(): void {
        this.activePlayerIndex =
            (this.activePlayerIndex - 1 + this.players.length) % this.players.length;
    }

    addNewGameState(enPassantTarget: string | null = null): void {
        this.gameStates.push({
            move: null,
            enPassantTarget: enPassantTarget,
        });
    }

    getMoveByIndex(index: number): SerializedMove | null {
        if (index >= 0 && index < this.gameStates.length) {
            return this.gameStates[index].move?.serialize() ?? null;
        }

        return null;
    }

    tryMove(fromSquareName: string, toSquareName: string): SerializedMove | null {
        if (this.isActiveMoveTheLast()) {
            if (this.isLegalMove(fromSquareName, toSquareName)) {
                const move = this.getLegalMove(fromSquareName, toSquareName);
                if (move) {
                    this.move(move);
                    return move.serialize();
                }
            }
        }

        return null;
    }

    move(move: Move): void {
        move.carryOutMove();
        this.gameStates[this.currentMoveIndex].move = move;
        this.addNewGameState(move.enPassantTarget);
        this.currentMoveIndex++;
        this.setNextPlayer();
        this.setLegalMoves();
    }

    cancelLastMove(): SerializedMove | null {
        if (this.isActiveMoveTheLast()) {
            if (this.gameStates.length > 1) {
                this.gameStates.pop();
                this.currentMoveIndex--;
                const move: Move | null = this.gameStates[this.currentMoveIndex].move;
                move?.undoMove();
                this.gameStates[this.currentMoveIndex].move = null;
                this.setPreviousPlayer();
                this.setLegalMoves();
                return move?.serialize() ?? null;
            }
        }

        return null;
    }

    resetGame(): void {
        if (!this.isActiveMoveTheLast()) {
            this.goToLastMove();
        }

        while (this.gameStates.length > 1) {
            this.cancelLastMove();
        }
    }

    goToPreviousMove(): void {
        if (this.currentMoveIndex > 0) {
            this.currentMoveIndex--;
            this.gameStates[this.currentMoveIndex].move!.undoMove();
        }
    }

    goToFirstMove(): void {
        while (this.currentMoveIndex > 0) {
            this.goToPreviousMove();
        }
    }

    goToNextMove(): void {
        if (this.currentMoveIndex < this.gameStates.length - 1) {
            this.gameStates[this.currentMoveIndex].move!.carryOutMove();
            this.currentMoveIndex++;
        }
    }

    goToLastMove(): void {
        while (this.currentMoveIndex < this.gameStates.length - 1) {
            this.goToNextMove();
        }
    }

    static areEqualCoordinates(corrdinates1: Coordinates, coordinates2: Coordinates): boolean {
        return corrdinates1.x === coordinates2.x && coordinates2.y === coordinates2.y;
    }

    serializeLegalMoves(): SerializedLegalMoves {
        const legalMoves: SerializedLegalMoves = {};

        for (const from in this.legalMoves) {
            if (this.legalMoves.hasOwnProperty(from)) {
                legalMoves[from] = {};
                for (const to in this.legalMoves[from]) {
                    if (this.legalMoves[from].hasOwnProperty(to)) {
                        legalMoves[from][to] = true;
                    }
                }
            }
        }

        return legalMoves;
    }
}

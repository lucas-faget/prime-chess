import { ChessVariant } from "../types/ChessVariant";
import type { Coordinates } from "../coordinates/Position";
import { Direction } from "../coordinates/Direction";
import { PlayerColor } from "../types/PlayerColor";
import { PieceName } from "../types/PieceName";
import { Player } from "../players/Player";
import type { Move } from "../moves/Move";
import type { SerializedMove } from "../serialization/SerializedMove";
import type { MoveState } from "../types/MoveState";
import type { LegalMoves } from "../types/LegalMoves";
import type { SerializedLegalMoves } from "../serialization/SerializedLegalMoves";
import type { ChessboardState } from "../types/ChessboardState";
import type { Chessboard } from "../chessboards/Chessboard";
import { TwoPlayerChessboard } from "../chessboards/TwoPlayerChessboard";
import { FourPlayerChessboard } from "../chessboards/FourPlayerChessboard";
import type { Piece } from "../pieces/Piece";

const isChessVariant = (variant: string) => Object.values(ChessVariant).includes(variant.toLowerCase() as ChessVariant);

export class Chess {
    static TwoPlayerChessboardPosition: string =
        "bRbNbBbQbKbBbNbR/bPbPbPbPbPbPbPbP/8/8/8/8/wPwPwPwPwPwPwPwP/wRwNwBwQwKwBwNwR";
    static FourPlayerChessboardPosition: string =
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
    activePlayerIndex: number = 0;
    chessboard: Chessboard;
    legalMoves: LegalMoves = {};
    chessboardHistory: ChessboardState[] = [];
    moveHistory: MoveState[] = [];
    isActivePlayerChecked: boolean = false;
    gameOver: boolean = false;
    checkmatePiece: Piece | undefined = undefined;

    constructor(variant: string = "", position: string = "") {
        this.variant = isChessVariant(variant) ? (variant as ChessVariant) : ChessVariant.Standard;

        this.players =
            variant === ChessVariant.FourPlayer
                ? [
                      new Player(PlayerColor.White, "Whites", Direction.Up),
                      new Player(PlayerColor.Silver, "Silvers", Direction.Right),
                      new Player(PlayerColor.Black, "Blacks", Direction.Down),
                      new Player(PlayerColor.Gold, "Golds", Direction.Left),
                  ]
                : [
                      new Player(PlayerColor.White, "Whites", Direction.Up),
                      new Player(PlayerColor.Black, "Blacks", Direction.Down),
                  ];

        if (!position) {
            position =
                variant === ChessVariant.FourPlayer
                    ? Chess.FourPlayerChessboardPosition
                    : Chess.TwoPlayerChessboardPosition;
        }

        this.chessboard =
            variant === ChessVariant.FourPlayer
                ? new FourPlayerChessboard(position)
                : new TwoPlayerChessboard(position);

        this.setKingSquares();

        this.addPositionToHistory(position);

        this.setLegalMoves();
    }

    setKingSquares(): void {
        for (const [squareName, square] of this.chessboard.squares.entries()) {
            const piece = square.piece;
            if (piece !== null) {
                if (piece.getName() === PieceName.King) {
                    const player: Player | undefined = this.players.find((player) => player.color === piece.color);

                    if (player) {
                        if (player.kingSquare !== null) {
                            throw new Error(`Two kings found for player ${player.color}`);
                        } else {
                            player.kingSquare = square;
                        }
                    }
                }
            }
        }

        for (const player of this.players) {
            if (player.kingSquare === null) {
                throw new Error(`No king found for player ${player.color}`);
            }
        }
    }

    getActivePlayer(): Player {
        return this.players[this.activePlayerIndex];
    }

    isPlayerActive(color: PlayerColor): boolean {
        return this.getActivePlayer().color === color;
    }

    setNextPlayer(): void {
        this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    }

    setPreviousPlayer(): void {
        this.activePlayerIndex = (this.activePlayerIndex - 1 + this.players.length) % this.players.length;
    }

    setLegalMoves(): void {
        const player: Player = this.getActivePlayer();
        if (player.kingSquare !== null) {
            const enPassantTarget: string | null =
                this.chessboardHistory[this.chessboardHistory.length - 1].enPassantTarget;

            this.legalMoves = this.chessboard.calculateLegalMoves(player, enPassantTarget, this);
        }
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

    isLegalMove(fromSquareName: string, toSquareName: string): boolean {
        return fromSquareName in this.legalMoves && toSquareName in this.legalMoves[fromSquareName];
    }

    getLegalMove(fromSquareName: string, toSquareName: string): Move | null {
        return this.isLegalMove(fromSquareName, toSquareName) ? this.legalMoves[fromSquareName][toSquareName] : null;
    }

    getHalfmove(moveIndex: number): SerializedMove | null {
        return moveIndex > 0 && moveIndex <= this.moveHistory.length
            ? this.moveHistory[moveIndex - 1].serialized
            : null;
    }

    getAlgebraicMoves(): string[] {
        return this.moveHistory.map((moveState) => moveState.algebraic);
    }

    getChessboardPositionByIndex(moveIndex: number = this.chessboardHistory.length - 1): string {
        if (moveIndex >= 0 && moveIndex < this.chessboardHistory.length) {
            return this.chessboardHistory[moveIndex].position;
        } else {
            return this.chessboardHistory[this.chessboardHistory.length - 1].position;
        }
    }

    getCheckedSquare(): string | null {
        const player: Player = this.getActivePlayer();
        return player.isChecked && player.kingSquare !== null ? player.kingSquare.name : null;
    }

    move(move: Move): void {
        move.carryOutMove();
        if (move.toSquare.piece?.getName() === PieceName.King) {
            this.getActivePlayer().kingSquare = move.toSquare;
        }
    }

    undoMove(move: Move): void {
        move.undoMove();
        if (move.fromSquare.piece?.getName() === PieceName.King) {
            this.getActivePlayer().kingSquare = move.fromSquare;
        }
    }

    addPositionToHistory(position: string, enPassantTarget: string | null = null) {
        this.chessboardHistory.push({
            position,
            enPassantTarget,
        });
    }

    addMoveToHistory(move: Move) {
        this.moveHistory.push({
            move,
            serialized: move.serialize(),
            algebraic: move.toString(),
        });
    }

    evaluateGameState(): void {
        const player: Player = this.getActivePlayer();
        const checkPiece: Piece | false = this.chessboard.isChecked(player);
        const noLegalMove: boolean = Object.keys(this.legalMoves).length === 0;

        this.gameOver = false;
        this.checkmatePiece = undefined;

        player.isChecked = !!checkPiece;

        if (noLegalMove) {
            this.gameOver = true;
            if (!!checkPiece) {
                this.checkmatePiece = checkPiece;
            }
        }
    }

    performMove(move: Move): void {
        this.getActivePlayer().isChecked = false;
        this.addMoveToHistory(move);
        this.move(move);
        this.addPositionToHistory(this.chessboard.toString(), move.enPassantTarget);
        this.setNextPlayer();
        this.setLegalMoves();
        this.evaluateGameState();
    }

    tryMove(fromSquareName: string, toSquareName: string): SerializedMove | null {
        if (this.isLegalMove(fromSquareName, toSquareName)) {
            const move = this.getLegalMove(fromSquareName, toSquareName);
            if (move) {
                this.performMove(move);
                return this.moveHistory[this.moveHistory.length - 1].serialized;
            }
        }

        return null;
    }

    cancelLastMove(): SerializedMove | null {
        if (this.moveHistory.length > 0) {
            this.chessboardHistory.pop();
            const moveState: any = this.moveHistory.pop();
            this.getActivePlayer().isChecked = false;
            this.undoMove(moveState.move);
            this.setPreviousPlayer();
            this.setLegalMoves();
            this.evaluateGameState();
            return moveState.serialized;
        }

        return null;
    }

    resetGame(): void {
        // TODO
    }

    static areEqualCoordinates(corrdinates1: Coordinates, coordinates2: Coordinates): boolean {
        return corrdinates1.x === coordinates2.x && coordinates2.y === coordinates2.y;
    }
}

import { ChessVariant } from "../types/ChessVariant";
import type { Coordinates } from "../coordinates/Position";
import { Direction } from "../coordinates/Direction";
import { PlayerColor } from "../types/PlayerColor";
import { PieceName } from "../types/PieceName";
import type { Piece } from "../pieces/Piece";
import { Player } from "../players/Player";
import { Square } from "../squares/Square";
import type { Move } from "../moves/Move";
import type { SerializedMove } from "../serialization/SerializedMove";
import type { LegalMoves } from "../types/LegalMoves";
import type { SerializedLegalMoves } from "../serialization/SerializedLegalMoves";
import type { Chessboard } from "../chessboards/Chessboard";
import { TwoPlayerChessboard } from "../chessboards/TwoPlayerChessboard";
import { FourPlayerChessboard } from "../chessboards/FourPlayerChessboard";

const isChessVariant = (variant: string) => Object.values(ChessVariant).includes(variant.toLowerCase() as ChessVariant);

export class Chess {
    variant: ChessVariant;
    players: Player[];
    activePlayerIndex: number = 0;
    chessboard: Chessboard;
    legalMoves: LegalMoves = {};
    fenHistory: string[] = [];
    moveHistory: SerializedMove[] = [];
    isActivePlayerChecked: boolean = false;
    gameOver: boolean = false;
    checkmatePiece: Piece | undefined = undefined;

    constructor(variant: string = "", fenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
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

        this.chessboard =
            variant === ChessVariant.FourPlayer
                ? new FourPlayerChessboard()
                : new TwoPlayerChessboard(fenString.split(" ")[0]);

        this.setKingSquares();

        this.fenHistory.push(fenString);

        console.log(this.fenHistory[this.fenHistory.length - 1]);

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
            this.legalMoves = this.chessboard.calculateLegalMoves(player, this.getEnPassantTargetFromFen());
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
        return moveIndex > 0 && moveIndex <= this.moveHistory.length ? this.moveHistory[moveIndex - 1] : null;
    }

    getAlgebraicMoves(): string[] {
        return this.moveHistory.map((move) => move.algebraic);
    }

    getFenPositionByIndex(moveIndex: number = this.fenHistory.length - 1): string {
        if (moveIndex >= 0 && moveIndex < this.fenHistory.length) {
            return this.fenHistory[moveIndex].split(" ")[0];
        } else {
            return this.fenHistory[this.fenHistory.length - 1].split(" ")[0];
        }
    }

    getCastlingRightsFromFen(): string | null {
        return this.fenHistory.length > 0 ? this.fenHistory[this.fenHistory.length - 1].split(" ")[2] : null;
    }

    getEnPassantTargetFromFen(): string | null {
        return this.fenHistory.length > 0 ? this.fenHistory[this.fenHistory.length - 1].split(" ")[3] : null;
    }

    getCheckedSquare(): string | null {
        const player: Player = this.getActivePlayer();
        return player.isChecked && player.kingSquare !== null ? player.kingSquare.name : null;
    }

    updateKingSquare(player: Player, move: SerializedMove) {
        if (
            !player.kingSquare?.isOccupiedByAlly(player.color) ||
            !player.kingSquare.isOccupiedByPieceName(PieceName.King)
        ) {
            const toSquare: Square | null = this.chessboard.getSquareByName(move.toSquare);
            if (toSquare?.isOccupiedByAlly(player.color) && toSquare.isOccupiedByPieceName(PieceName.King)) {
                player.kingSquare = toSquare;
            } else {
                const fromSquare: Square | null = this.chessboard.getSquareByName(move.fromSquare);
                if (fromSquare?.isOccupiedByAlly(player.color) && fromSquare.isOccupiedByPieceName(PieceName.King)) {
                    player.kingSquare = fromSquare;
                }
            }
        }
    }

    storePosition(move: Move) {
        const position: string = this.chessboard.toString();
        const activePlayer: string = this.getActivePlayer().color;
        let castlingRights: string =
            this.players[0].getCastlingRightString() + this.players[1].getCastlingRightString();
        if (castlingRights.length === 0) {
            castlingRights = "-";
        }
        const enPassantTarget: string = move.enPassantTarget ?? "-";
        const halfmoveClock: number = 0;
        const fullmoveNumber: number = Math.floor(1 + this.moveHistory.length / 2);

        this.fenHistory.push(
            `${position} ${activePlayer} ${castlingRights} ${enPassantTarget} ${halfmoveClock} ${fullmoveNumber}`
        );

        console.log(this.fenHistory[this.fenHistory.length - 1]);
    }

    storeMove(move: Move) {
        this.moveHistory.push(move.serialize());
    }

    evaluateGame(): void {
        const player: Player = this.getActivePlayer();
        const noLegalMove: boolean = Object.keys(this.legalMoves).length === 0;

        this.gameOver = false;
        this.checkmatePiece = undefined;

        if (noLegalMove) {
            this.gameOver = true;
            if (player.isChecked) {
                this.checkmatePiece = player.isChecked;
            }
        }
    }

    performMove(move: Move): void {
        this.getActivePlayer().isChecked = false;
        this.storeMove(move);
        move.carryOutMove();
        this.updateKingSquare(this.getActivePlayer(), this.moveHistory[this.moveHistory.length - 1]);
        this.getActivePlayer().updateCastlingRights(move);
        this.setNextPlayer();
        this.storePosition(move);
        this.getActivePlayer().isChecked = this.chessboard.isChecked(this.getActivePlayer());
        this.setLegalMoves();
        this.evaluateGame();
    }

    tryMove(fromSquareName: string, toSquareName: string): SerializedMove | null {
        if (this.isLegalMove(fromSquareName, toSquareName)) {
            const move = this.getLegalMove(fromSquareName, toSquareName);
            if (move) {
                this.performMove(move);
                return this.moveHistory[this.moveHistory.length - 1];
            }
        }

        return null;
    }

    cancelLastMove(): SerializedMove | null {
        if (this.moveHistory.length > 0 && this.fenHistory.length > 0) {
            const lastMove: SerializedMove | undefined = this.moveHistory.pop();
            const lastFenPosition: string | undefined = this.fenHistory.pop();
            if (lastMove && lastFenPosition) {
                this.getActivePlayer().isChecked = false;
                this.chessboard.undoMove(lastMove);
                this.setPreviousPlayer();
                this.updateKingSquare(this.getActivePlayer(), lastMove);
                this.getActivePlayer().setCastlingRightFromString(this.getCastlingRightsFromFen());
                this.getActivePlayer().isChecked = this.chessboard.isChecked(this.getActivePlayer());
                this.setLegalMoves();
                this.evaluateGame();
                return lastMove;
            }
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

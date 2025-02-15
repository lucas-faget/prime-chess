import type { Coordinates } from "../coordinates/Position";
import { PlayerColor } from "../types/PlayerColor";
import { PieceName } from "../types/PieceName";
import { Bishop } from "../pieces/Bishop";
import { Knight } from "../pieces/Knight";
import { Rook } from "../pieces/Rook";
import { Queen } from "../pieces/Queen";
import type { Player } from "../players/Player";
import { Square } from "../squares/Square";
import type { Move } from "../moves/Move";
import { King } from "../pieces/King";
import type { LegalMoves } from "../types/LegalMoves";
import { Piece } from "../pieces/Piece";
import type { Chess } from "../games/Chess";

const isInteger = (char: string) => !isNaN(parseInt(char));
const isPlayerColor = (char: string) => Object.values(PlayerColor).includes(char.toLowerCase() as PlayerColor);
const isPieceName = (char: string) => Object.values(PieceName).includes(char.toLowerCase() as PieceName);

export abstract class Chessboard {
    static Regex = /([a-zA-Z]{2}|\d+)/g;

    ranks: string[];
    files: string[];
    squares: Map<string, Square> = new Map();

    constructor(ranks: string[], files: string[], position: string = "") {
        this.ranks = ranks;
        this.files = files;

        for (const [y, rank] of this.ranks.entries()) {
            for (const [x, file] of this.files.entries()) {
                let square: Square = new Square(file + rank, { x, y });
                this.squares.set(square.name, square);
            }
        }

        if (position) {
            this.fill(position);
        }
    }

    fill(position: string) {
        if (position) {
            const rows = position.split("/");
            for (const [y, row] of rows.reverse().entries()) {
                let x = 0;
                const segments: string[] = row.match(Chessboard.Regex) || [];
                for (const segment of segments) {
                    if (isInteger(segment)) {
                        x += parseInt(segment);
                    } else {
                        if (segment.length === 2 && isPlayerColor(segment[0]) && isPieceName(segment[1])) {
                            const playerColor: PlayerColor = segment[0].toLowerCase() as PlayerColor;
                            const pieceName: PieceName = segment[1].toLowerCase() as PieceName;
                            this.getSquareByName(this.files[x] + this.ranks[y])?.setPiece(pieceName, playerColor);
                        }
                        x++;
                    }
                }
            }
        }
    }

    getSquareByName(squareName: string): Square | null {
        return this.squares.get(squareName) ?? null;
    }

    getSquareByPosition(position: Coordinates): Square | null {
        if (position.x < 0 || position.y < 0 || position.x >= this.files.length || position.y >= this.ranks.length) {
            return null;
        }

        return this.squares.get(this.files[position.x] + this.ranks[position.y])!;
    }

    getSquareByDirection(square: Square, direction: Coordinates, step: number = 1): Square | null {
        return this.getSquareByPosition({
            x: square.position.x + step * direction.x,
            y: square.position.y + step * direction.y,
        });
    }

    calculateLegalMoves(player: Player, enPassantTarget: string | null, chess: Chess): LegalMoves {
        let legalMoves: LegalMoves = {};

        for (const square of this.squares.values()) {
            if (square.isOccupiedByAlly(player.color)) {
                let moves: Move[] = square.piece!.getMoves(player, square, this, enPassantTarget);

                if (moves) {
                    for (const move of moves) {
                        if (!this.isCheckedByMoving(player, move, chess)) {
                            if (!legalMoves[move.fromSquare.name]) {
                                legalMoves[move.fromSquare.name] = {};
                            }
                            legalMoves[move.fromSquare.name][move.toSquare.name] = move;
                        }
                    }
                }
            }
        }

        return legalMoves;
    }

    isCheckedByMoving(player: Player, move: Move, chess: Chess): boolean {
        let isChecked: boolean = false;

        if (player.kingSquare !== null) {
            chess.move(move);
            isChecked = !!this.isChecked(player);
            chess.undoMove(move);
        }

        return isChecked;
    }

    isChecked(player: Player): Piece | false {
        if (player.kingSquare !== null) {
            return (
                this.isCheckedByMobilePiece(player) ||
                this.isCheckedByKnight(player) ||
                this.isCheckedByPawn(player) ||
                this.isCheckedByKing(player)
            );
        }

        return false;
    }

    isCheckedByPawn(player: Player): Piece | false {
        if (player.kingSquare !== null) {
            let square: Square | null = null;

            for (const direction of Bishop.Directions) {
                if (direction.x === player.direction.x || direction.y === player.direction.y) {
                    square = this.getSquareByDirection(player.kingSquare, direction);
                    if (
                        square &&
                        square.piece &&
                        square.isOccupiedByPieceName(PieceName.Pawn) &&
                        square.isOccupiedByOpponent(player.color)
                    ) {
                        return square.piece;
                    }
                }
            }
        }

        return false;
    }

    isCheckedByKnight(player: Player): Piece | false {
        if (player.kingSquare !== null) {
            let square: Square | null = null;

            for (const direction of Knight.Directions) {
                square = this.getSquareByDirection(player.kingSquare, direction);
                if (
                    square &&
                    square.piece &&
                    square.isOccupiedByPieceName(PieceName.Knight) &&
                    square.isOccupiedByOpponent(player.color)
                ) {
                    return square.piece;
                }
            }
        }

        return false;
    }

    isCheckedByMobilePiece(player: Player): Piece | false {
        if (player.kingSquare !== null) {
            let square: Square | null = null;

            // test if checked by queen, rook or bishop
            for (const direction of Queen.Directions) {
                square = this.getSquareByDirection(player.kingSquare, direction);
                while (square) {
                    if (square.piece) {
                        if (square.isOccupiedByOpponent(player.color)) {
                            if (Rook.Directions.includes(direction)) {
                                if (
                                    square.isOccupiedByPieceName(PieceName.Queen) ||
                                    square.isOccupiedByPieceName(PieceName.Rook)
                                ) {
                                    return square.piece;
                                }
                            } else {
                                if (
                                    square.isOccupiedByPieceName(PieceName.Queen) ||
                                    square.isOccupiedByPieceName(PieceName.Bishop)
                                ) {
                                    return square.piece;
                                }
                            }
                        }
                        break;
                    }
                    square = this.getSquareByDirection(square, direction);
                }
            }
        }

        return false;
    }

    isCheckedByKing(player: Player): Piece | false {
        if (player.kingSquare !== null) {
            let square: Square | null = null;

            for (const direction of King.Directions) {
                square = this.getSquareByDirection(player.kingSquare, direction);
                if (
                    square &&
                    square.piece &&
                    square.isOccupiedByPieceName(PieceName.King) &&
                    square.isOccupiedByOpponent(player.color)
                ) {
                    return square.piece;
                }
            }
        }

        return false;
    }

    toString(): string {
        const rows: string[] = [];

        for (const rank of this.ranks) {
            let row = "";
            let emptySquareCount = 0;

            for (const file of this.files) {
                const square = this.getSquareByName(file + rank);

                if (square?.isEmpty()) {
                    emptySquareCount++;
                } else {
                    if (emptySquareCount > 0) {
                        row += emptySquareCount.toString();
                        emptySquareCount = 0;
                    }
                    if (square?.piece) {
                        const playerColor = square.piece.color.toLowerCase();
                        const pieceName = square.piece.getName().toUpperCase();
                        row += playerColor + pieceName;
                    }
                }
            }

            if (emptySquareCount > 0) {
                row += emptySquareCount.toString();
            }

            rows.push(row);
        }

        return rows.reverse().join("/");
    }
}

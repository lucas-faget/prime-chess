import type { Coordinates } from "../coordinates/Position";
import { PlayerColor } from "../types/PlayerColor";
import { PieceName } from "../types/PieceName";
import { Piece } from "../pieces/Piece";
import { Pawn } from "../pieces/Pawn";
import { Knight } from "../pieces/Knight";
import { Bishop } from "../pieces/Bishop";
import { Rook } from "../pieces/Rook";
import { Queen } from "../pieces/Queen";
import { King } from "../pieces/King";
import type { Player } from "../players/Player";
import { Square } from "../squares/Square";
import type { Move } from "../moves/Move";
import type { SerializedMove } from "../serialization/SerializedMove";
import type { LegalMoves } from "../types/LegalMoves";

export abstract class Chessboard {
    ranks: string[];
    files: string[];
    reversedRanks: string[];
    reversedFiles: string[];
    squares: Map<string, Square> = new Map();

    constructor(ranks: string[], files: string[]) {
        this.ranks = ranks;
        this.files = files;
        this.reversedRanks = [...this.ranks].reverse();
        this.reversedFiles = [...this.files].reverse();

        for (const [y, rank] of this.ranks.entries()) {
            for (const [x, file] of this.files.entries()) {
                let square: Square = new Square(file + rank, { x, y });
                this.squares.set(square.name, square);
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

    getSquareByDirection(square: Square, direction: Coordinates, gap: number = 1): Square | null {
        return this.getSquareByPosition({
            x: square.position.x + gap * direction.x,
            y: square.position.y + gap * direction.y,
        });
    }

    empty() {
        for (const [y, rank] of this.ranks.entries()) {
            for (const [x, file] of this.files.entries()) {
                let square: Square | null = this.getSquareByName(file + rank);
                square && (square.piece = null);
            }
        }
    }

    calculateLegalMoves(player: Player, enPassantTarget: string | null): LegalMoves {
        let legalMoves: LegalMoves = {};

        for (const square of this.squares.values()) {
            if (square.isOccupiedByAlly(player.color)) {
                let moves: Move[] = square.piece!.getMoves(player, square, this, enPassantTarget);

                if (moves) {
                    for (const move of moves) {
                        if (!this.isCheckedByMoving(player, move)) {
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

    isCheckedByMoving(player: Player, move: Move): boolean {
        let isChecked: boolean = false;

        if (player.kingSquare !== null) {
            // If the moving piece is a King, we temporarily store the new King square before we verify if the player is checked
            if (move.fromSquare.isOccupiedByPieceName(PieceName.King)) {
                move.carryOutMove();
                player.kingSquare = move.toSquare;
                isChecked = !!this.isChecked(player);
                move.undoMove();
                player.kingSquare = move.fromSquare;
            } else {
                move.carryOutMove();
                isChecked = !!this.isChecked(player);
                move.undoMove();
            }
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

    move(move: SerializedMove): void {
        const fromSquare: Square | null = this.getSquareByName(move.fromSquare);
        const toSquare: Square | null = this.getSquareByName(move.toSquare);
        const captureSquare: Square | null = move.captureSquare ? this.getSquareByName(move.captureSquare) : null;

        if (fromSquare && fromSquare.piece && toSquare) {
            captureSquare?.piece && (captureSquare.piece = null);
            toSquare.piece = move.isPromoting ? new Queen(fromSquare.piece.color) : fromSquare.piece;
            fromSquare.piece = null;
        }

        if (move.nestedMove) {
            this.move(move.nestedMove);
        }
    }

    undoMove(move: SerializedMove): void {
        const fromSquare: Square | null = this.getSquareByName(move.fromSquare);
        const toSquare: Square | null = this.getSquareByName(move.toSquare);
        const captureSquare: Square | null = move.captureSquare ? this.getSquareByName(move.captureSquare) : null;

        if (move.nestedMove) {
            this.undoMove(move.nestedMove);
        }

        if (fromSquare && toSquare && toSquare.piece) {
            fromSquare.piece = move.isPromoting ? new Pawn(toSquare.piece.color) : toSquare.piece;
            toSquare.piece = null;

            if (captureSquare && move.capturedPiece) {
                captureSquare.setPiece(move.capturedPiece.name as PieceName, move.capturedPiece.color as PlayerColor);
            }
        }
    }
}

import type { Position } from "../coordinates/Position";
import type { Direction } from "@chess/coordinates/Direction";
import { Directions } from "../coordinates/Directions";
import { PieceName } from "../types/PieceName";
import type { PlayerColor } from "../types/PlayerColor";
import { Piece } from "./Piece";
import type { Square } from "../squares/Square";
import type { Player } from "../players/Player";
import { Move } from "../moves/Move";
import { Capture } from "../moves/Capture";
import { Promotion } from "../moves/Promotion";
import { EnPassantCapture } from "../moves/EnPassantCapture";
import type { Chessboard } from "../chessboards/Chessboard";

export class Pawn extends Piece {
    constructor(color: PlayerColor) {
        super(color);
    }

    getName(): PieceName {
        return PieceName.Pawn;
    }

    getMoves(player: Player, fromSquare: Square, chessboard: Chessboard, enPassantTarget: string | null): Move[] {
        let moves: Move[] = [];
        let toSquare: Square | null = fromSquare;

        toSquare = chessboard.getSquareByDirection(toSquare, player.direction);
        if (toSquare && toSquare.isEmpty()) {
            let move: Move;
            if (chessboard.getSquareByDirection(toSquare, player.direction)) {
                move = new Move(fromSquare, toSquare);
            } else {
                move = new Promotion(fromSquare, toSquare, null);
            }
            moves.push(move);

            if (Pawn.isStartingPosition(fromSquare.position, player.direction, chessboard)) {
                toSquare = chessboard.getSquareByDirection(toSquare, player.direction);
                if (toSquare && toSquare.isEmpty()) {
                    let move: Move = new Move(fromSquare, toSquare);
                    move.enPassantTarget = toSquare.name;
                    moves.push(move);
                }
            }
        }

        for (const direction of player.pawnCaptureDirections) {
            toSquare = chessboard.getSquareByDirection(fromSquare, direction);
            if (
                toSquare &&
                toSquare.isOccupiedByOpponent(player.color) &&
                !toSquare.isOccupiedByPieceName(PieceName.King)
            ) {
                let move: Move;
                if (chessboard.getSquareByDirection(toSquare, player.direction)) {
                    move = new Capture(fromSquare, toSquare, toSquare.piece);
                } else {
                    move = new Promotion(fromSquare, toSquare, toSquare.piece);
                }
                moves.push(move);
            }
        }

        return [...moves, ...this.getEnPassantCapture(player, fromSquare, chessboard, enPassantTarget)];
    }

    getEnPassantCapture(
        player: Player,
        fromSquare: Square,
        chessboard: Chessboard,
        enPassantTarget: string | null
    ): Move[] {
        let moves: Move[] = [];

        if (enPassantTarget) {
            let enPassantTargetSquare: Square | null = null;
            let toSquare: Square | null = null;

            for (const direction of player.enPassantCaptureDirections) {
                enPassantTargetSquare = chessboard.getSquareByDirection(fromSquare, direction);
                if (enPassantTargetSquare?.name === enPassantTarget) {
                    toSquare = chessboard.getSquareByDirection(enPassantTargetSquare, player.direction);
                    if (toSquare && toSquare.isEmpty()) {
                        let move: Move = new EnPassantCapture(
                            fromSquare,
                            toSquare,
                            enPassantTargetSquare.piece!,
                            enPassantTargetSquare
                        );
                        moves.push(move);
                    }
                }
            }
        }

        return moves;
    }

    static getCaptureDirections(playerDirection: Direction): Direction[] {
        if (playerDirection.dx === 0 && playerDirection.dy !== 0) {
            return playerDirection.dy > 0
                ? [Directions.UpLeft, Directions.UpRight]
                : [Directions.DownLeft, Directions.DownRight];
        } else {
            if (playerDirection.dy === 0 && playerDirection.dx !== 0) {
                return playerDirection.dx > 0
                    ? [Directions.DownRight, Directions.UpRight]
                    : [Directions.DownLeft, Directions.UpLeft];
            }
        }

        return [];
    }

    static getEnPassantCaptureDirections(playerDirection: Direction): Direction[] {
        if (playerDirection.dx === 0 && playerDirection.dy !== 0) {
            return [Directions.Left, Directions.Right];
        } else {
            if (playerDirection.dy === 0 && playerDirection.dx !== 0) {
                return [Directions.Down, Directions.Up];
            }
        }

        return [];
    }

    static isStartingPosition(position: Position, direction: Direction, chessboard: Chessboard): boolean {
        if (direction.dx === 0 && direction.dy !== 0) {
            return (
                (direction.dy > 0 && position.y === 1) ||
                (direction.dy < 0 && position.y === chessboard.ranks.length - 2)
            );
        } else {
            if (direction.dy === 0 && direction.dx !== 0) {
                return (
                    (direction.dx > 0 && position.x === 1) ||
                    (direction.dx < 0 && position.x === chessboard.ranks.length - 2)
                );
            }
        }

        return false;
    }
}

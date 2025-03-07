import type { Coordinates } from "../coordinates/Position";
import { Direction } from "../coordinates/Direction";
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

    static getCaptureDirections(playerDirection: Coordinates): Coordinates[] {
        if (playerDirection.x === 0 && playerDirection.y !== 0) {
            return playerDirection.y > 0
                ? [Direction.UpLeft, Direction.UpRight]
                : [Direction.DownLeft, Direction.DownRight];
        } else {
            if (playerDirection.y === 0 && playerDirection.x !== 0) {
                return playerDirection.x > 0
                    ? [Direction.DownRight, Direction.UpRight]
                    : [Direction.DownLeft, Direction.UpLeft];
            }
        }

        return [];
    }

    static getEnPassantCaptureDirections(playerDirection: Coordinates): Coordinates[] {
        if (playerDirection.x === 0 && playerDirection.y !== 0) {
            return [Direction.Left, Direction.Right];
        } else {
            if (playerDirection.y === 0 && playerDirection.x !== 0) {
                return [Direction.Down, Direction.Up];
            }
        }

        return [];
    }

    static isStartingPosition(position: Coordinates, direction: Coordinates, chessboard: Chessboard): boolean {
        if (direction.x === 0 && direction.y !== 0) {
            return (
                (direction.y > 0 && position.y === 1) || (direction.y < 0 && position.y === chessboard.ranks.length - 2)
            );
        } else {
            if (direction.y === 0 && direction.x !== 0) {
                return (
                    (direction.x > 0 && position.x === 1) ||
                    (direction.x < 0 && position.x === chessboard.ranks.length - 2)
                );
            }
        }

        return false;
    }
}

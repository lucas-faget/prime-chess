import type { Coordinates } from "../coordinates/Position";
import { Direction } from "../coordinates/Direction";
import { PieceName } from "../types/PieceName";
import { CastlingSide } from "../types/CastlingSide";
import { Piece } from "./Piece";
import { Queen } from "./Queen";
import type { Player } from "../players/Player";
import type { Square } from "../squares/Square";
import { Move } from "../moves/Move";
import { Capture } from "../moves/Capture";
import { Castling } from "../moves/Castling";
import type { Chessboard } from "../chessboards/Chessboard";

export class King extends Piece {
    static Directions: Coordinates[] = Queen.Directions;
    static KingsideCastlingGap: number = 3;
    static QueensideCastlingGap: number = 4;

    getName(): PieceName {
        return PieceName.King;
    }

    getMoves(player: Player, fromSquare: Square, chessboard: Chessboard): Move[] {
        let moves: Move[] = [];
        let toSquare: Square | null = null;

        for (const direction of King.Directions) {
            if ((toSquare = chessboard.getSquareByDirection(fromSquare, direction))) {
                if (toSquare.isEmpty()) {
                    let move: Move = new Move(fromSquare, toSquare);
                    moves.push(move);
                } else {
                    if (
                        toSquare.isOccupiedByOpponent(player.color) &&
                        !toSquare.isOccupiedByPieceName(PieceName.King)
                    ) {
                        let move: Move = new Capture(fromSquare, toSquare, toSquare.piece);
                        moves.push(move);
                    }
                }
            }
        }

        return [...moves, ...this.getCastlingMoves(player, fromSquare, chessboard)];
    }

    getCastlingMoves(player: Player, fromSquare: Square, chessboard: Chessboard): Move[] {
        let moves: Move[] = [];

        if (!player.isChecked && (player.castlingRights.kingside || player.castlingRights.queenside)) {
            let toSquare: Square | null = null;
            let rookSquare: Square | null = null;

            const sides: CastlingSide[] = [];
            player.castlingRights.kingside && sides.push(CastlingSide.Kingside);
            player.castlingRights.queenside && sides.push(CastlingSide.Queenside);

            for (const side of sides) {
                const castlingDirection: Coordinates | null =
                    side === CastlingSide.Kingside
                        ? player.kingsideCastlingDirection
                        : player.queensideCastlingDirection;
                const castlingGap: number =
                    side === CastlingSide.Kingside ? King.KingsideCastlingGap : King.QueensideCastlingGap;

                if (castlingDirection) {
                    toSquare = fromSquare;
                    rookSquare = chessboard.getSquareByDirection(fromSquare, castlingDirection, castlingGap);

                    if (rookSquare && rookSquare.isOccupiedByPieceName(PieceName.Rook)) {
                        toSquare = chessboard.getSquareByDirection(toSquare, castlingDirection);
                        if (toSquare && toSquare.isEmpty()) {
                            let move: Move = new Move(fromSquare, toSquare);
                            if (!chessboard.isCheckedByMoving(player, move)) {
                                toSquare = chessboard.getSquareByDirection(toSquare, castlingDirection);
                                if (toSquare && toSquare.isEmpty()) {
                                    move = new Castling(
                                        fromSquare,
                                        toSquare,
                                        new Move(
                                            rookSquare,
                                            chessboard.getSquareByDirection(fromSquare, castlingDirection)!
                                        ),
                                        side
                                    );
                                    moves.push(move);
                                }
                            }
                        }
                    }
                }
            }
        }

        return moves;
    }

    static getCastlingDirection(castlingSide: CastlingSide, playerDirection: Coordinates): Coordinates | null {
        if (playerDirection.x === 0 && playerDirection.y !== 0) {
            return castlingSide === CastlingSide.Kingside ? Direction.Right : Direction.Left;
        } else {
            if (playerDirection.y === 0 && playerDirection.x !== 0) {
                return castlingSide === CastlingSide.Kingside ? Direction.Down : Direction.Up;
            }
        }

        return null;
    }
}

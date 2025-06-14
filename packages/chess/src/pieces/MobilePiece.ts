import type { Coordinates } from "../coordinates/Position";
import { PieceName } from "../types/PieceName";
import { Piece } from "./Piece";
import type { Player } from "../players/Player";
import type { Square } from "../squares/Square";
import { Move } from "../moves/Move";
import { Capture } from "../moves/Capture";
import type { Chessboard } from "../chessboards/Chessboard";

export abstract class MobilePiece extends Piece {
    directions: Coordinates[] = [];

    getMoves(player: Player, fromSquare: Square, chessboard: Chessboard): Move[] {
        let moves: Move[] = [];
        let toSquare: Square | null = null;

        for (const direction of this.directions) {
            toSquare = fromSquare;
            while ((toSquare = chessboard.getSquareByDirection(toSquare, direction))) {
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
                    break;
                }
            }
        }

        return moves;
    }
}

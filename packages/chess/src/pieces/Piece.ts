import { PlayerColor } from "../types/PlayerColor";
import { PieceName } from "../types/PieceName";
import type { SerializedPiece } from "../serialization/SerializedPiece";
import type { Player } from "../players/Player";
import type { Square } from "../squares/Square";
import type { Move } from "../moves/Move";
import type { Chessboard } from "../chessboards/Chessboard";

export abstract class Piece {
    static valueByPieceName: Map<PieceName, number> = new Map([
        [PieceName.Pawn, 1],
        [PieceName.Knight, 3],
        [PieceName.Bishop, 3],
        [PieceName.Rook, 5],
        [PieceName.Queen, 9],
        [PieceName.King, 0],
    ]);

    color: PlayerColor;

    constructor(color: PlayerColor) {
        this.color = color;
    }

    abstract getName(): PieceName;

    abstract getMoves(player: Player, square: Square, chessboard: Chessboard, enPassantTarget: string | null): Move[];

    serialize(): SerializedPiece {
        return {
            color: this.color as string,
            name: this.getName() as string,
        };
    }

    toString(): string {
        return this.color === PlayerColor.White ? this.getName().toUpperCase() : this.getName();
    }
}

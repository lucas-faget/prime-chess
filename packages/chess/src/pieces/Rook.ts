import type { Coordinates } from "../coordinates/Position";
import { Direction } from "../coordinates/Direction";
import type { PlayerColor } from "../types/PlayerColor";
import { PieceName } from "../types/PieceName";
import { MobilePiece } from "./MobilePiece";

export class Rook extends MobilePiece {
    static Directions: Coordinates[] = [Direction.Up, Direction.Right, Direction.Down, Direction.Left];

    constructor(color: PlayerColor) {
        super(color);
        this.directions = Rook.Directions;
    }

    getName(): PieceName {
        return PieceName.Rook;
    }
}

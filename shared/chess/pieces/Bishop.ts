import type { Coordinates } from "../coordinates/Position";
import { Direction } from "../coordinates/Direction";
import type { PlayerColor } from "../types/PlayerColor";
import { PieceName } from "../types/PieceName";
import { MobilePiece } from "./MobilePiece";

export class Bishop extends MobilePiece {
    static Directions: Coordinates[] = [Direction.UpLeft, Direction.UpRight, Direction.DownRight, Direction.DownLeft];

    constructor(color: PlayerColor) {
        super(color);
        this.directions = Bishop.Directions;
    }

    getName(): PieceName {
        return PieceName.Bishop;
    }
}

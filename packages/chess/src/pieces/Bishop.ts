import type { Direction } from "@chess/coordinates/Direction";
import { Directions } from "../coordinates/Directions";
import type { PlayerColor } from "../types/PlayerColor";
import { PieceName } from "../types/PieceName";
import { MobilePiece } from "./MobilePiece";

export class Bishop extends MobilePiece {
    static Directions: Direction[] = [Directions.UpLeft, Directions.UpRight, Directions.DownRight, Directions.DownLeft];

    constructor(color: PlayerColor) {
        super(color);
        this.directions = Bishop.Directions;
    }

    getName(): PieceName {
        return PieceName.Bishop;
    }
}

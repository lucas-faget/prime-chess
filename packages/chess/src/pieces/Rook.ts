import type { Direction } from "@chess/coordinates/Direction";
import { Directions } from "../coordinates/Directions";
import type { PlayerColor } from "../types/PlayerColor";
import { PieceName } from "../types/PieceName";
import { MobilePiece } from "./MobilePiece";

export class Rook extends MobilePiece {
    static Directions: Direction[] = [Directions.Up, Directions.Right, Directions.Down, Directions.Left];

    constructor(color: PlayerColor) {
        super(color);
        this.directions = Rook.Directions;
    }

    getName(): PieceName {
        return PieceName.Rook;
    }
}

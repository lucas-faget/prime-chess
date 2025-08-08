import type { Direction } from "@chess/coordinates/Direction";
import type { PlayerColor } from "../types/PlayerColor";
import { PieceName } from "../types/PieceName";
import { MobilePiece } from "./MobilePiece";
import { Bishop } from "./Bishop";
import { Rook } from "./Rook";

export class Queen extends MobilePiece {
    static Directions: Direction[] = [...Bishop.Directions, ...Rook.Directions];

    constructor(color: PlayerColor) {
        super(color);
        this.directions = Queen.Directions;
    }

    getName(): PieceName {
        return PieceName.Queen;
    }
}

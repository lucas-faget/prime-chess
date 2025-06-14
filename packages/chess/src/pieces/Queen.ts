import type { Coordinates } from "../coordinates/Position";
import type { PlayerColor } from "../types/PlayerColor";
import { PieceName } from "../types/PieceName";
import { MobilePiece } from "./MobilePiece";
import { Bishop } from "./Bishop";
import { Rook } from "./Rook";

export class Queen extends MobilePiece {
    static Directions: Coordinates[] = [...Bishop.Directions, ...Rook.Directions];

    constructor(color: PlayerColor) {
        super(color);
        this.directions = Queen.Directions;
    }

    getName(): PieceName {
        return PieceName.Queen;
    }
}

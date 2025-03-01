import type { Coordinates } from "../coordinates/Position";
import { Direction } from "../coordinates/Direction";
import { PlayerColor } from "../types/PlayerColor";
import type { CastlingRights } from "../types/CastlingRights";
import { Pawn } from "../pieces/Pawn";
import type { Square } from "../squares/Square";

export class Player {
    name: string;
    color: PlayerColor;
    direction: Coordinates;
    pawnCaptureDirections: Coordinates[];
    enPassantCaptureDirections: Coordinates[];
    castlingRights: CastlingRights;
    kingSquare: Square | null = null;
    isChecked: boolean = false;

    constructor(
        color: PlayerColor,
        name: string,
        direction: Coordinates,
        castlingRights: CastlingRights = { kingside: true, queenside: true }
    ) {
        this.color = color;
        this.name = name;
        this.direction = direction;
        this.pawnCaptureDirections = Pawn.getCaptureDirections(direction);
        this.enPassantCaptureDirections = Pawn.getEnPassantCaptureDirections(direction);
        this.castlingRights = castlingRights;
    }

    kingsideDirection(): Coordinates {
        return this.direction.y === 0 ? Direction.Right : Direction.Down;
    }

    queensideDirection(): Coordinates {
        return this.direction.y === 0 ? Direction.Left : Direction.Up;
    }

    setCastlingRightFromString(castlingRightsString: string): void {
        switch (this.color) {
            case PlayerColor.Black:
                this.castlingRights = {
                    kingside: castlingRightsString.includes("k"),
                    queenside: castlingRightsString.includes("q"),
                };
                break;
            default:
                this.castlingRights = {
                    kingside: castlingRightsString.includes("K"),
                    queenside: castlingRightsString.includes("Q"),
                };
        }
    }

    getCastlingRightString(): string {
        const castlingRights: string =
            (this.castlingRights.kingside ? "K" : "") + (this.castlingRights.queenside ? "Q" : "");

        switch (this.color) {
            case PlayerColor.Black:
                return castlingRights.toLowerCase();
            default:
                return castlingRights;
        }
    }
}

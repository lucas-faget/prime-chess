import type { Coordinates } from "../coordinates/Position";
import { Direction } from "../coordinates/Direction";
import { PlayerColor } from "../types/PlayerColor";
import { PieceName } from "../types/PieceName";
import type { CastlingRights } from "../types/CastlingRights";
import { Piece } from "../pieces/Piece";
import { Pawn } from "../pieces/Pawn";
import { King } from "../pieces/King";
import type { Square } from "../squares/Square";
import { MoveType } from "../types/MoveType";
import { Move } from "../moves/Move";
import { CastlingSide } from "../types/CastlingSide";

export class Player {
    name: string;
    color: PlayerColor;
    direction: Coordinates;
    pawnCaptureDirections: Coordinates[];
    enPassantCaptureDirections: Coordinates[];
    castlingRights: CastlingRights;
    kingsideCastlingDirection: Coordinates | null;
    queensideCastlingDirection: Coordinates | null;
    kingSquare: Square | null = null;
    isChecked: Piece | false = false;

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
        this.kingsideCastlingDirection = King.getCastlingDirection(CastlingSide.Kingside, direction);
        this.queensideCastlingDirection = King.getCastlingDirection(CastlingSide.Queenside, direction);
    }

    kingsideDirection(): Coordinates {
        return this.direction.y === 0 ? Direction.Right : Direction.Down;
    }

    queensideDirection(): Coordinates {
        return this.direction.y === 0 ? Direction.Left : Direction.Up;
    }

    updateCastlingRights(move: Move): void {
        if (this.castlingRights.kingside || this.castlingRights.queenside) {
            if (move.getType() === MoveType.Castling || move.toSquare.isOccupiedByPieceName(PieceName.King)) {
                this.castlingRights.kingside = false;
                this.castlingRights.queenside = false;
            } else {
                if (move.toSquare.isOccupiedByPieceName(PieceName.Rook)) {
                    // TODO
                }
            }
        }
    }

    setCastlingRightFromString(castlingRightsString: string | null): void {
        if (castlingRightsString) {
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

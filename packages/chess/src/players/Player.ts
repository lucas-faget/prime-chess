import type { Direction } from "@chess/coordinates/Direction";
import { Directions } from "../coordinates/Directions";
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
    direction: Direction;
    pawnCaptureDirections: Direction[];
    enPassantCaptureDirections: Direction[];
    castlingRights: CastlingRights;
    kingsideCastlingDirection: Direction | null;
    queensideCastlingDirection: Direction | null;
    kingSquare: Square | null = null;
    isChecked: Piece | false = false;

    constructor(
        color: PlayerColor,
        name: string,
        direction: Direction,
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

    kingsideDirection(): Direction {
        return this.direction.dy === 0 ? Directions.Right : Directions.Down;
    }

    queensideDirection(): Direction {
        return this.direction.dy === 0 ? Directions.Left : Directions.Up;
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

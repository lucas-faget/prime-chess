import { Pawn } from "../pieces/Pawn";
import { Queen } from "../pieces/Queen";
import { MoveType } from "../types/MoveType";
import { Capture } from "./Capture";
import { SerializedMove } from "../serialization/SerializedMove";

export class Promotion extends Capture {
    getType(): MoveType {
        return MoveType.Promotion;
    }

    override carryOutMove(): void {
        this.toSquare.piece = new Queen(this.fromSquare.piece!.color);
        this.fromSquare.piece = null;
    }

    override undoMove(): void {
        this.fromSquare.piece = new Pawn(this.toSquare.piece!.color);
        this.toSquare.piece = this.capturedPiece;
    }

    override serialize(): SerializedMove {
        return {
            ...super.serialize(),
            isPromoting: true,
        };
    }
}

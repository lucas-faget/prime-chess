import { CastlingSide } from "../types/CastlingSide";
import type { Square } from "../squares/Square";
import { Move } from "./Move";
import { MoveType } from "../types/MoveType";
import { SerializedMove } from "../serialization/SerializedMove";

export class Castling extends Move {
    side: CastlingSide;
    rookMove: Move;

    constructor(fromSquare: Square, toSquare: Square, rookMove: Move, side: CastlingSide) {
        super(fromSquare, toSquare);
        this.rookMove = rookMove;
        this.side = side;
    }

    getType(): MoveType {
        return MoveType.Castling;
    }

    override carryOutMove(): void {
        super.carryOutMove();
        this.rookMove.carryOutMove();
    }

    override undoMove(): void {
        super.undoMove();
        this.rookMove.undoMove();
    }

    serialize(): SerializedMove {
        return {
            ...super.serialize(),
            nestedMove: this.rookMove.serialize(),
        };
    }

    override toString(): string {
        return this.side === CastlingSide.Kingside ? "O-O" : "O-O-O";
    }
}

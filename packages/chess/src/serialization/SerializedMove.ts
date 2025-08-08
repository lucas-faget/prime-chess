import type { Position } from "@chess/coordinates/Position";
import type { SerializedPiece } from "./SerializedPiece";

export type SerializedMove = {
    algebraic: string;
    fromPosition: Position;
    toPosition: Position;
    fromSquare: string;
    toSquare: string;
    captureSquare?: string | null;
    capturedPiece?: SerializedPiece | null;
    nestedMove?: SerializedMove | null;
    isPromoting?: boolean;
};

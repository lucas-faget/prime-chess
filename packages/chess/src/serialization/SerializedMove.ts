import type { Coordinates } from "@chess/coordinates/Position";
import type { SerializedPiece } from "./SerializedPiece";

export type SerializedMove = {
    algebraic: string;
    fromPosition: Coordinates;
    toPosition: Coordinates;
    fromSquare: string;
    toSquare: string;
    captureSquare?: string | null;
    capturedPiece?: SerializedPiece | null;
    nestedMove?: SerializedMove | null;
    isPromoting?: boolean;
};

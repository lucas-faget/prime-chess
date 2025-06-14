import type { SerializedPiece } from "./SerializedPiece";

export type SerializedMove = {
    algebraic: string;
    fromSquare: string;
    toSquare: string;
    captureSquare?: string | null;
    capturedPiece?: SerializedPiece | null;
    nestedMove?: SerializedMove | null;
    isPromoting?: boolean;
};

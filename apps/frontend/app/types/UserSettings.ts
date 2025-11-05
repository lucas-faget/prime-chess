import type { SquareColors } from "./SquareColor";

export interface UserSettings {
    darkMode: boolean;
    chessboardColor: SquareColors;
    chessboardSpin: boolean;
    pieceAnimation: boolean;
}

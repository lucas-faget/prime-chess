import type { ChessVariant } from "./ChessVariant";
import type { Move } from "./Move";

export interface GameState {
    variant: ChessVariant;
    initialFen: string | null;
    moves: Move[];
}

import type { Move } from "../moves/Move";

export interface LegalMoves {
    [key: string]: {
        [key: string]: Move;
    };
}

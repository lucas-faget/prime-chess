import { Chess } from "@primechess/chess-lib";
import { ChessVariant } from "@primechess/types";

export interface Game {
    id: string;
    variant: ChessVariant;
    chess: Chess;
    uids: string[];
}

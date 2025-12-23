import { Chess } from "@primechess/chess-lib";

export interface Game {
    id: string;
    variant: number;
    chess: Chess;
    uids: string[];
}

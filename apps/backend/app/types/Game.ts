import { Chess } from "@primechess/chess-lib";

export interface Game {
    id: string;
    chess: Chess;
    uids: string[];
}

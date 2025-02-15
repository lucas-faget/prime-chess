import { Chessboard } from "./Chessboard";

export class FourPlayerChessboard extends Chessboard {
    static Ranks: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"];
    static Files: string[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n"];

    constructor(position: string = "") {
        super(FourPlayerChessboard.Ranks, FourPlayerChessboard.Files, position);
    }
}

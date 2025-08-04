import { PieceName } from "../types/PieceName";
import { PlayerColor } from "../types/PlayerColor";
import { Chessboard } from "./Chessboard";

export class FourPlayerChessboard extends Chessboard {
    static Ranks: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"];
    static Files: string[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n"];

    constructor() {
        super(FourPlayerChessboard.Ranks, FourPlayerChessboard.Files);

        // Fill squares
        this.squares.get("d1")?.setPiece(PieceName.Rook, PlayerColor.White);
        this.squares.get("e1")?.setPiece(PieceName.Knight, PlayerColor.White);
        this.squares.get("f1")?.setPiece(PieceName.Bishop, PlayerColor.White);
        this.squares.get("g1")?.setPiece(PieceName.Queen, PlayerColor.White);
        this.squares.get("h1")?.setPiece(PieceName.King, PlayerColor.White);
        this.squares.get("i1")?.setPiece(PieceName.Bishop, PlayerColor.White);
        this.squares.get("j1")?.setPiece(PieceName.Knight, PlayerColor.White);
        this.squares.get("k1")?.setPiece(PieceName.Rook, PlayerColor.White);
        this.squares.get("d2")?.setPiece(PieceName.Pawn, PlayerColor.White);
        this.squares.get("e2")?.setPiece(PieceName.Pawn, PlayerColor.White);
        this.squares.get("f2")?.setPiece(PieceName.Pawn, PlayerColor.White);
        this.squares.get("g2")?.setPiece(PieceName.Pawn, PlayerColor.White);
        this.squares.get("h2")?.setPiece(PieceName.Pawn, PlayerColor.White);
        this.squares.get("i2")?.setPiece(PieceName.Pawn, PlayerColor.White);
        this.squares.get("j2")?.setPiece(PieceName.Pawn, PlayerColor.White);
        this.squares.get("k2")?.setPiece(PieceName.Pawn, PlayerColor.White);
        this.squares.get("d13")?.setPiece(PieceName.Pawn, PlayerColor.Black);
        this.squares.get("e13")?.setPiece(PieceName.Pawn, PlayerColor.Black);
        this.squares.get("f13")?.setPiece(PieceName.Pawn, PlayerColor.Black);
        this.squares.get("g13")?.setPiece(PieceName.Pawn, PlayerColor.Black);
        this.squares.get("h13")?.setPiece(PieceName.Pawn, PlayerColor.Black);
        this.squares.get("i13")?.setPiece(PieceName.Pawn, PlayerColor.Black);
        this.squares.get("j13")?.setPiece(PieceName.Pawn, PlayerColor.Black);
        this.squares.get("k13")?.setPiece(PieceName.Pawn, PlayerColor.Black);
        this.squares.get("d14")?.setPiece(PieceName.Rook, PlayerColor.Black);
        this.squares.get("e14")?.setPiece(PieceName.Knight, PlayerColor.Black);
        this.squares.get("f14")?.setPiece(PieceName.Bishop, PlayerColor.Black);
        this.squares.get("g14")?.setPiece(PieceName.King, PlayerColor.Black);
        this.squares.get("h14")?.setPiece(PieceName.Queen, PlayerColor.Black);
        this.squares.get("i14")?.setPiece(PieceName.Bishop, PlayerColor.Black);
        this.squares.get("j14")?.setPiece(PieceName.Knight, PlayerColor.Black);
        this.squares.get("k14")?.setPiece(PieceName.Rook, PlayerColor.Black);
        this.squares.get("a4")?.setPiece(PieceName.Rook, PlayerColor.Silver);
        this.squares.get("a5")?.setPiece(PieceName.Knight, PlayerColor.Silver);
        this.squares.get("a6")?.setPiece(PieceName.Bishop, PlayerColor.Silver);
        this.squares.get("a7")?.setPiece(PieceName.King, PlayerColor.Silver);
        this.squares.get("a8")?.setPiece(PieceName.Queen, PlayerColor.Silver);
        this.squares.get("a9")?.setPiece(PieceName.Bishop, PlayerColor.Silver);
        this.squares.get("a10")?.setPiece(PieceName.Knight, PlayerColor.Silver);
        this.squares.get("a11")?.setPiece(PieceName.Rook, PlayerColor.Silver);
        this.squares.get("b4")?.setPiece(PieceName.Pawn, PlayerColor.Silver);
        this.squares.get("b5")?.setPiece(PieceName.Pawn, PlayerColor.Silver);
        this.squares.get("b6")?.setPiece(PieceName.Pawn, PlayerColor.Silver);
        this.squares.get("b7")?.setPiece(PieceName.Pawn, PlayerColor.Silver);
        this.squares.get("b8")?.setPiece(PieceName.Pawn, PlayerColor.Silver);
        this.squares.get("b9")?.setPiece(PieceName.Pawn, PlayerColor.Silver);
        this.squares.get("b10")?.setPiece(PieceName.Pawn, PlayerColor.Silver);
        this.squares.get("b11")?.setPiece(PieceName.Pawn, PlayerColor.Silver);
        this.squares.get("m4")?.setPiece(PieceName.Pawn, PlayerColor.Gold);
        this.squares.get("m5")?.setPiece(PieceName.Pawn, PlayerColor.Gold);
        this.squares.get("m6")?.setPiece(PieceName.Pawn, PlayerColor.Gold);
        this.squares.get("m7")?.setPiece(PieceName.Pawn, PlayerColor.Gold);
        this.squares.get("m8")?.setPiece(PieceName.Pawn, PlayerColor.Gold);
        this.squares.get("m9")?.setPiece(PieceName.Pawn, PlayerColor.Gold);
        this.squares.get("m10")?.setPiece(PieceName.Pawn, PlayerColor.Gold);
        this.squares.get("m11")?.setPiece(PieceName.Pawn, PlayerColor.Gold);
        this.squares.get("n4")?.setPiece(PieceName.Rook, PlayerColor.Gold);
        this.squares.get("n5")?.setPiece(PieceName.Knight, PlayerColor.Gold);
        this.squares.get("n6")?.setPiece(PieceName.Bishop, PlayerColor.Gold);
        this.squares.get("n7")?.setPiece(PieceName.Queen, PlayerColor.Gold);
        this.squares.get("n8")?.setPiece(PieceName.King, PlayerColor.Gold);
        this.squares.get("n9")?.setPiece(PieceName.Bishop, PlayerColor.Gold);
        this.squares.get("n10")?.setPiece(PieceName.Knight, PlayerColor.Gold);
        this.squares.get("n11")?.setPiece(PieceName.Rook, PlayerColor.Gold);
    }
}

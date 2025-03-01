import { PlayerColor } from "../types/PlayerColor";
import { PieceName } from "../types/PieceName";
import { Chessboard } from "./Chessboard";

const isInteger = (char: string) => !isNaN(parseInt(char));
const isPlayerColor = (char: string) => Object.values(PlayerColor).includes(char.toLowerCase() as PlayerColor);
const isPieceName = (char: string) => Object.values(PieceName).includes(char.toLowerCase() as PieceName);

export class TwoPlayerChessboard extends Chessboard {
    static Ranks: string[] = ["1", "2", "3", "4", "5", "6", "7", "8"];
    static Files: string[] = ["a", "b", "c", "d", "e", "f", "g", "h"];

    constructor(fenPositionString: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR") {
        super(TwoPlayerChessboard.Ranks, TwoPlayerChessboard.Files);

        this.fill(fenPositionString);
    }

    fill(fenPositionString: string) {
        if (fenPositionString) {
            const rows = fenPositionString.split("/");
            for (const [y, row] of rows.reverse().entries()) {
                let x = 0;
                for (const char of row) {
                    if (isInteger(char)) {
                        x += parseInt(char);
                    } else {
                        if (isPieceName(char)) {
                            const playerColor: PlayerColor =
                                char === char.toUpperCase() ? PlayerColor.White : PlayerColor.Black;
                            const pieceName: PieceName = char.toLowerCase() as PieceName;
                            this.getSquareByName(this.files[x] + this.ranks[y])?.setPiece(pieceName, playerColor);
                        }
                        x++;
                    }
                }
            }
        }
    }

    override toString(): string {
        const rows: string[] = [];

        for (const rank of this.ranks) {
            let row = "";
            let emptySquareCount = 0;

            for (const file of this.files) {
                const square = this.getSquareByName(file + rank);

                if (square?.isEmpty()) {
                    emptySquareCount++;
                } else {
                    if (emptySquareCount > 0) {
                        row += emptySquareCount.toString();
                        emptySquareCount = 0;
                    }
                    if (square?.piece) {
                        const playerColor = square.piece.color;
                        const pieceName = square.piece.getName();
                        row += playerColor === PlayerColor.White ? pieceName.toUpperCase() : pieceName;
                    }
                }
            }

            if (emptySquareCount > 0) {
                row += emptySquareCount.toString();
            }

            rows.push(row);
        }

        return rows.reverse().join("/");
    }
}

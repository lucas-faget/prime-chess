import type { VMove } from "./Move";
import type { VPiece } from "./Piece";

const isInteger = (char: string) => !isNaN(parseInt(char));

export class VChessboard {
    ranks: string[];
    files: string[];
    reversedRanks: string[];
    reversedFiles: string[];

    squares: Map<string, VPiece | null> = new Map();

    constructor(ranks: string[], files: string[], position: string) {
        this.ranks = ranks;
        this.files = files;
        this.reversedRanks = [...this.ranks].reverse();
        this.reversedFiles = [...this.files].reverse();

        this.fill(position);
    }

    fill(position: string) {
        for (const rank of this.ranks) {
            for (const file of this.files) {
                const squareName: string = file + rank;
                this.squares.set(squareName, null);
            }
        }

        if (position) {
            const rows = position.split("/");
            for (const [y, row] of rows.reverse().entries()) {
                let x = 0;
                for (const char of row) {
                    if (isInteger(char)) {
                        x += parseInt(char);
                    } else {
                        const color: string = char === char.toUpperCase() ? "w" : "b";
                        const name: string = char.toLowerCase();
                        this.squares.set(this.files[x] + this.ranks[y], {
                            color: color,
                            name: name,
                        });
                        x++;
                    }
                }
            }
        }
    }

    carryOutMove(move: VMove) {
        if (this.squares.has(move.fromSquare) && this.squares.has(move.toSquare)) {
            if (move.captureSquare && this.squares.has(move.captureSquare)) {
                this.squares.set(move.captureSquare, null);
            }

            this.squares.set(move.toSquare, this.squares.get(move.fromSquare)!);
            this.squares.set(move.fromSquare, null);
        }
    }

    undoMove(move: VMove) {
        if (this.squares.has(move.fromSquare) && this.squares.has(move.toSquare)) {
            this.squares.set(move.fromSquare, this.squares.get(move.toSquare)!);
            this.squares.set(move.toSquare, null);

            if (move.captureSquare && this.squares.has(move.captureSquare)) {
                this.squares.set(move.captureSquare, move.capturedPiece);
            }
        }
    }
}
